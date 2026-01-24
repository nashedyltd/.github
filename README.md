# Nashedy

**Building the Future with Technology and Science.**

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

## Deployment

This repository is configured for automated "Zero Trust" deployment via GitHub Actions.
Pushing to the main branch triggers the secure build pipeline.
