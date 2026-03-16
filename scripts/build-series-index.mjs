import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seriesDir = path.join(rootDir, "content", "series");
const indexPath = path.join(seriesDir, "index.json");

const requiredFields = ["title", "date", "location", "summary", "photos"];

function parseFrontMatter(contents, fileName) {
  const match = contents.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`Missing front matter in ${fileName}`);
  }
  return yaml.load(match[1]);
}

function validateSeries(data, fileName) {
  const missing = requiredFields.filter((field) => !data[field]);
  if (missing.length > 0) {
    console.warn(`Warning: ${fileName} missing fields: ${missing.join(", ")}`);
  }
  if (!Array.isArray(data.photos) || data.photos.length === 0) {
    console.warn(`Warning: ${fileName} has no photos array`);
  }
}

async function buildIndex() {
  const entries = await fs.readdir(seriesDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name);

  const series = [];
  for (const fileName of files) {
    const filePath = path.join(seriesDir, fileName);
    const contents = await fs.readFile(filePath, "utf8");
    const data = parseFrontMatter(contents, fileName);
    data.slug = data.slug || path.basename(fileName, ".md");
    validateSeries(data, fileName);
    series.push(data);
  }

  series.sort((a, b) => new Date(b.date) - new Date(a.date));
  await fs.writeFile(indexPath, `${JSON.stringify(series, null, 2)}\n`, "utf8");
  console.log(`Wrote ${series.length} series to ${indexPath}`);
}

buildIndex().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
