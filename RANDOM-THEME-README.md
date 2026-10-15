# Random visit themes

The shared website stylesheet now supports 10 curated, contrast-conscious colour palettes. Each new browsing session selects a different palette from the previous visit. The selected palette stays consistent while the visitor navigates between pages in the same tab/session, so forms and content do not unexpectedly change colour mid-task.

## How it works
- A tiny inline script runs before `styles.css` to avoid a flash of the old palette.
- The palette is stored in `sessionStorage` for the current browsing session.
- The most recent palette is stored in `localStorage` only to avoid selecting the same palette on the next fresh visit. No analytics or personal data is stored by this feature.
- If browser storage is blocked, a random palette is selected as a fallback.
- Page layouts, content, logos, image assets, links, forms, contact actions, and the WhatsApp green identity are preserved.

To deploy, publish the complete project folder as usual through your existing Vercel/Git workflow.
