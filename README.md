# artYSion Website - Real Gallery Build

## Run locally

```bash
npm.cmd install
npm.cmd run dev
```

## Build

```bash
npm.cmd run build
```

## Included in this build

- 86 artwork records loaded from the final Excel workbook.
- 138 optimized artwork image files included under `public/images/artworks/`.
- 16 artistic progressions loaded.
- 80 optimized progression images included under `public/images/progressions/`.
- Home Gallery and Featured sections populated from the Excel flags.
- Gallery search, Available/Sold/Exclusive filters, artwork detail pages, purchase/print/reproduction request flows.
- Subtle `artYSion` watermark overlay on artwork and progression detail viewer images.
- Image right-click and drag-save deterrents enabled.
- Favicon included.

## Important notes

- Right-click protection and watermarks are deterrents, not absolute copy protection.
- Do not upload full-resolution master artwork files to the public website. Use the optimized web images included here.
- Before production launch, update Web3Forms domain settings from localhost to `artysion.com` / `www.artysion.com`.
- Test all forms after deployment: contact, artwork inquiry, purchase request, print request, reproduction request, and commission request.
