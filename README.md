# StudyFlow - Student Task Planner

A responsive website built for an HTML, CSS and JavaScript laboratory assessment.

## Project files

```text
index.html
css/
  style.css
images/
  logo-mark.svg
  study-illustration.svg
pages/
  about.html
  guide.html
js/
  app.js
  site.js
Lab_Assessment_Report.pdf
README.md
```

## JavaScript features

- Add, complete and delete study tasks.
- Search and filter tasks.
- Update task counts and circular progress indicator.
- Save tasks in `localStorage`.
- Switch between light and dark mode.
- Rotate study tips and expand FAQ answers.

## Run

Open `index.html` in a browser or run a static server from this folder:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`.

## GitHub Pages publishing

1. Create a public repository called `studyflow-lab` under your GitHub account.
2. Upload the extracted files to the repository root, leaving `index.html` at the root.
3. Open repository **Settings > Pages**.
4. Choose **Deploy from a branch**, select **main** and **/(root)**, then save.
5. When the website is live, copy its URL as well as the GitHub profile and repository URLs into the submission document.

## Assessment report

`Lab_Assessment_Report.pdf` contains website screenshots, the folder structure, a DOM diagram, explanations of JavaScript and CSS code, and functional testing results. Add the student's name, matriculation number, and published links before final submission.

## Notes

StudyFlow is a front-end demonstration. Tasks are stored locally in the current browser, not synchronized across devices. The initial task list is illustrative data.
