const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

const safeURL = (value = "") => {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};

const showProjectError = (message) => {
  document.querySelector("#project-detail").innerHTML = `<p class="load-error">${escapeHTML(message)}</p>`;
};

const parameters = new URLSearchParams(window.location.search);
const collection = parameters.get("collection");
const projectId = parameters.get("id");

fetch("content.json")
  .then((response) => {
    if (!response.ok) throw new Error("Project content could not be loaded. Check that content.json is available.");
    return response.json();
  })
  .then((content) => {
    if (!["projects", "schoolProjects"].includes(collection) || !projectId) {
      showProjectError("This project link is incomplete or invalid.");
      return;
    }

    const project = content[collection].find((item) => item.id === projectId);
    if (!project) {
      showProjectError("This project could not be found.");
      return;
    }

    const mediaItems = Array.isArray(project.media)
      ? project.media
      : project.video
        ? [{ type: "video", src: project.video }]
        : project.image
          ? [{ type: "image", src: project.image, alt: project.imageAlt }]
          : [];
    const validMediaItems = mediaItems
      .map((item) => ({ item, url: safeURL(item.src) }))
      .filter(({ item, url }) => url && ["image", "video"].includes(item.type));
    const hasGallery = validMediaItems.length > 1;
    const media = validMediaItems.map(({ item, url }, index) => {
      let itemMarkup = "";

      if (item.type === "video") {
        const videoNumber = validMediaItems
          .slice(0, index + 1)
          .filter(({ item: previousItem }) => previousItem.type === "video").length;
        const label = item.label || `${project.title} video ${videoNumber}`;
        itemMarkup = `<video src="${escapeHTML(url)}" controls preload="metadata" playsinline aria-label="${escapeHTML(label)}"></video>`;
      } else {
        const alt = item.alt || project.title;
        const imageClass = hasGallery ? "project-gallery-image-link" : "project-detail-image-link";
        itemMarkup = `<a class="${imageClass}" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" aria-label="Open full-size image for ${escapeHTML(project.title)}"><img src="${escapeHTML(url)}" alt="${escapeHTML(alt)}" /></a>`;
      }

      return hasGallery
        ? `<div class="project-gallery-slide" data-gallery-slide${index === 0 ? "" : " hidden"}>${itemMarkup}</div>`
        : itemMarkup;
    }).join("");
    const mediaSection = hasGallery
      ? `<section class="project-gallery" role="region" aria-label="${escapeHTML(project.title)} media gallery" tabindex="0" data-project-gallery>
          <div class="project-gallery-stage">
            ${media}
            <button class="project-gallery-control project-gallery-previous" type="button" aria-label="Previous media" data-gallery-previous><span aria-hidden="true">←</span></button>
            <button class="project-gallery-control project-gallery-next" type="button" aria-label="Next media" data-gallery-next><span aria-hidden="true">→</span></button>
          </div>
          <div class="project-gallery-footer">
            <span class="project-gallery-position" aria-live="polite" aria-atomic="true" data-gallery-position>1 / ${validMediaItems.length}</span>
            <span class="project-gallery-hint">Use the ← and → arrow keys to browse</span>
          </div>
        </section>`
      : media ? `<div class="project-detail-media">${media}</div>` : "";
    const meta = [project.category, project.year].filter(Boolean);
    const externalURL = safeURL(project.url);

    document.title = `${project.title} | Lukas Bena`;
    document.querySelector('meta[name="description"]').content = project.summary || project.description || project.title;
    document.querySelector("#project-detail").innerHTML = `
      <a class="detail-back-link" href="index.html#projects">← Back to projects</a>
      <header class="project-detail-heading">
        ${meta.length ? `<p class="eyebrow">${meta.map(escapeHTML).join(' <span class="eyebrow-rule"></span> ')}</p>` : ""}
        <h1>${escapeHTML(project.title)}<span>.</span></h1>
      </header>
      ${mediaSection}
      <div class="project-detail-copy">
        <p>${escapeHTML(project.description || project.summary || "More details about this project are coming soon.")}</p>
        ${externalURL ? `<a class="text-link" href="${escapeHTML(externalURL)}" target="_blank" rel="noopener noreferrer">Visit project <span aria-hidden="true">↗</span></a>` : ""}
      </div>`;

    const gallery = document.querySelector("[data-project-gallery]");
    if (gallery) {
      const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));
      const stage = gallery.querySelector(".project-gallery-stage");
      const position = gallery.querySelector("[data-gallery-position]");
      let currentIndex = 0;
      const resizeStage = (slide) => {
        if (slides[currentIndex] !== slide) return;

        const mediaElement = slide.querySelector("img, video");
        const mediaWidth = mediaElement.tagName === "IMG" ? mediaElement.naturalWidth : mediaElement.videoWidth;
        const mediaHeight = mediaElement.tagName === "IMG" ? mediaElement.naturalHeight : mediaElement.videoHeight;
        if (!mediaWidth || !mediaHeight) return;

        const aspectRatio = mediaWidth / mediaHeight;
        const maxHeight = Math.min(window.innerHeight * 0.75, 640);
        const maxWidth = Math.min(gallery.parentElement.clientWidth, 860);
        const width = Math.min(maxWidth, maxHeight * aspectRatio);
        gallery.style.width = `${width}px`;
        stage.style.height = `${width / aspectRatio}px`;
      };

      slides.forEach((slide) => {
        const mediaElement = slide.querySelector("img, video");
        const loadEvent = mediaElement.tagName === "IMG" ? "load" : "loadedmetadata";
        mediaElement.addEventListener(loadEvent, () => resizeStage(slide));
      });

      const showSlide = (direction) => {
        const currentVideo = slides[currentIndex].querySelector("video");
        if (currentVideo) currentVideo.pause();

        currentIndex = (currentIndex + direction + slides.length) % slides.length;
        slides.forEach((slide, index) => {
          slide.hidden = index !== currentIndex;
        });
        position.textContent = `${currentIndex + 1} / ${slides.length}`;
        resizeStage(slides[currentIndex]);
      };

      gallery.querySelector("[data-gallery-previous]").addEventListener("click", () => showSlide(-1));
      gallery.querySelector("[data-gallery-next]").addEventListener("click", () => showSlide(1));
      window.addEventListener("resize", () => resizeStage(slides[currentIndex]));
      gallery.addEventListener("keydown", (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("video")) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showSlide(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          showSlide(1);
        }
      });
      resizeStage(slides[currentIndex]);
    }
  })
  .catch((error) => {
    console.error(error);
    showProjectError(error.message || "Project content could not be loaded.");
  });
