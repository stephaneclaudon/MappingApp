# Config.json

### Global
- mode
> 1 -> Start app **WITH** url fetch for auto-nav.  
> 0 -> Start app **WITHOUT** url fetch for auto-nav.
- requestUrl
> URL for auto-nav url fetch.
- landscapeMode
> true -> to use the app in landscape (if needed)
> false -> to use app in portrait


### Projects
- globalRoute
> route for video page

#### Slides
- image
> images sources for slideshow (used as source).
- video
> videos name for slideshow (used as source and route).
- mainColor
> main color for slider platform
- bgImg
> background image for slider
- landscapeBgImg
> landscape background image for slider
- title
> title of the project
- author
> author of the project

### Canvas
- colors
> colors for whiteboard brush.
- brushSizes
> brush sizes for whiteboard brush.
- stickers
> stickers sources for whiteboard stickers.
# Nomenclature

### Branch name
- Fix:
> fix/branch-name
- Features:
> feat/branch-name

### Commit
> Short title + description if needed
> All in english

### Fichiers
> Files names: FileName.ext --> PascalCase

# App setup & running

This template should help get you started developing with Vue 3 in Vite.

## Project Setup

```sh
npm install --force
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
## Files

### Slider

For the slider videos, put them in /public .
Thumbnails goes in /public/thumbnails and backgrounds images goes in /public/slideshowBackgrounds.

