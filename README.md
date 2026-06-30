# Tools Hub

## GitHub Pages

Recommended: use GitHub Actions and set Pages source to **GitHub Actions**. The workflow builds `dist/` and deploys that artifact.

The Pages workflow runs on:

- pushes to `main`
- tags that start with `v`, such as `v1.0.0`
- manual `workflow_dispatch`

Manual branch deploy option:

```bash
pnpm build:pages
```

Then set GitHub Pages source to the branch's `/docs` folder. Do not use repo root as the Pages source because root `index.html` is the Vite development entry and references `/src/main.tsx`.
