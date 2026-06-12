const EMAIL = "jonahkim@iskonline.org";
const AVIF_WIDTHS = [480, 720, 960, 1280, 1600, 1920];
const ENTRY_IMAGE_SCALE_MULTIPLIER = 1.5;
const AURORA_STRENGTH = 3;
const AURORA_MOTION_MULTIPLIER = 5;
const AURORA_ORBS = [
  {
    left: "10%",
    top: "16%",
    width: "clamp(18rem, 32vw, 34rem)",
    height: "clamp(18rem, 32vw, 34rem)",
    blur: "26px",
    opacity: "0.9",
    core: "rgba(136, 236, 255, 0.46)",
    glow: "rgba(67, 139, 255, 0.28)",
    driftX: 88,
    driftY: 136,
    swingX: 46,
    swingY: 34,
    velocityX: 0.28,
    velocityY: -0.24,
    scale: 1.08,
    scaleRange: 0.05,
    waveX: 1.2,
    waveY: 0.9,
    phase: 0.35,
  },
  {
    left: "76%",
    top: "22%",
    width: "clamp(22rem, 34vw, 38rem)",
    height: "clamp(22rem, 34vw, 38rem)",
    blur: "30px",
    opacity: "0.76",
    core: "rgba(107, 255, 219, 0.34)",
    glow: "rgba(38, 180, 224, 0.22)",
    driftX: -74,
    driftY: 122,
    swingX: 34,
    swingY: 40,
    velocityX: -0.22,
    velocityY: 0.2,
    scale: 1.02,
    scaleRange: 0.04,
    waveX: 0.95,
    waveY: 1.1,
    phase: 1.4,
  },
  {
    left: "26%",
    top: "76%",
    width: "clamp(20rem, 28vw, 30rem)",
    height: "clamp(20rem, 28vw, 30rem)",
    blur: "28px",
    opacity: "0.7",
    core: "rgba(114, 126, 255, 0.28)",
    glow: "rgba(74, 88, 220, 0.18)",
    driftX: 72,
    driftY: -112,
    swingX: 30,
    swingY: 32,
    velocityX: 0.2,
    velocityY: -0.18,
    scale: 1.04,
    scaleRange: 0.03,
    waveX: 1.15,
    waveY: 0.85,
    phase: 2.2,
  },
  {
    left: "82%",
    top: "78%",
    width: "clamp(18rem, 26vw, 28rem)",
    height: "clamp(18rem, 26vw, 28rem)",
    blur: "24px",
    opacity: "0.62",
    core: "rgba(95, 212, 255, 0.24)",
    glow: "rgba(32, 109, 214, 0.16)",
    driftX: -58,
    driftY: -96,
    swingX: 26,
    swingY: 26,
    velocityX: -0.18,
    velocityY: 0.16,
    scale: 0.98,
    scaleRange: 0.04,
    waveX: 0.9,
    waveY: 1.2,
    phase: 0.9,
  },
  {
    left: "52%",
    top: "44%",
    width: "clamp(16rem, 24vw, 24rem)",
    height: "clamp(16rem, 24vw, 24rem)",
    blur: "22px",
    opacity: "0.52",
    core: "rgba(157, 255, 216, 0.22)",
    glow: "rgba(77, 193, 153, 0.14)",
    driftX: 28,
    driftY: 56,
    swingX: 22,
    swingY: 22,
    velocityX: 0.14,
    velocityY: -0.11,
    scale: 0.96,
    scaleRange: 0.03,
    waveX: 1.4,
    waveY: 1,
    phase: 2.8,
  },
];

const page = document.body.dataset.page;
const base = document.body.dataset.base || ".";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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

function blogUrl(slug) {
  const prefix = base === "." ? "blog/" : `${base}/blog/`;
  return `${prefix}?slug=${encodeURIComponent(slug)}`;
}

function archiveUrl() {
  return base === "." ? "archive/" : `${base}/archive/`;
}

async function loadBlogIndex() {
  try {
    const response = await fetch(`${base}/content/series/index.json`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load blog index");
    }
    const data = await response.json();
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    const fallback = document.querySelector("[data-fallback]");
    if (fallback) {
      fallback.textContent = "Entry data could not be loaded. Run the content build script.";
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

function parseAspectRatio(ratio) {
  if (!ratio || typeof ratio !== "string") {
    return 1.5;
  }

  const [width, height] = ratio.split(":").map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return 1.5;
  }

  return width / height;
}

function currentViewportWidth() {
  return typeof window === "undefined" ? 1280 : window.innerWidth;
}

function currentViewportHeight() {
  return typeof window === "undefined" ? 900 : window.innerHeight;
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
  if (layout === "gallery") {
    return "(max-width: 900px) 100vw, (max-width: 1440px) 74vw, 1120px";
  }
  return "(max-width: 900px) 100vw, 70vw";
}

function renderPhotoMedia(photo, layout = "full") {
  const aspect = ratioToCss(photo.aspect_ratio);
  const title = photo.alt || photo.title || "Documentary photograph";
  const image = resolveAssetPath(photo.image || "");
  const avifSrcset = buildAvifSrcset(photo.image || "");
  const sizes = sizesForLayout(layout);

  return `
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
      </div>
    </div>
  `;
}

function renderPhoto(photo, layout = "full", options = {}) {
  const title = photo.title || "Untitled";
  const note = photo.note || "";
  const figureClass = ["photo", "reveal", options.className].filter(Boolean).join(" ");
  const figureStyle = options.style ? ` style="${options.style}"` : "";

  return `
    <figure class="${figureClass}"${figureStyle}>
      ${renderPhotoMedia(photo, layout)}
      <figcaption class="photo-caption">
        <div class="photo-title">${title}</div>
        ${note ? `<div class="photo-note">${note}</div>` : ""}
      </figcaption>
    </figure>
  `;
}

function renderFrontMedia(entry, options = {}) {
  const imagePath = entry.hero_image || "";
  const className = ["front-media", options.className, !imagePath && "is-placeholder"]
    .filter(Boolean)
    .join(" ");

  if (!imagePath) {
    return `<div class="${className}" aria-hidden="true"></div>`;
  }

  const image = resolveAssetPath(imagePath);
  const avifSrcset = buildAvifSrcset(imagePath);
  const sizes = options.sizes || "100vw";
  const loading = options.loading || "lazy";
  const fetchPriority = options.fetchPriority ? ` fetchpriority="${options.fetchPriority}"` : "";

  return `
    <div class="${className}">
      <picture>
        <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}" />
        <img src="${image}" alt="" loading="${loading}" decoding="async" sizes="${sizes}"${fetchPriority} />
      </picture>
    </div>
  `;
}

function entryGalleryContainerWidth(viewportWidth = currentViewportWidth()) {
  const horizontalPadding = viewportWidth <= 640 ? 32 : 48;
  return Math.min(Math.max(viewportWidth - horizontalPadding, 0), 1560);
}

function measureEntryPhotoScale(
  photos,
  viewportWidth = currentViewportWidth(),
  viewportHeight = currentViewportHeight(),
  options = {}
) {
  const ratios = photos.map((photo) => parseAspectRatio(photo.aspect_ratio));
  const containerWidth = entryGalleryContainerWidth(viewportWidth);
  const galleryGap = viewportWidth < 900 ? 28 : 40;
  const mediaOnly = options.mediaOnly === true;
  const mediaColumnShare = viewportWidth < 900 || mediaOnly ? 1 : 1.48 / (1.48 + 0.52);
  const columnLimitedWidth =
    viewportWidth < 900
      ? containerWidth
      : Math.max((containerWidth - galleryGap) * mediaColumnShare, 0);
  const baseMaxWidth =
    viewportWidth < 900
      ? containerWidth
      : Math.min(containerWidth * (mediaOnly ? 0.86 : 0.72), viewportWidth * (mediaOnly ? 0.78 : 0.66));
  const maxWidth = Math.min(baseMaxWidth * ENTRY_IMAGE_SCALE_MULTIPLIER, columnLimitedWidth);
  const baseMaxHeight = viewportWidth < 900 ? viewportHeight * 0.62 : viewportHeight * 0.84;
  const maxHeight = baseMaxHeight * ENTRY_IMAGE_SCALE_MULTIPLIER;
  const limits = ratios.map((ratio) =>
    Math.min(maxWidth / Math.sqrt(ratio), maxHeight * Math.sqrt(ratio))
  );

  return Math.min(...limits) * 0.98;
}

function renderEntryFeature(photo, index, scale, options = {}) {
  const ratio = parseAspectRatio(photo.aspect_ratio);
  const title = photo.title || "Untitled";
  const note = photo.note || "";
  const mediaOnly = options.showPhotoDetails === false;
  const featureClass = ["entry-feature", "reveal", index % 2 === 1 && "is-reverse", mediaOnly && "is-media-only"]
    .filter(Boolean)
    .join(" ");
  const mediaStyle = `--entry-photo-width: ${(scale * Math.sqrt(ratio)).toFixed(2)}px;`;

  return `
    <article class="${featureClass}">
      <div class="entry-feature-media" style="${mediaStyle}">
        ${renderPhotoMedia(photo, "gallery")}
      </div>
      ${
        mediaOnly
          ? ""
          : `<div class="entry-feature-copy">
              <h2 class="entry-feature-title">${title}</h2>
              ${note ? `<p class="entry-feature-note">${note}</p>` : ""}
            </div>`
      }
    </article>
  `;
}

function renderEntryGallery(photos, options = {}) {
  if (!photos?.length) {
    return "";
  }

  const showPhotoDetails = options.showPhotoDetails !== false;
  const scale = measureEntryPhotoScale(photos, currentViewportWidth(), currentViewportHeight(), {
    mediaOnly: !showPhotoDetails,
  });

  return `
    <div class="entry-gallery">
      ${photos.map((photo, index) => renderEntryFeature(photo, index, scale, { showPhotoDetails })).join("")}
    </div>
  `;
}

function renderEntryEssay(essay) {
  if (!essay) {
    return "";
  }

  const paragraphs = String(essay)
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return "";
  }

  return `
    <section class="section entry-essay-section">
      <div class="container">
        <article class="entry-essay reveal">
          <div class="section-kicker">Artist Statement</div>
          ${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
        </article>
      </div>
    </section>
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

function renderArchiveCard(entry) {
  return `
    <a class="archive-card reveal" href="${blogUrl(entry.slug)}">
      ${renderFrontMedia(entry, {
        className: "archive-card-front",
        sizes: "(max-width: 900px) calc(100vw - 3rem), 360px",
      })}
      <div class="archive-card-content">
        <div class="archive-card-meta">${entry.date} | ${entry.location}</div>
        <div class="archive-card-title">${entry.title}</div>
        <div>${entry.summary}</div>
      </div>
    </a>
  `;
}

function applyImageFallbacks(container) {
  const images = container.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("error", () => {
      const wrapper = img.closest(".photo-media, .front-media");
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

function setupAuroraBackground() {
  if (document.querySelector(".site-aurora")) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const backdrop = document.createElement("div");
  backdrop.className = "site-aurora";
  backdrop.setAttribute("aria-hidden", "true");

  const veil = document.createElement("div");
  veil.className = "aurora-veil";
  backdrop.append(veil);

  const orbs = AURORA_ORBS.map((config) => {
    const orb = document.createElement("span");
    orb.className = "aurora-orb";
    orb.style.setProperty("--orb-left", config.left);
    orb.style.setProperty("--orb-top", config.top);
    orb.style.setProperty("--orb-width", config.width);
    orb.style.setProperty("--orb-height", config.height);
    orb.style.setProperty("--orb-blur", config.blur);
    orb.style.setProperty("--orb-opacity", config.opacity);
    orb.style.setProperty("--orb-core", config.core);
    orb.style.setProperty("--orb-glow", config.glow);
    backdrop.append(orb);
    return orb;
  });

  document.body.prepend(backdrop);

  let lastScrollY = window.scrollY;
  let inertialVelocity = 0;
  let ticking = false;

  function getAuroraStrength(multiplier = 1) {
    const baseStrength = reducedMotion.matches ? 1 + (AURORA_STRENGTH - 1) * 0.35 : AURORA_STRENGTH;
    return 1 + (baseStrength - 1) * multiplier;
  }

  function getMotionMultiplier() {
    return reducedMotion.matches
      ? 1 + (AURORA_MOTION_MULTIPLIER - 1) * 0.25
      : AURORA_MOTION_MULTIPLIER;
  }

  function applyAuroraIntensity() {
    const glowStrength = getAuroraStrength(1);
    const opacityStrength = getAuroraStrength(0.5);
    const orbBrightness = 1 + (glowStrength - 1) * 0.75;
    const orbSaturation = 1 + (glowStrength - 1) * 0.4;
    const orbBlurScale = 1 + (glowStrength - 1) * 0.28;
    const backdropBrightness = 1 + (glowStrength - 1) * 0.18;
    const backdropSaturation = 1 + (glowStrength - 1) * 0.22;

    backdrop.style.setProperty("--aurora-brightness", backdropBrightness.toFixed(2));
    backdrop.style.setProperty("--aurora-saturation", backdropSaturation.toFixed(2));

    orbs.forEach((orb, index) => {
      const baseOpacity = parseFloat(AURORA_ORBS[index].opacity);
      const opacity = clamp(baseOpacity * opacityStrength, 0, 1);

      orb.style.setProperty("--orb-opacity", opacity.toFixed(3));
      orb.style.setProperty("--orb-brightness", orbBrightness.toFixed(2));
      orb.style.setProperty("--orb-saturation", orbSaturation.toFixed(2));
      orb.style.setProperty("--orb-blur-scale", orbBlurScale.toFixed(2));
    });
  }

  function updateAurora() {
    ticking = false;

    const scrollLimit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollY = window.scrollY;
    const progress = scrollY / scrollLimit;
    const delta = scrollY - lastScrollY;
    const motionStrength = getAuroraStrength(0.45);
    const velocityStrength = getAuroraStrength(0.55);
    const atmosphereStrength = getAuroraStrength(0.8);
    const pulseStrength = getAuroraStrength(0.22);
    const motionMultiplier = getMotionMultiplier();
    const maxOrbOffsetX = window.innerWidth * 0.72;
    const maxOrbOffsetY = window.innerHeight * 0.78;
    const maxBackdropShiftX = window.innerWidth * 0.22;
    const maxBackdropShiftY = window.innerHeight * 0.28;
    const motionFactor = (reducedMotion.matches ? 0.55 : 1.85) * motionStrength;
    const inertiaBlend = (reducedMotion.matches ? 0.1 : 0.3) * (1 + (velocityStrength - 1) * 0.2);
    const inertiaCarry = reducedMotion.matches ? 0.72 : 0.8;

    lastScrollY = scrollY;
    inertialVelocity = inertialVelocity * inertiaCarry + delta * inertiaBlend;

    if (Math.abs(inertialVelocity) < 0.01) {
      inertialVelocity = 0;
    }

    const clampedVelocity = clamp(inertialVelocity, -240 * velocityStrength, 240 * velocityStrength);

    orbs.forEach((orb, index) => {
      const config = AURORA_ORBS[index];
      const waveX = Math.sin(progress * Math.PI * 2 * config.waveX + config.phase);
      const waveY = Math.cos(progress * Math.PI * 2 * config.waveY + config.phase);
      const rawOffsetX =
        ((progress - 0.5) * config.driftX + waveX * config.swingX) * motionFactor +
        clampedVelocity * config.velocityX;
      const rawOffsetY =
        ((progress - 0.5) * config.driftY + waveY * config.swingY) * motionFactor +
        clampedVelocity * config.velocityY;
      const offsetX = clamp(rawOffsetX * motionMultiplier, -maxOrbOffsetX, maxOrbOffsetX);
      const offsetY = clamp(rawOffsetY * motionMultiplier, -maxOrbOffsetY, maxOrbOffsetY);
      const scale =
        config.scale +
        Math.sin(progress * Math.PI * config.waveY + config.phase) *
          config.scaleRange *
          pulseStrength *
          (reducedMotion.matches ? 0.45 : 1);

      orb.style.setProperty("--orb-offset-x", `${offsetX.toFixed(2)}px`);
      orb.style.setProperty("--orb-offset-y", `${offsetY.toFixed(2)}px`);
      orb.style.setProperty("--orb-scale", scale.toFixed(3));
    });

    const motionGain = Math.min(
      Math.abs(clampedVelocity) / 260,
      (reducedMotion.matches ? 0.04 : 0.1) * getAuroraStrength(0.35)
    );
    const opacity = clamp(0.9 + motionGain, 0, 1);
    const rawRotation =
      ((progress - 0.5) * 4.6 + clampedVelocity * 0.022) *
      (reducedMotion.matches ? 0.45 : 1) *
      motionStrength;
    const rotation = clamp(rawRotation * motionMultiplier, -24, 24);
    const scale =
      1 +
      Math.min(
        Math.abs(clampedVelocity) / 1100,
        (reducedMotion.matches ? 0.01 : 0.032) * getAuroraStrength(0.55)
      );
    const rawShiftX =
      (Math.sin(progress * Math.PI * 2.1) * 18 + clampedVelocity * -0.075) *
      (reducedMotion.matches ? 0.35 : 1) *
      atmosphereStrength;
    const rawShiftY =
      ((progress - 0.5) * 52 + clampedVelocity * 0.085) *
      (reducedMotion.matches ? 0.35 : 1) *
      atmosphereStrength;
    const shiftX = clamp(rawShiftX * motionMultiplier, -maxBackdropShiftX, maxBackdropShiftX);
    const shiftY = clamp(rawShiftY * motionMultiplier, -maxBackdropShiftY, maxBackdropShiftY);

    backdrop.style.opacity = opacity.toFixed(3);
    backdrop.style.setProperty("--aurora-shift-x", `${shiftX.toFixed(2)}px`);
    backdrop.style.setProperty("--aurora-shift-y", `${shiftY.toFixed(2)}px`);
    backdrop.style.setProperty("--aurora-scale", scale.toFixed(3));
    backdrop.style.setProperty("--aurora-rotation", `${rotation.toFixed(2)}deg`);
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateAurora);
  }

  function syncMotionPreference() {
    lastScrollY = window.scrollY;
    inertialVelocity = 0;
    applyAuroraIntensity();
    requestTick();
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", syncMotionPreference);
  } else if (typeof reducedMotion.addListener === "function") {
    reducedMotion.addListener(syncMotionPreference);
  }

  syncMotionPreference();
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
  if (latestLink) latestLink.setAttribute("href", blogUrl(latest.slug));

  if (spreadsContainer) {
    if (latest.photos && latest.photos.length) {
      spreadsContainer.innerHTML = renderSpreads(latest.photos, 5);
      applyImageFallbacks(spreadsContainer);
    } else {
      spreadsContainer.innerHTML = `
        <div class="empty-state reveal">
          Entry photography will be added soon. Check back for the first drop.
        </div>
      `;
    }
  }

  if (archiveContainer) {
    const preview = seriesIndex.slice(0, 6).map(renderArchiveCard).join("");
    archiveContainer.innerHTML = preview;
    applyImageFallbacks(archiveContainer);
  }
}

function renderBlogPage(seriesIndex) {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const container = document.querySelector("[data-blog-container]");
  if (!container) return;

  if (!slug) {
    container.innerHTML = `
      <div class="section">
        <div class="container">
          <h2 class="section-title">Entry not found</h2>
          <p data-fallback>Provide an entry slug in the URL.</p>
          <a class="button button-ghost" href="${archiveUrl()}">Back to archive</a>
        </div>
      </div>
    `;
    return;
  }

  const entry = seriesIndex.find((item) => item.slug === slug);
  if (!entry) {
    container.innerHTML = `
      <div class="section">
        <div class="container">
          <h2 class="section-title">Entry not found</h2>
          <p data-fallback>We could not locate the requested entry.</p>
          <a class="button button-ghost" href="${archiveUrl()}">Back to archive</a>
        </div>
      </div>
    `;
    return;
  }

  const hasPhotos = entry.photos && entry.photos.length;
  container.innerHTML = `
    <section class="entry-hero">
      ${renderFrontMedia(entry, {
        className: "entry-hero-media",
        loading: "eager",
        fetchPriority: "high",
      })}
      <div class="container entry-hero-content">
        <div class="section-kicker reveal">Entry</div>
        <h1 class="section-title reveal">${entry.title}</h1>
        <div class="latest-theme-meta">${entry.date} | ${entry.location}</div>
        <p class="entry-hero-summary reveal">${entry.summary}</p>
      </div>
    </section>
    ${renderEntryEssay(entry.essay)}
    <section class="section entry-gallery-section">
      <div class="container">
        ${
          hasPhotos
            ? renderEntryGallery(entry.photos, { showPhotoDetails: entry.photo_captions !== false })
            : `<div class="empty-state reveal">Images for this entry will be added soon.</div>`
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
  applyImageFallbacks(container);
}

async function init() {
  setupAuroraBackground();

  const seriesIndex = await loadBlogIndex();
  if (!seriesIndex) return;

  if (page === "home") {
    renderHome(seriesIndex);
  }

  if (page === "blog") {
    renderBlogPage(seriesIndex);
  }

  if (page === "archive") {
    renderArchivePage(seriesIndex);
  }

  setupReveals();
}

init();
