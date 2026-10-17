# City and area page theme repair

## Changes
- Added a scoped visual system for all city and locality guide sections, which previously had content classes but no shared styles for the newly added SEO panels and related-link grids.
- Reused the existing 30-session-theme CSS variables for primary surfaces, text, borders, glows, cards and section accents.
- Added subtle locality-specific accent colours while retaining the selected theme as the main palette.
- Improved city hero backgrounds, stats, quote launcher surface, service gallery, planning panels, process panel, common-request chips, FAQ accordions, and area-guide breadcrumbs/content cards.
- Added responsive layouts for desktop, tablet and mobile with reduced-motion support.
- Did not change text content, links, quote-form JavaScript, navigation, Call buttons, WhatsApp buttons, or their click targets.

## Files
- `styles.css`: shared presentation changes, loaded across the existing site.
- `area-*.html`: body classes added to identify their parent city for location-specific accent styling.
- `movers-in-*.html`: city region classes added for a matching location accent.

## Validation
Static checks are reported in `CITY-AREA-VALIDATION.json`. A full visual browser screenshot was not available during this update; preview representative city and area pages at desktop and mobile widths before deployment.
