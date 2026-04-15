# Klementina Tattoo - Hugo Website

A Hugo port of the Klementina Tattoo artist portfolio website with bilingual support (English/German).

## Features

- **Bilingual Support**: Full English and German translations
- **Responsive Design**: Mobile-first, works on all devices
- **Gallery with Lightbox**: Click images to view enlarged
- **Contact Form**: With file upload support (integrates with Formspree)
- **Language Switcher**: Easy language switching in navigation
- **Smooth Scroll Navigation**: Elegant scrolling to sections
- **Minimal CSS**: Custom utility classes (no Tailwind dependency)

## Structure

```
klementina-hugo/
├── archetypes/
│   └── default.md
├── assets/
│   └── css/
│       └── main.css
├── content/
│   ├── en/
│   │   └── _index.md
│   └── de/
│       └── _index.md
├── i18n/
│   ├── en.toml
│   └── de.toml
├── layouts/
│   ├── _default/
│   │   ├── baseof.html
│   │   ├── list.html
│   │   └── single.html
│   ├── partials/
│   │   ├── about.html
│   │   ├── contact.html
│   │   ├── footer.html
│   │   ├── gallery.html
│   │   ├── hero.html
│   │   ├── navbar.html
│   │   └── scripts.html
│   └── index.html
├── static/
├── hugo.toml
└── README.md
```

## Setup

1. **Install Hugo**: Follow instructions at https://gohugo.io/installation/

2. **Navigate to the project**:
   ```bash
   cd klementina-hugo
   ```

3. **Run the development server**:
   ```bash
   hugo server -D
   ```

4. **Build for production**:
   ```bash
   hugo
   ```
   The built site will be in the `public/` directory.

## Configuration

### Contact Form
The contact form is configured to work with [Formspree](https://formspree.io/). To make it functional:

1. Sign up at Formspree and create a new form
2. Copy your form endpoint URL (e.g., `https://formspree.io/f/YOUR_FORM_ID`)
3. Update the form action in `layouts/partials/contact.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_ACTUAL_FORM_ID" ...>
   ```

### Images
Currently uses Unsplash placeholder images. To use your own images:

1. Add images to `static/images/`
2. Update image URLs in the partials:
   - `layouts/partials/hero.html`
   - `layouts/partials/gallery.html`
   - `layouts/partials/about.html`

### Custom Domain
Update `baseURL` in `hugo.toml` with your actual domain.

## Deployment

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `hugo`
3. Set publish directory: `public`
4. Deploy!

### Vercel
Similar to Netlify, connect repo and use `hugo` as build command.

### GitHub Pages
Build locally with `hugo` and push the `public/` directory to a `gh-pages` branch.

## Customization

### Colors
Main colors used (from original design):
- Background: `#FAFAF8`
- Text Primary: `#1A1A1A`
- Text Secondary: `#6B6B6B`
- Accent/Neutral: `#E8E5E0`, `#D9D5CF`

### Fonts
- Serif: Cormorant Garamond (headings)
- Sans: Inter (body text)

Both loaded from Google Fonts CDN.

## Credits

Original React site ported to Hugo static site generator.
