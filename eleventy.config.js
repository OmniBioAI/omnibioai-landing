import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Builds src/ into public/index.html. Everything else in public/ is
// hand-maintained and left untouched (Eleventy never cleans its output dir).
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

  return {
    dir: { input: "src", includes: "_includes", data: "data", output: "public" },
    templateFormats: ["njk"],
  };
}
