#!/usr/bin/env python3
"""Generate src/data/genomes.json from the organism manifests in local reference storage.

    python3 -I scripts/genomes_from_manifests.py [--root /mnt/nas/omnibioai/reference-genomes]
        [--date "14 Nov 2026"] [--evidence evidence.tsv]

Reads ROOT/organisms/<species>/manifest.yaml (contract v1.1, read-only) and
scripts/genomes-editorial.json (display name, common name, use cases and row order: the only
hand-kept fields). Writes src/data/genomes.json and src/data/genomesMeta.json, then run
`npm run build`.

Badge rules:
- File badges (grey, idx-file): Genome, Transcripts, GTF and Variants, each only if the
  manifest lists a file with status `present` under <assembly>/genome/, transcripts/,
  annotation/ (.gtf or .gtf.gz) or variants/. Assemblies with role reference_copy are ignored.
- Index badges (green, idx-on): only indexes with status `present`. BWA and Bowtie2 count only
  for genome indexes (tag genome_*), so an rRNA-only Bowtie2 index is left off. An index on a
  non-primary assembly is labelled with that assembly, e.g. "STAR (mRatBN7.2)". A Cell Ranger
  reference is labelled with its package (refdata-gex-<asm>-<pkg>), plus "(incl. STAR)" when
  it contains a star/ directory.
- A Cell Ranger reference on disk only as its .tar.gz (manifest status `partial`) gets a grey
  badge "Cell Ranger <pkg> (not extracted)".
- EXCLUDE lists the indexes left off on purpose, with the reason.

--evidence writes one line per badge: species, badge, class, and the manifest.yaml:line entries
that justify it.
"""
import argparse
import datetime
import json
import os
import re
import sys

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

TOOL_LABEL = {"star": "STAR", "bwa": "BWA", "bowtie2": "Bowtie2", "salmon": "Salmon", "cellranger": "Cell Ranger"}
TOOL_ORDER = ["star", "bwa", "bowtie2", "salmon", "cellranger"]
GENOME_ONLY_TOOLS = {"bwa", "bowtie2"}
# (species, tool, version): reason. Shown nowhere; kept here so the omission is reviewed, not silent.
EXCLUDE = {
    ("homo_sapiens", "salmon", "2.1.2"): "built with Salmon 2.1.2; loading it in the pinned 1.10.3 is unverified",
}
VARIANT_LABEL = [
    (re.compile(r"^gnomad_v(.+)$"), lambda m: f"gnomAD v{m[1]}"),
    (re.compile(r"^dbsnp_"), lambda m: "dbSNP"),
    (re.compile(r"^clinvar_"), lambda m: "ClinVar"),
]
FASTA = re.compile(r"\.(fa|fasta|fna)(\.gz)?$")
GTF = re.compile(r"\.gtf(\.gz)?$")


def annotation_label(tag):
    for pat, fmt in (
        (r"^ensembl_(\d+)$", lambda m: f"Ensembl {m[1]}"),
        (r"^ensembl_([a-z]+)_(\d+)$", lambda m: f"Ensembl {m[1].capitalize()} {m[2]}"),
        (r"^gencode_(v\d+|vM\d+)$", lambda m: f"GENCODE {m[1]}"),
        (r"^gencode_(v\d+)(lift\d+)$", lambda m: f"GENCODE {m[1]}{m[2]}"),
        (r"^refseq_", lambda m: "NCBI RefSeq"),
        (r"^ucsc_(\w+)$", lambda m: f"UCSC {m[1]}"),
    ):
        m = re.match(pat, tag)
        if m:
            return fmt(m)
    return tag


def join_gencode(labels):
    """'GENCODE v46', 'GENCODE v47' -> 'GENCODE v46, v47' (other labels kept, order preserved)."""
    out, gencode = [], []
    for label in labels:
        if label.startswith("GENCODE ") and "lift" not in label:
            if not gencode:
                out.append(None)
            gencode.append(label.split(" ", 1)[1])
        elif label not in out:
            out.append(label)
    return ", ".join(f"GENCODE {', '.join(gencode)}" if x is None else x for x in out)


class Manifest:
    def __init__(self, root, sp):
        self.sp = sp
        self.rel = f"organisms/{sp}/manifest.yaml"
        self.text = open(os.path.join(root, self.rel)).read().splitlines()
        self.data = yaml.safe_load("\n".join(self.text))
        self.dir = os.path.join(root, "organisms", sp)

    def line(self, path):
        """manifest.yaml:line of the entry whose `path:` is `path`."""
        for i, t in enumerate(self.text, 1):
            if re.match(rf"^\s*-?\s*path:\s*['\"]?{re.escape(path)}['\"]?\s*$", t):
                return f"{self.rel}:{i}"
        raise SystemExit(f"{self.rel}: no line for path {path}")


def species_row(root, sp, editorial):
    m = Manifest(root, sp)
    d = m.data
    if d.get("species") != sp:
        raise SystemExit(f"{m.rel}: species is {d.get('species')}")
    asms = [(k, a) for k, a in d["assemblies"].items() if a["role"] != "reference_copy"]
    asms.sort(key=lambda ka: ka[1]["role"] != "primary")
    primary = asms[0][0]
    badges = []  # (kind, label, evidence lines)

    def files(pred):
        return [(k, f) for k, a in asms for f in a["files"] if f.get("status") == "present" and "path" in f and pred(f["path"])]

    for label, pred in (
        ("Genome", lambda p: "/genome/" in p and FASTA.search(p)),
        ("Transcripts", lambda p: "/transcripts/" in p),
        ("GTF", lambda p: "/annotation/" in p and GTF.search(p)),
    ):
        hits = files(pred)
        if hits:
            badges.append(("file", label, [m.line(f["path"]) for _, f in hits]))
    variants = files(lambda p: "/variants/" in p)
    if variants:
        tags = []
        for _, f in variants:
            tag = f["path"].split("/variants/")[1].split("/")[0]
            if tag not in tags:
                tags.append(tag)
        sets = []
        for tag in tags:
            for pat, fmt in VARIANT_LABEL:
                mm = pat.match(tag)
                if mm:
                    sets.append(fmt(mm))
                    break
            else:
                sets.append(tag)
        badges.append(("file", f"Variants ({', '.join(sets)})", [m.line(f["path"]) for _, f in variants]))
    else:
        sets = []

    idx = []
    for k, a in asms:
        for i in a["indexes"]:
            tool, ver, tag = i["tool"], str(i["version"]), str(i.get("tag", ""))
            if (sp, tool, ver) in EXCLUDE or tool not in TOOL_LABEL:
                continue
            if tool in GENOME_ONLY_TOOLS and not tag.startswith("genome"):
                continue
            label = TOOL_LABEL[tool]
            ev = [m.line(i["path"])]
            kind = "index"
            if tool == "cellranger":
                ipath = os.path.join(m.dir, i["path"])
                names = os.listdir(ipath)
                pkg = next((re.match(r"refdata-gex-.+-(\d{4}-[A-Z])", n) for n in names if re.match(r"refdata-gex-.+-(\d{4}-[A-Z])", n)), None)
                label = f"Cell Ranger {pkg[1]}" if pkg else label
                extracted = [n for n in names if os.path.isdir(os.path.join(ipath, n))]
                if i["status"] == "present" and extracted and os.path.isdir(os.path.join(ipath, extracted[0], "star")):
                    label += " (incl. STAR)"
                elif i["status"] == "partial" and not extracted and any(n.endswith(".tar.gz") for n in names):
                    label += " (not extracted)"
                    kind = "file"
            if i["status"] != "present" and kind == "index":
                continue
            if k != primary:
                label += f" ({k})"
            idx.append((TOOL_ORDER.index(tool), kind, label, ev))
    for _, kind, label, ev in sorted(idx, key=lambda x: x[0]):
        badges.append((kind, label, ev))

    # Assemblies: primary first. The UCSC alias is shown only for the assemblies the editorial
    # file names in showUcscAlias (the widely used hg38/hg19/mm10 names), and must match the manifest.
    shown = editorial.get("showUcscAlias", [])
    for k in shown:
        if not dict(asms).get(k, {}).get("ucsc_alias"):
            raise SystemExit(f"{m.rel}: showUcscAlias names {k}, which has no ucsc_alias")
    asm_label = ", ".join(f"{k} ({a['ucsc_alias']})" if k in shown else k for k, a in asms)
    # Annotation: release tags of the annotation directories, per assembly.
    per_asm = []
    for k, a in asms:
        tags = []
        for f in a["files"]:
            if f.get("status") == "present" and "/annotation/" in f.get("path", "") and GTF.search(f["path"]):
                t = f["path"].split("/annotation/")[1].split("/")[0]
                if t not in tags:
                    tags.append(t)
        if tags:
            per_asm.append((k, join_gencode([annotation_label(t) for t in tags])))
    annotation = "; ".join(lbl if k == primary else f"{lbl} (on {k})" for k, lbl in per_asm)

    row = {
        "species": editorial.get("species", d["scientific_name"]),
        "commonName": editorial["commonName"],
        "assemblies": asm_label,
        "annotation": annotation,
        "useCases": editorial["useCases"],
        "onDisk": [{kind: label} for kind, label, _ in badges],
    }
    evidence = [(row["species"], label, "idx-on" if kind == "index" else "idx-file", ev) for kind, label, ev in badges]
    return row, evidence, sets


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--root", default="/mnt/nas/omnibioai/reference-genomes")
    ap.add_argument("--date", default=datetime.date.today().strftime("%-d %b %Y"))
    ap.add_argument("--evidence")
    args = ap.parse_args()
    editorial = json.load(open(os.path.join(HERE, "genomes-editorial.json")))
    on_disk = sorted(
        e for e in os.listdir(os.path.join(args.root, "organisms"))
        if not os.path.islink(os.path.join(args.root, "organisms", e)) and os.path.isfile(os.path.join(args.root, "organisms", e, "manifest.yaml"))
    )
    order = [e["slug"] for e in editorial]
    if sorted(order) != on_disk:
        raise SystemExit(f"genomes-editorial.json species {sorted(set(order) ^ set(on_disk))} differ from the manifests on disk")
    rows, evidence, variant_sets = [], [], {}
    for e in editorial:
        row, ev, sets = species_row(args.root, e["slug"], e)
        rows.append(row)
        evidence += ev
        if sets:
            variant_sets[row["commonName"]] = sets
    with open(os.path.join(REPO, "src/data/genomes.json"), "w") as f:
        f.write("[\n" + ",\n".join("  " + json.dumps(r, ensure_ascii=False) for r in rows) + "\n]\n")
    meta = {"measured": args.date, "variantSets": variant_sets, "source": "organism manifests (contract v1.1)"}
    with open(os.path.join(REPO, "src/data/genomesMeta.json"), "w") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
        f.write("\n")
    if args.evidence:
        with open(args.evidence, "w") as f:
            f.write("species\tbadge\tclass\tevidence\n")
            for sp, label, cls, ev in evidence:
                f.write(f"{sp}\t{label}\t{cls}\t{' '.join(ev[:3])}{f' (+{len(ev) - 3} more)' if len(ev) > 3 else ''}\n")
    print(f"wrote {len(rows)} species, {len(evidence)} badges", file=sys.stderr)


if __name__ == "__main__":
    main()
