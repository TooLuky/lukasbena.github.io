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

const exampleLabel = (isExample) => isExample ? '<span class="example-label">EXAMPLE</span>' : "";

const renderProject = (project, index, collection) => {
  const imageURL = safeURL(project.image);
  const videoURL = safeURL(project.video);
  const projectURL = `project.html?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(project.id)}`;
  const media = videoURL
    ? `<video src="${escapeHTML(videoURL)}" controls preload="metadata" aria-label="${escapeHTML(project.title)} video"></video>`
    : imageURL
      ? `<img src="${escapeHTML(imageURL)}" alt="${escapeHTML(project.imageAlt)}" loading="lazy" />`
      : `<div class="project-image-empty" aria-hidden="true"><span>PHOTO<br />COMING SOON</span></div>`;
  const meta = [project.category, project.year].filter(Boolean);

  return `
    <article class="project-card project-card-${index + 1}">
      <div class="project-visual">${media}<span class="project-number">${String(index + 1).padStart(2, "0")}</span>${exampleLabel(project.example)}</div>
      ${meta.length ? `<div class="project-meta">${meta.map((value) => `<span>${escapeHTML(value)}</span>`).join("")}</div>` : ""}
      <h3>${escapeHTML(project.title)} <span aria-hidden="true">↗</span></h3>
      ${project.summary || project.description ? `<p>${escapeHTML(project.summary || project.description)}</p>` : ""}
      <span class="project-detail-link">View project <span aria-hidden="true">→</span></span>
      <a class="project-card-overlay" href="${escapeHTML(projectURL)}" aria-label="Open ${escapeHTML(project.title)} project details"></a>
    </article>`;
};

const renderSocial = (social) => {
  const url = safeURL(social.url);
  return url
    ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(social.label)} <span aria-hidden="true">↗</span></a>`
    : "";
};

const showLoadError = () => {
  document.querySelectorAll("#project-grid, #school-project-grid").forEach((list) => {
    list.innerHTML = '<p class="load-error">Portfolio content could not be loaded. Check that content.json is valid JSON.</p>';
  });
};

fetch("content.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load content.json");
    return response.json();
  })
  .then((content) => {
    document.title = `${content.name} | Projects & ideas`;
    document.querySelector("#header-name").textContent = content.name;
    document.querySelector("#footer-name").textContent = content.name;
    document.querySelector("#intro-kicker").textContent = content.kicker;
    document.querySelector("#intro-description").textContent = content.intro;

    const contactLink = document.querySelector("#contact-link");
    const emailURL = safeURL(`mailto:${content.email}`);
    if (emailURL) contactLink.href = emailURL;

    document.querySelector("#project-count").textContent = String(content.projects.length).padStart(2, "0");
    document.querySelector("#project-grid").innerHTML = content.projects.map((project, index) => renderProject(project, index, "projects")).join("");
    document.querySelector("#school-project-grid").innerHTML = content.schoolProjects.map((project, index) => renderProject(project, index, "schoolProjects")).join("");
    document.querySelector("#social-links").innerHTML = content.socials.map(renderSocial).join("");
    document.querySelector("#footer-year").textContent = new Date().getFullYear();
  })
  .catch(showLoadError);