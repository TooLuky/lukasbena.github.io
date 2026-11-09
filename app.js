const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

const safeURL = (value = "") => {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};

const exampleLabel = (isExample) => isExample ? '<span class="example-label">EXAMPLE</span>' : "";

const formatDate = (value) => {
  const date = new Date(/^\d{4}$/.test(value) ? `${value}-02-01` : value);
  return Number.isNaN(date.getTime())
    ? escapeHTML(value)
    : new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
};

const renderProject = (project, index) => {
  const imageURL = safeURL(project.image);
  const projectURL = safeURL(project.url);
  const image = imageURL
    ? `<img src="${escapeHTML(imageURL)}" alt="${escapeHTML(project.imageAlt)}" loading="lazy" />`
    : `<div class="project-image-empty" aria-hidden="true"><span>IMAGE<br />GOES HERE</span></div>`;
  const title = projectURL
    ? `<a href="${escapeHTML(projectURL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(project.title)} <span aria-hidden="true">↗</span></a>`
    : escapeHTML(project.title);

  return `
    <article class="project-card project-card-${index + 1}">
      <div class="project-visual">${image}<span class="project-number">0${index + 1}</span>${exampleLabel(project.example)}</div>
      <div class="project-meta"><span>${escapeHTML(project.category)}</span><span>${escapeHTML(project.year)}</span></div>
      <h3>${title}</h3>
      <p>${escapeHTML(project.description)}</p>
    </article>`;
};

const renderJourney = (item) => `
  <article class="journey-item">
    <span class="journey-date">${escapeHTML(item.date)}</span>
    <div class="journey-marker" aria-hidden="true"></div>
    <div class="journey-copy">
      <div class="journey-title-row"><h3>${escapeHTML(item.title)}</h3>${exampleLabel(item.example)}</div>
      <p>${escapeHTML(item.description)}</p>
    </div>
  </article>`;

const renderUpdate = (item) => `
  <article class="update-item">
    <time datetime="${escapeHTML(item.date)}">${formatDate(item.date)}</time>
    <div class="update-copy"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></div>
    ${exampleLabel(item.example)}
  </article>`;

const renderSocial = (social) => {
  const url = safeURL(social.url);
  return url
    ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(social.label)} <span aria-hidden="true">↗</span></a>`
    : "";
};

const showLoadError = () => {
  document.querySelectorAll("#project-grid, #journey-list, #updates-list").forEach((list) => {
    list.innerHTML = '<p class="load-error">Portfolio content could not be loaded. Check that content.json is valid JSON.</p>';
  });
};

fetch("content.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load content.json");
    return response.json();
  })
  .then((content) => {
    document.title = `Portfolio | ${content.name}`;
    document.querySelector("#header-name").textContent = content.name;
    document.querySelector("#footer-name").textContent = content.name;
    document.querySelector("#intro-kicker").textContent = content.kicker;
    document.querySelector("#intro-description").textContent = content.intro;

    const contactLink = document.querySelector("#contact-link");
    const emailURL = safeURL(`mailto:${content.email}`);
    if (emailURL) contactLink.href = emailURL;

    document.querySelector("#project-count").textContent = String(content.projects.length).padStart(2, "0");
    document.querySelector("#project-grid").innerHTML = content.projects.map(renderProject).join("");
    document.querySelector("#journey-list").innerHTML = content.journey.map(renderJourney).join("");
    document.querySelector("#updates-list").innerHTML = content.updates.map(renderUpdate).join("");
    document.querySelector("#social-links").innerHTML = content.socials.map(renderSocial).join("");
    document.querySelector("#footer-year").textContent = new Date().getFullYear();
  })
  .catch(showLoadError);