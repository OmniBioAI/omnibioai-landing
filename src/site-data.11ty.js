// Builds public/data/site-data.json from src/data/siteData.json. The pages
// fetch it at runtime and overwrite every [data-site-stat] figure with it.
// catalogs.organisms is not hand-written: it is the number of rows in
// src/data/genomes.json, so the live figure cannot drift from the table.
export const data = {
  permalink: "data/site-data.json",
  eleventyExcludeFromCollections: true,
};

export function render({ siteData, genomes }) {
  const output = {
    ...siteData,
    catalogs: { ...siteData.catalogs, organisms: String(genomes.length) },
  };
  return JSON.stringify(output, null, 2) + "\n";
}
