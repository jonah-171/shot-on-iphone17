# Series Content

Add one Markdown file per theme in this folder with YAML front matter.
After adding or editing a series, regenerate `index.json`:

1. `npm install`
2. `npm run build:content`

Each photo supports an optional `aspect_ratio` field (example: "3:2").

To generate AVIF image variants (for responsive loading):

1. `npm run build:images`
