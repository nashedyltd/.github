# Nashedy - Building the Future with Technology and Science

We design, build, and manage high-performance software, hardware, and APIs — creating ecosystems that connect technology with real human and business needs across Africa and globally.

## 🚀 System Architecture

**Secure & Static**: The system is compiled to pure, immutable assets for maximum security.
**Zero Trust**: No backend dependencies, strict Content Security Policy (CSP).

## 📂 Project Structure

- `content/`: **Content Source**. Text and structured data.
- `static/`: **Secure Assets**. CSS, Images, JS (Enterprise Design System).
- `templates/`: **View Layer**. Secure HTML layouts.
- `config.toml`: **System Policies**. Security headers and site configuration.

## 🛡️ Security Features
- **Strict CSP**: Blocks all unauthorized scripts/iframes.
- **Hidden Practice**: Internal docs are excluded from the build.
- **Resanitized Input**: All forms communicate directly with secure Nashedy APIs.

## 🚀 Deployment Options

This repository supports multiple deployment methods:

### GitHub Pages
- Automatically deploys to GitHub Pages via GitHub Actions
- Uses the `gh-pages` branch for hosting
- Triggered on pushes to the `main` branch

### Netlify
- Deploys automatically to Netlify
- Requires setting up `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets in GitHub
- Triggered on pushes to the `main` branch

### Vercel
- Deploys automatically to Vercel
- Requires setting up `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets in GitHub
- Triggered on pushes to the `main` branch

## 🛠️ GitHub Actions Workflows

The repository includes three CI/CD workflows:

1. **nashedy_build.yml**: Builds and deploys to GitHub Pages
2. **netlify-deploy.yml**: Builds and deploys to Netlify
3. **vercel-deploy.yml**: Builds and deploys to Vercel

## 📝 Setup Instructions

To set up this project for deployment:

1. **Fork this repository** to your GitHub account
2. **Configure secrets** for your deployment platform:
   - For Netlify: Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets
   - For Vercel: Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets
3. **Enable GitHub Actions** in your repository settings
4. **Push changes** to the `main` branch to trigger deployments

## 🚀 Local Development

To run the site locally:

1. Install Zola (Rust-based static site generator)
2. Run `zola serve` to start the development server
3. Visit `http://127.0.0.1:1111` to view the site

## 🔄 Continuous Integration

This repository is configured for automated "Zero Trust" deployment via GitHub Actions.
Pushing to the main branch triggers the secure build pipeline across all configured platforms.
