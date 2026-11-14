import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Builds src/ into public/index.html and public/data/site-data.json.
// Everything else in public/ is hand-maintained and left untouched (Eleventy
// never cleans its output dir).
export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });

  // Inline every file of src/<dir>/ in filename order (01-…, 02-…). Files are
  // read raw, so CSS/JS braces are never parsed as template syntax.
  eleventyConfig.addShortcode("inlineFiles", (dir) => {
    const base = join("src", dir);
    return readdirSync(base)
      .filter((name) => /\.(css|js)$/.test(name))
      .sort()
      .map((name) => readFileSync(join(base, name), "utf8"))
      .join("");
  });

  // Card-catalog counts (integrations, reference databases): groups is an
  // array of { items: [...] }. "implemented" counts items without a status.
  eleventyConfig.addFilter("itemCount", (groups) =>
    groups.reduce((n, group) => n + group.items.length, 0));
  eleventyConfig.addFilter("statusCount", (groups, status) =>
    groups.flatMap((group) => group.items)
      .filter((item) => (status === "implemented" ? !item.status : item.status === status)).length);

  // Genome-table counts for the genomes intro, so its prose follows
  // src/data/genomes.json. A badge matches a tool by its first word, so
  // "STAR (mRatBN7.2)" counts as STAR.
  eleventyConfig.addFilter("withFile", (genomes, file) =>
    genomes.filter((genome) => genome.onDisk.some((asset) => asset.file === file)));
  eleventyConfig.addFilter("withIndex", (genomes, tools) =>
    genomes.filter((genome) =>
      genome.onDisk.some((asset) => asset.index && tools.includes(asset.index.split(" ")[0]))));
  eleventyConfig.addFilter("exceptSpecies", (genomes, species) =>
    genomes.filter((genome) => !species.includes(genome.species)));

  return {
    dir: { input: "src", includes: "_includes", data: "data", output: "public" },
    templateFormats: ["njk", "11ty.js"],
  };
}
