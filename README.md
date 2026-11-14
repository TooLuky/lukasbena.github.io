# Portfolio site

A small, framework-free portfolio for GitHub Pages. The page reads its content from `content.json`, so your introduction, projects, and links can be changed without editing the layout.

## Update your content

1. Open `content.json` and replace the example name, introduction, links, and entries with your own.
2. To add an entry, copy an existing object in the matching list and edit its fields. Set `example` to `false` or remove it to hide the example label.
3. Project images can be hosted anywhere publicly and added as the project's `image` URL. Use an empty string if you do not want an image.
4. Save your changes, then follow **Publish your changes from VS Code** below to put them on the live site.

To show multiple photos or videos on a project's detail page, add a `media` array with `type` (`image` or `video`) and `src` fields; image items can also include `alt` text. The existing `image` and `video` fields still work for single-media projects.

School project entries are preserved in the `schoolProjects` array in `content.json`, but are not displayed on the site. Keep adding to that array if you like; when you're ready to show them, the school section can be restored.

Each project can have a short `summary` for its homepage card and a longer `description` for its detail page. Project detail links use the project's unique `id`; keep IDs unique within each project list.

The About page is in `about.html` and includes a portrait placeholder you can replace with a photo when you're ready. A Fitness & Travel draft is kept in `fitness-travel.html` but is not linked from the portfolio; add navigation links back when you're ready to use it.

## Publish your changes from VS Code

1. Save your files.
2. Open **Source Control** from the VS Code activity bar (or press **Ctrl+Shift+G**).
3. Review the changed files. Select **+** next to **Changes** to stage them.
4. Enter a short message in the message box, such as `Add construction notice`, then select **Commit**.
5. Select **Sync Changes** and confirm if VS Code asks. This sends your commit to GitHub. If **Sync Changes** is not shown, open the Source Control **…** menu and select **Push**.
6. GitHub Actions deploys the site automatically after the push. Check the **Actions** tab in the [GitHub repository](https://github.com/TooLuky/lukasbena.github.io) and wait for the **Deploy static site to GitHub Pages** run to succeed. Then visit <https://tooluky.github.io/lukasbena.github.io/> and refresh the page.

The first time you push, VS Code may ask you to sign in to GitHub or publish the `main` branch; follow its prompts. If the **Pages** workflow has not been set up yet, open the repository's **Settings → Pages** and set the build and deployment source to **GitHub Actions**.

The site is plain HTML, CSS, and JavaScript; it needs no build step or dependencies. To preview it locally, run `python3 -m http.server 8000` from this directory and open `http://localhost:8000`.

Open the repository in [GitHub Codespaces](https://github.com/codespaces).
