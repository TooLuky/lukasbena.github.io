# Portfolio site

A small, framework-free portfolio for GitHub Pages. The page reads its content from `content.json`, so projects, milestones, links, and updates can be changed without editing the layout.

## Update your content

1. Open `content.json` and replace the example name, introduction, links, and entries with your own.
2. To add an entry, copy an existing object in the matching list and edit its fields. Set `example` to `false` or remove it to hide the example label.
3. Project images can be hosted anywhere publicly and added as the project's `image` URL. Use an empty string if you do not want an image.
4. Commit and push your changes to `main`. GitHub Actions will publish the site to <https://tooluky.github.io/lukasbena.github.io/>.

## Publish with GitHub Pages

In the repository settings, open **Pages** and set the build and deployment source to **GitHub Actions**. The workflow in `.github/workflows/pages.yml` deploys the static site whenever changes are pushed to `main`. The first workflow run may take a few minutes to publish.

The site is plain HTML, CSS, and JavaScript; it needs no build step or dependencies. To preview it locally, run `python3 -m http.server 8000` from this directory and open `http://localhost:8000`.
