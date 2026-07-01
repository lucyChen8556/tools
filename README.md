# Tools Hub

## GitHub Pages

Use GitHub Actions and set Pages source to **GitHub Actions**. The workflow builds `dist/` and deploys that artifact.

The Pages workflow runs on:

- pushes to `main`
- tags that start with `v`, such as `v1.0.0`
- manual `workflow_dispatch`
