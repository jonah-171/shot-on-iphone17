const EMAIL = "jonahkim@iskonline.org";
const AVIF_WIDTHS = [480, 720, 960, 1280, 1600, 1920];

const page = document.body.dataset.page;
const base = document.body.dataset.base || ".";

function resolveAssetPath(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path) || path.startsWith("data:")) {
    return path;
  }
  if (path.startsWith(".")) {
    return path;
  }
  if (path.startsWith("/")) {
    return base === "." ? path.slice(1) : `${base}${path}`;
  }
  return base === "." ? path : `${base}/${path}`;
}

function seriesUrl(slug) {
  const prefix = base === "." ? "series/" : `${base}/series/`;
  return `${prefix}?slug=${encodeURIComponent(slug)}`;
}

function archiveUrl() {
  return base === "." ? "archive/" : `${base}/archive/`;
}

async function loadSeriesIndex() {
  try {
    const response = await fetch(`${base}/content/series/index.json`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load series index");
    }
    const data = await response.json();
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    const fallback = document.querySelector("[data-fallback]");
    if (fallback) {
      fallback.textContent = "Series data could not be loaded. Run the content build script.";
    }
    return null;
  }
}

function ratioToCss(ratio) {
  if (!ratio || typeof ratio !== "string") {
    return "3 / 2";
  }
  return ratio.replace(":", " / ");
}

function buildAvifSrcset(imagePath) {
  if (!imagePath) return "";
  const resolved = resolveAssetPath(imagePath);
  const basePath = resolved.replace(/\.(jpe?g|png)$/i, "");
  return AVIF_WIDTHS.map((width) => `${basePath}-w${width}.avif ${width}w`).join(", ");
}

function sizesForLayout(layout) {
  if (layout === "full") {
    return "(max-width: 900px) 100vw, (max-width: 1280px) 92vw, 1240px";
  }
  if (layout === "pair-large") {
    return "(max-width: 900px) 100vw, (max-width: 1280px) 60vw, 820px";
  }
  if (layout === "pair-small") {
    return "(max-width: 900px) 100vw, (max-width: 1280px) 40vw, 460px";
  }
  return "(max-width: 900px) 100vw, 70vw";
}

function renderPhoto(photo, layout = "full") {
  const aspect = ratioToCss(photo.aspect_ratio);
  const exif = photo.exif ? photo.exif.replace(/,/g, " | ") : "";
  const title = photo.title || "Untitled";
  const note = photo.note || "";
  const image = resolveAssetPath(photo.image || "");
  const avifSrcset = buildAvifSrcset(photo.image || "");
  const sizes = sizesForLayout(layout);

  return `
    <figure class="photo reveal">
      <div class="photo-media" style="--aspect: ${aspect}">
        <picture>
          <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}" />
          <img src="${image}" alt="${title}" loading="lazy" decoding="async" sizes="${sizes}" />
        </picture>
        <div class="photo-overlay">
          <span class="corner tl"></span>
          <span class="corner tr"></span>
          <span class="corner bl"></span>
          <span class="corner br"></span>
          <div class="exif">${exif}</div>
          <div class="note">${note}</div>
        </div>
      </div>
      <figcaption class="photo-title">${title}</figcaption>
    </figure>
  `;
}

function buildSpreads(photos, limit = photos.length) {
  const items = photos.slice(0, limit);
  const pattern = ["full", "pair", "full"];
  const spreads = [];
  let index = 0;
  let patternIndex = 0;

  while (index < items.length) {
    const mode = pattern[patternIndex];
    if (mode === "pair" && index + 1 < items.length) {
      spreads.push({ type: "pair", photos: [items[index], items[index + 1]] });
      index += 2;
    } else {
      spreads.push({ type: "full", photos: [items[index]] });
      index += 1;
    }
    patternIndex = (patternIndex + 1) % pattern.length;
  }

  return spreads;
}

function renderSpreads(photos, limit) {
  const spreads = buildSpreads(photos, limit);
  return spreads
    .map((spread, spreadIndex) => {
      if (spread.type === "full") {
        return `<div class="spread spread-full">${renderPhoto(spread.photos[0], "full")}</div>`;
      }
      const reverse = spreadIndex % 2 === 1 ? "reverse" : "";
      return `
        <div class="spread spread-pair ${reverse}">
          ${renderPhoto(spread.photos[0], "pair-large")}
          ${renderPhoto(spread.photos[1], "pair-small")}
        </div>
      `;
    })
    .join("");
}

function renderArchiveCard(theme) {
  return `
    <a class="archive-card reveal" href="${seriesUrl(theme.slug)}">
      <div class="archive-card-meta">${theme.date} | ${theme.location}</div>
      <div class="archive-card-title">${theme.title}</div>
      <div>${theme.summary}</div>
    </a>
  `;
}

function applyImageFallbacks(container) {
  const images = container.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("error", () => {
      const wrapper = img.closest(".photo-media");
      if (wrapper) {
        wrapper.classList.add("is-missing");
      }
    });
  });
}

function setupReveals() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  elements.forEach((el) => observer.observe(el));
}

function renderHome(seriesIndex) {
  const latest = seriesIndex.find((item) => item.photos && item.photos.length) || seriesIndex[0];
  if (!latest) {
    return;
  }

  const latestTitle = document.querySelector("[data-latest-title]");
  const latestMeta = document.querySelector("[data-latest-meta]");
  const latestSummary = document.querySelector("[data-latest-summary]");
  const latestLink = document.querySelector("[data-latest-link]");
  const spreadsContainer = document.querySelector("[data-latest-spreads]");
  const archiveContainer = document.querySelector("[data-archive-preview]");

  if (latestTitle) latestTitle.textContent = latest.title;
  if (latestMeta) latestMeta.textContent = `${latest.date} | ${latest.location}`;
  if (latestSummary) latestSummary.textContent = latest.summary;
  if (latestLink) latestLink.setAttribute("href", seriesUrl(latest.slug));

  if (spreadsContainer) {
    if (latest.photos && latest.photos.length) {
      spreadsContainer.innerHTML = renderSpreads(latest.photos, 5);
      applyImageFallbacks(spreadsContainer);
    } else {
      spreadsContainer.innerHTML = `
        <div class="empty-state reveal">
          Series photography will be added soon. Check back for the first drop.
        </div>
      `;
    }
  }

  if (archiveContainer) {
    const preview = seriesIndex.slice(0, 6).map(renderArchiveCard).join("");
    archiveContainer.innerHTML = preview;
  }
}

function renderSeriesPage(seriesIndex) {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const container = document.querySelector("[data-series-container]");
  if (!container) return;

  if (!slug) {
    container.innerHTML = `
      <div class="section">
        <div class="container">
          <h2 class="section-title">Series not found</h2>
          <p data-fallback>Provide a series slug in the URL.</p>
          <a class="button button-ghost" href="${archiveUrl()}">Back to archive</a>
        </div>
      </div>
    `;
    return;
  }

  const theme = seriesIndex.find((item) => item.slug === slug);
  if (!theme) {
    container.innerHTML = `
      <div class="section">
        <div class="container">
          <h2 class="section-title">Series not found</h2>
          <p data-fallback>We could not locate the requested theme.</p>
          <a class="button button-ghost" href="${archiveUrl()}">Back to archive</a>
        </div>
      </div>
    `;
    return;
  }

  const hasPhotos = theme.photos && theme.photos.length;
  container.innerHTML = `
    <section class="section" data-index="01">
      <div class="container">
        <div class="section-kicker">Series</div>
        <h1 class="section-title">${theme.title}</h1>
        <div class="latest-theme-meta">${theme.date} | ${theme.location}</div>
        <p>${theme.summary}</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        ${
          hasPhotos
            ? `<div class="spreads">${renderSpreads(theme.photos)}</div>`
            : `<div class="empty-state reveal">Images for this series will be added soon.</div>`
        }
      </div>
    </section>
  `;

  applyImageFallbacks(container);
}

function renderArchivePage(seriesIndex) {
  const container = document.querySelector("[data-archive-list]");
  if (!container) return;
  container.innerHTML = seriesIndex.map(renderArchiveCard).join("");
}

async function init() {
  const seriesIndex = await loadSeriesIndex();
  if (!seriesIndex) return;

  if (page === "home") {
    renderHome(seriesIndex);
  }

  if (page === "series") {
    renderSeriesPage(seriesIndex);
  }

  if (page === "archive") {
    renderArchivePage(seriesIndex);
  }

  setupReveals();
}

init();
