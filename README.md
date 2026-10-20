# Gist Play

A zero-dependency directory of single-page HTML apps.

## Structure
- `src/`: Source apps. Individual folders containing `index.html`.
- `helpers/`: Shared `header.html` and `footer.html`.
- `dist/`: Generated build output.

## Metadata
Each `index.html` requires an `APP-META` block:
```html
<!-- APP-META
Title: My App
Description: Description...
Category: Tools
Status: published
Updated: 1712444281
Disable-Footer: true // if you don't want to add footer
-->
```

## Usage
Requires Go.
- `go run ./bin build`: Generate `dist/`.
- `go run ./bin preview`: Start local server.
- `go run ./bin update-metadata`: Update timestamps.
- Or use `task build`, `task dev`, `task preview`.

## Deployment
Automated via GitHub Actions.
