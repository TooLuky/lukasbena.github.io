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

    const imageURL = safeURL(project.image);
    const videoURL = safeURL(project.video);
    const media = videoURL
      ? `<video src="${escapeHTML(videoURL)}" controls preload="metadata" aria-label="${escapeHTML(project.title)} video"></video>`
      : imageURL
        ? `<img src="${escapeHTML(imageURL)}" alt="${escapeHTML(project.imageAlt)}" />`
        : "";
    const meta = [project.category, project.year].filter(Boolean);
    const externalURL = safeURL(project.url);

    document.title = `${project.title} | Lukas Bena`;
    document.querySelector('meta[name="description"]').content = project.summary || project.description || project.title;
    document.querySelector("#project-detail").innerHTML = `
      <a class="detail-back-link" href="index.html#${collection === "schoolProjects" ? "school-experience" : "projects"}">← Back to ${collection === "schoolProjects" ? "school projects" : "projects"}</a>
      <header class="project-detail-heading">
        ${meta.length ? `<p class="eyebrow">${meta.map(escapeHTML).join(' <span class="eyebrow-rule"></span> ')}</p>` : ""}
        <h1>${escapeHTML(project.title)}<span>.</span></h1>
      </header>
      ${media ? `<div class="project-detail-media">${media}</div>` : ""}
      <div class="project-detail-copy">
        <p>${escapeHTML(project.description || project.summary || "More details about this project are coming soon.")}</p>
        ${externalURL ? `<a class="text-link" href="${escapeHTML(externalURL)}" target="_blank" rel="noopener noreferrer">Visit project <span aria-hidden="true">↗</span></a>` : ""}
      </div>`;
  })
  .catch((error) => {
    console.error(error);
    showProjectError(error.message || "Project content could not be loaded.");
  });
