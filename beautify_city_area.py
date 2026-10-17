from pathlib import Path
from bs4 import BeautifulSoup
import re, json, zipfile, os, shutil, hashlib, subprocess, collections

ROOT = Path('/mnt/data/beautify_city_area_work')
CSS = ROOT / 'styles.css'
REPORT = ROOT / 'CITY-AREA-THEME-REPAIR.md'
css = CSS.read_text(encoding='utf-8')

# Map a city/metro to a restrained secondary accent. The current random theme remains
# responsible for the main palette; these accents only give each location family a marker.
REGION_ACCENTS = {
    'zirakpur': '#E36A4F',
    'mohali': '#2C9D8F',
    'chandigarh': '#5379D2',
    'panchkula': '#8D68BE',
    'kharar': '#7A9253',
    'derabassi': '#D77938',
    'new-chandigarh': '#B48A32',
    'delhi': '#3D83B9',
    'gurgaon': '#7B70D6',
    'noida': '#159C94',
    'ahmedabad': '#B45D35',
    'bangalore': '#2D8962',
    'chennai': '#1B7896',
    'hyderabad': '#A36B25',
    'kolkata': '#A84155',
    'mumbai': '#3D63B8',
    'pune': '#8254A0',
}

changed_area_classes = 0
changed_city_classes = 0
html_files = sorted(ROOT.glob('*.html'))
for path in html_files:
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    if not soup.body:
        continue
    body_classes = soup.body.get('class', [])
    if 'theme-area' in body_classes:
        # Derive region from the breadcrumb's actual city guide link; no guessing based on locality names.
        region = None
        crumb = soup.select_one('.area-hero .crumb')
        if crumb:
            for a in crumb.find_all('a', href=True):
                m = re.fullmatch(r'movers-in-([a-z0-9-]+)\.html', a['href'].strip())
                if m:
                    region = m.group(1)
                    break
        if region and region in REGION_ACCENTS:
            cls = f'area-region--{region}'
            if cls not in body_classes:
                body_classes.append(cls)
                soup.body['class'] = body_classes
                path.write_text(str(soup), encoding='utf-8')
                changed_area_classes += 1
    elif 'theme-city' in body_classes and path.name.startswith('movers-in-'):
        slug = path.stem.replace('movers-in-', '')
        cls = f'city-region--{slug}'
        if cls not in body_classes:
            body_classes.append(cls)
            soup.body['class'] = body_classes
            path.write_text(str(soup), encoding='utf-8')
            changed_city_classes += 1

# Add a clean, late-loaded presentation layer for all city and area pages.
# It deliberately leaves navigation, quote form logic, and contact controls alone.
block = r'''

/* ===========================================================================
   CITY + AREA PAGE PRESENTATION REPAIR
   Purpose: give all city guides and locality guides a coherent, polished content
   hierarchy while preserving the existing copy, links, quote flow and contact UI.
   Theme variables remain driven by the visitor's existing 30-palette session theme.
   =========================================================================== */

/* Location accents: a small signature colour for the city family; the visit's
   selected palette still supplies the page's primary/background/text colours. */
html[data-vmp-theme] body.theme-city,
html[data-vmp-theme] body.theme-area {
  --vmp-local-accent: var(--vmp-accent, #1769D2);
  color: var(--vmp-text, #223247) !important;
  background:
    radial-gradient(ellipse at 8% 2%, rgba(var(--vmp-rgb, 21,62,110), .095), transparent 33%),
    radial-gradient(ellipse at 94% 24%, rgba(var(--vmp-rgb, 21,62,110), .055), transparent 30%),
    linear-gradient(180deg, var(--vmp-bg, #F5F8FC) 0%, var(--vmp-soft, #E9F0FA) 100%) !important;
}

html[data-vmp-theme] body.city-region--zirakpur,
html[data-vmp-theme] body.area-region--zirakpur { --vmp-local-accent: #E36A4F; }
html[data-vmp-theme] body.city-region--mohali,
html[data-vmp-theme] body.area-region--mohali { --vmp-local-accent: #2C9D8F; }
html[data-vmp-theme] body.city-region--chandigarh,
html[data-vmp-theme] body.area-region--chandigarh { --vmp-local-accent: #5379D2; }
html[data-vmp-theme] body.city-region--panchkula,
html[data-vmp-theme] body.area-region--panchkula { --vmp-local-accent: #8D68BE; }
html[data-vmp-theme] body.city-region--kharar,
html[data-vmp-theme] body.area-region--kharar { --vmp-local-accent: #7A9253; }
html[data-vmp-theme] body.city-region--derabassi,
html[data-vmp-theme] body.area-region--derabassi { --vmp-local-accent: #D77938; }
html[data-vmp-theme] body.city-region--new-chandigarh,
html[data-vmp-theme] body.area-region--new-chandigarh { --vmp-local-accent: #B48A32; }
html[data-vmp-theme] body.city-region--delhi,
html[data-vmp-theme] body.area-region--delhi { --vmp-local-accent: #3D83B9; }
html[data-vmp-theme] body.city-region--gurgaon,
html[data-vmp-theme] body.area-region--gurgaon { --vmp-local-accent: #7B70D6; }
html[data-vmp-theme] body.city-region--noida,
html[data-vmp-theme] body.area-region--noida { --vmp-local-accent: #159C94; }
html[data-vmp-theme] body.city-region--ahmedabad,
html[data-vmp-theme] body.area-region--ahmedabad { --vmp-local-accent: #B45D35; }
html[data-vmp-theme] body.city-region--bangalore,
html[data-vmp-theme] body.area-region--bangalore { --vmp-local-accent: #2D8962; }
html[data-vmp-theme] body.city-region--chennai,
html[data-vmp-theme] body.area-region--chennai { --vmp-local-accent: #1B7896; }
html[data-vmp-theme] body.city-region--hyderabad,
html[data-vmp-theme] body.area-region--hyderabad { --vmp-local-accent: #A36B25; }
html[data-vmp-theme] body.city-region--kolkata,
html[data-vmp-theme] body.area-region--kolkata { --vmp-local-accent: #A84155; }
html[data-vmp-theme] body.city-region--mumbai,
html[data-vmp-theme] body.area-region--mumbai { --vmp-local-accent: #3D63B8; }
html[data-vmp-theme] body.city-region--pune,
html[data-vmp-theme] body.area-region--pune { --vmp-local-accent: #8254A0; }

/* CITY GUIDE: synchronize the page canvas, hero, stats and theme accents. */
html[data-vmp-theme] body.theme-city {
  min-height: 100vh;
  background-color: var(--vmp-bg, #F5F8FC) !important;
}
html[data-vmp-theme] body.theme-city .hero {
  isolation: isolate;
  position: relative;
  max-width: none !important;
  margin: 0 !important;
  padding: clamp(38px, 5.4vw, 72px) max(18px, calc((100% - 1160px) / 2)) clamp(42px, 5.8vw, 78px) !important;
  gap: clamp(28px, 4.5vw, 58px) !important;
  background:
    radial-gradient(ellipse at 12% 12%, rgba(var(--vmp-rgb), .10), transparent 36%),
    radial-gradient(ellipse at 94% 84%, rgba(var(--vmp-rgb), .08), transparent 31%),
    linear-gradient(135deg, var(--vmp-surface, #fff), var(--vmp-soft, #E9F0FA)) !important;
  border-bottom: 1px solid var(--vmp-border, #D7E1ED) !important;
}
html[data-vmp-theme] body.theme-city .hero::before {
  width: min(36vw, 420px) !important;
  height: min(36vw, 420px) !important;
  left: -110px !important;
  top: auto !important;
  bottom: -190px !important;
  border: 1px solid rgba(var(--vmp-rgb), .08) !important;
  background: radial-gradient(circle, rgba(var(--vmp-rgb), .08), transparent 70%) !important;
  z-index: -1 !important;
}
html[data-vmp-theme] body.theme-city .hero::after {
  width: clamp(220px, 32vw, 390px) !important;
  height: clamp(220px, 32vw, 390px) !important;
  right: -150px !important;
  top: -165px !important;
  border: 55px solid rgba(var(--vmp-rgb), .045) !important;
  pointer-events: none !important;
}
html[data-vmp-theme] body.theme-city .hero h1.headline,
html[data-vmp-theme] body.theme-city h1.headline {
  color: var(--vmp-text, #192B41) !important;
  font-size: clamp(36px, 5.5vw, 66px) !important;
  line-height: 1.03 !important;
  letter-spacing: -.052em !important;
  text-wrap: balance;
}
html[data-vmp-theme] body.theme-city .hero h1.headline em,
html[data-vmp-theme] body.theme-city h1.headline em {
  color: var(--vmp-local-accent, var(--vmp-accent)) !important;
  text-decoration-color: var(--vmp-highlight) !important;
  text-decoration-thickness: .08em;
  text-underline-offset: .12em;
}
html[data-vmp-theme] body.theme-city .hero .eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 999px !important;
  background: var(--vmp-surface, #fff) !important;
  color: var(--vmp-primary, #153E6E) !important;
  padding: 9px 13px !important;
  box-shadow: 0 6px 18px rgba(var(--vmp-rgb), .07) !important;
  letter-spacing: .105em !important;
  line-height: 1.4;
}
html[data-vmp-theme] body.theme-city .hero .eyebrow::before {
  background: var(--vmp-local-accent, var(--vmp-highlight)) !important;
  box-shadow: 0 0 0 4px rgba(var(--vmp-rgb), .09);
}
html[data-vmp-theme] body.theme-city .hero .hero-sub {
  max-width: 650px !important;
  color: var(--vmp-muted, #5A6C80) !important;
  line-height: 1.78 !important;
  font-size: clamp(15px, 1.4vw, 17px) !important;
}
html[data-vmp-theme] body.theme-city .hero-stat {
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 17px !important;
  background: linear-gradient(145deg, rgba(255,255,255,.96), rgba(var(--vmp-rgb), .035)) !important;
  box-shadow: 0 10px 25px rgba(var(--vmp-rgb), .055) !important;
}
html[data-vmp-theme] body.theme-city .hero-stat .num { color: var(--vmp-primary, #153E6E) !important; }
html[data-vmp-theme] body.theme-city .hero-stat .lbl { color: var(--vmp-muted, #5A6C80) !important; line-height: 1.45; }
html[data-vmp-theme] body.theme-city .quote-launch-card--universal {
  border: 1px solid rgba(var(--vmp-rgb), .16) !important;
  border-radius: 26px !important;
  background: linear-gradient(150deg, rgba(255,255,255,.94), rgba(var(--vmp-rgb), .055)) !important;
  box-shadow: 0 24px 58px rgba(var(--vmp-rgb), .12), inset 0 1px 0 rgba(255,255,255,.95) !important;
  backdrop-filter: blur(18px) saturate(1.18);
  -webkit-backdrop-filter: blur(18px) saturate(1.18);
}
html[data-vmp-theme] body.theme-city .stamps-strip {
  background: linear-gradient(100deg, var(--vmp-primary-deep), var(--vmp-primary)) !important;
  border-top: 1px solid rgba(255,255,255,.13) !important;
  border-bottom: 1px solid rgba(var(--vmp-rgb), .18) !important;
}
html[data-vmp-theme] body.theme-city .stamps-strip .stamp-circle {
  border-color: var(--vmp-highlight) !important;
  background: rgba(255,255,255,.08) !important;
  color: var(--vmp-highlight) !important;
}
html[data-vmp-theme] body.theme-city .visual-gallery {
  max-width: 1160px !important;
  width: calc(100% - 36px) !important;
  margin: 28px auto !important;
  padding: clamp(22px, 3.6vw, 38px) !important;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 28px !important;
  background: linear-gradient(145deg, var(--vmp-surface, #fff), var(--vmp-soft, #E9F0FA)) !important;
  box-shadow: 0 16px 42px rgba(var(--vmp-rgb), .055) !important;
}
html[data-vmp-theme] body.theme-city .visual-gallery__head .section-title,
html[data-vmp-theme] body.theme-city .visual-gallery .section-title { color: var(--vmp-text) !important; }

/* CITY + AREA CONTENT BLOCKS: this was the missing visual layer behind the added SEO copy. */
html[data-vmp-theme] body.theme-city .sitewide-related,
html[data-vmp-theme] body.theme-area .sitewide-related {
  position: relative !important;
  isolation: isolate !important;
  box-sizing: border-box !important;
  width: calc(100% - clamp(24px, 5vw, 64px)) !important;
  max-width: 1160px !important;
  margin: clamp(18px, 2.8vw, 30px) auto !important;
  padding: clamp(22px, 3.6vw, 40px) !important;
  overflow: hidden !important;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: clamp(20px, 2.7vw, 28px) !important;
  background:
    radial-gradient(ellipse at 100% 0%, rgba(var(--vmp-rgb), .055), transparent 34%),
    linear-gradient(145deg, rgba(255,255,255,.96), rgba(var(--vmp-rgb), .025)) !important;
  box-shadow: 0 16px 40px rgba(var(--vmp-rgb), .055), inset 0 1px 0 rgba(255,255,255,.9) !important;
}
html[data-vmp-theme] body.theme-city .sitewide-related::before,
html[data-vmp-theme] body.theme-area .sitewide-related::before {
  content: "" !important;
  position: absolute !important;
  z-index: -1 !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 3px !important;
  opacity: .95 !important;
  background: linear-gradient(90deg, var(--vmp-primary), var(--vmp-local-accent, var(--vmp-accent)), var(--vmp-highlight)) !important;
}
html[data-vmp-theme] .sitewide-related__head {
  max-width: 820px !important;
  margin: 0 0 24px !important;
}
html[data-vmp-theme] .sitewide-related__eyebrow {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin: 0 0 12px !important;
  padding: 7px 10px !important;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 999px !important;
  background: var(--vmp-soft, #E9F0FA) !important;
  color: var(--vmp-primary, #153E6E) !important;
  font: 800 10px/1.35 'Work Sans', sans-serif !important;
  letter-spacing: .13em !important;
  text-transform: uppercase !important;
}
html[data-vmp-theme] .sitewide-related__eyebrow::before {
  content: "" !important;
  width: 6px !important;
  height: 6px !important;
  flex: 0 0 6px !important;
  border-radius: 50% !important;
  background: var(--vmp-local-accent, var(--vmp-accent)) !important;
  box-shadow: 0 0 0 4px rgba(var(--vmp-rgb), .09) !important;
}
html[data-vmp-theme] .sitewide-related__head h2,
html[data-vmp-theme] .sitewide-related__head h3 {
  max-width: 800px !important;
  margin: 0 0 12px !important;
  color: var(--vmp-text, #192B41) !important;
  font: 800 clamp(24px, 3vw, 34px)/1.14 'Plus Jakarta Sans', 'Work Sans', sans-serif !important;
  letter-spacing: -.04em !important;
  text-wrap: balance !important;
}
html[data-vmp-theme] .sitewide-related__head p {
  max-width: 760px !important;
  margin: 0 !important;
  color: var(--vmp-muted, #5A6C80) !important;
  font: 400 clamp(14px, 1.25vw, 16px)/1.75 'Work Sans', sans-serif !important;
}
html[data-vmp-theme] .sitewide-related__grid {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  align-items: stretch !important;
  gap: 14px !important;
  width: 100% !important;
  margin: 0 !important;
}
html[data-vmp-theme] .sitewide-related__grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
html[data-vmp-theme] .sitewide-related__card {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  gap: 10px !important;
  min-width: 0 !important;
  min-height: 126px !important;
  box-sizing: border-box !important;
  padding: 18px 18px 17px !important;
  overflow-wrap: anywhere !important;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 17px !important;
  background: linear-gradient(145deg, #fff, rgba(var(--vmp-rgb), .025)) !important;
  color: var(--vmp-text, #192B41) !important;
  text-decoration: none !important;
  box-shadow: 0 7px 22px rgba(var(--vmp-rgb), .045), inset 0 1px 0 rgba(255,255,255,.9) !important;
  transition: transform .24s cubic-bezier(.2,.7,.2,1), box-shadow .24s ease, border-color .24s ease, background .24s ease !important;
}
html[data-vmp-theme] .sitewide-related__card strong {
  display: block !important;
  color: var(--vmp-primary, #153E6E) !important;
  font: 800 15px/1.35 'Plus Jakarta Sans', 'Work Sans', sans-serif !important;
  letter-spacing: -.015em !important;
}
html[data-vmp-theme] .sitewide-related__card span {
  display: block !important;
  color: var(--vmp-muted, #5A6C80) !important;
  font: 500 12.5px/1.6 'Work Sans', sans-serif !important;
}
html[data-vmp-theme] .sitewide-related__card b {
  display: inline-block !important;
  margin-left: 4px !important;
  color: var(--vmp-local-accent, var(--vmp-accent)) !important;
  font-size: 16px !important;
  transition: transform .22s ease !important;
}
html[data-vmp-theme] .sitewide-related__card:hover,
html[data-vmp-theme] .sitewide-related__card:focus-visible {
  transform: translateY(-3px) !important;
  border-color: rgba(var(--vmp-rgb), .34) !important;
  background: linear-gradient(145deg, #fff, rgba(var(--vmp-rgb), .055)) !important;
  box-shadow: 0 14px 30px rgba(var(--vmp-rgb), .105) !important;
}
html[data-vmp-theme] .sitewide-related__card:hover b { transform: translateX(4px) !important; }
html[data-vmp-theme] .sitewide-related__card:focus-visible,
html[data-vmp-theme] .sitewide-related__pill:focus-visible {
  outline: 3px solid var(--vmp-highlight, #F3C65E) !important;
  outline-offset: 3px !important;
}
html[data-vmp-theme] .sitewide-related__content {
  display: block !important;
  min-width: 0 !important;
  padding: clamp(17px, 2.6vw, 26px) !important;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 20px !important;
  background: linear-gradient(145deg, rgba(255,255,255,.92), rgba(var(--vmp-rgb), .035)) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9) !important;
}
html[data-vmp-theme] .sitewide-related__content p,
html[data-vmp-theme] .sitewide-related__content li {
  color: var(--vmp-muted, #5A6C80) !important;
  font: 400 14px/1.8 'Work Sans', sans-serif !important;
}
html[data-vmp-theme] .sitewide-related__content p { margin: 0 0 15px !important; max-width: 920px !important; }
html[data-vmp-theme] .sitewide-related__content h3,
html[data-vmp-theme] .sitewide-related__subhead h3,
html[data-vmp-theme] .sitewide-related__content h2 {
  margin: 24px 0 12px !important;
  color: var(--vmp-text, #192B41) !important;
  font: 800 17px/1.35 'Plus Jakarta Sans', 'Work Sans', sans-serif !important;
  letter-spacing: -.02em !important;
}
html[data-vmp-theme] .sitewide-related__content h3:first-child { margin-top: 0 !important; }
html[data-vmp-theme] .sitewide-related__content ul,
html[data-vmp-theme] .sitewide-related__checklist {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 9px !important;
  margin: 12px 0 20px !important;
  padding: 0 !important;
  list-style: none !important;
}
html[data-vmp-theme] .sitewide-related__content li,
html[data-vmp-theme] .sitewide-related__checklist li {
  position: relative !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: 12px 13px 12px 34px !important;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 13px !important;
  background: rgba(255,255,255,.78) !important;
}
html[data-vmp-theme] .sitewide-related__content li::before,
html[data-vmp-theme] .sitewide-related__checklist li::before {
  content: "✓" !important;
  position: absolute !important;
  left: 12px !important;
  top: 12px !important;
  display: grid !important;
  place-items: center !important;
  width: 15px !important;
  height: 15px !important;
  border-radius: 50% !important;
  background: var(--vmp-soft, #E9F0FA) !important;
  color: var(--vmp-primary, #153E6E) !important;
  font: 800 10px/1 'Work Sans', sans-serif !important;
}
html[data-vmp-theme] .sitewide-related__pills {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 9px !important;
  margin: 10px 0 0 !important;
}
html[data-vmp-theme] .sitewide-related__pill {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  max-width: 100% !important;
  min-height: 39px !important;
  padding: 9px 13px !important;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 999px !important;
  background: var(--vmp-surface, #fff) !important;
  color: var(--vmp-primary, #153E6E) !important;
  font: 700 12px/1.4 'Work Sans', sans-serif !important;
  text-decoration: none !important;
  box-shadow: 0 5px 14px rgba(var(--vmp-rgb), .04) !important;
  transition: transform .2s ease, border-color .2s ease, background .2s ease !important;
}
html[data-vmp-theme] .sitewide-related__pill:hover {
  transform: translateY(-2px) !important;
  border-color: var(--vmp-local-accent, var(--vmp-accent)) !important;
  background: var(--vmp-soft, #E9F0FA) !important;
}
html[data-vmp-theme] .sitewide-related__subhead { margin: 26px 0 12px !important; }
html[data-vmp-theme] .sitewide-related__subhead h3 { margin: 0 !important; font-size: 15px !important; }
html[data-vmp-theme] .sitewide-related__note {
  margin: 18px 0 0 !important;
  padding: 13px 15px !important;
  border-left: 3px solid var(--vmp-local-accent, var(--vmp-accent)) !important;
  border-radius: 0 12px 12px 0 !important;
  background: var(--vmp-soft, #E9F0FA) !important;
  color: var(--vmp-muted, #5A6C80) !important;
  font: 500 12px/1.7 'Work Sans', sans-serif !important;
}

/* Alternate city sections so pages have a deliberate rhythm, not one repeated slab. */
html[data-vmp-theme] body.theme-city .sitewide-related--city-planning {
  background: linear-gradient(145deg, var(--vmp-soft, #E9F0FA), rgba(255,255,255,.97)) !important;
}
html[data-vmp-theme] body.theme-city .sitewide-related--searches {
  background: linear-gradient(145deg, rgba(var(--vmp-rgb), .045), #fff 68%) !important;
}
html[data-vmp-theme] body.theme-city .sitewide-related--process {
  border-color: var(--vmp-primary-deep, #0B2645) !important;
  background: linear-gradient(135deg, var(--vmp-primary-deep, #0B2645), var(--vmp-primary, #153E6E)) !important;
  box-shadow: 0 22px 52px rgba(var(--vmp-rgb), .16) !important;
}
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__eyebrow {
  color: var(--vmp-highlight, #F3C65E) !important;
  border-color: rgba(255,255,255,.16) !important;
  background: rgba(255,255,255,.08) !important;
}
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__head h2,
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__head h3 { color: #fff !important; }
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__head p { color: rgba(255,255,255,.78) !important; }
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__card {
  border-color: rgba(255,255,255,.17) !important;
  background: linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.055)) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.11) !important;
}
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__card strong { color: #fff !important; }
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__card span { color: rgba(255,255,255,.78) !important; }
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__card b { color: var(--vmp-highlight, #F3C65E) !important; }
html[data-vmp-theme] body.theme-city .sitewide-related--process .sitewide-related__note {
  color: rgba(255,255,255,.84) !important;
  background: rgba(255,255,255,.08) !important;
  border-left-color: var(--vmp-highlight) !important;
}

/* FAQ: simple accordions with obvious tap targets and readable expanded answers. */
html[data-vmp-theme] body.theme-city .city-faq-section .faq-list {
  display: grid !important;
  gap: 10px !important;
}
html[data-vmp-theme] body.theme-city .city-faq-section .faq-item {
  overflow: hidden !important;
  border: 1px solid var(--vmp-border, #D7E1ED) !important;
  border-radius: 16px !important;
  background: var(--vmp-surface, #fff) !important;
  box-shadow: 0 6px 20px rgba(var(--vmp-rgb), .045) !important;
}
html[data-vmp-theme] body.theme-city .city-faq-section .faq-q {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 16px !important;
  width: 100% !important;
  min-height: 58px !important;
  padding: 15px 18px !important;
  border: 0 !important;
  background: transparent !important;
  color: var(--vmp-text, #192B41) !important;
  text-align: left !important;
  font: 750 14px/1.5 'Work Sans', sans-serif !important;
  cursor: pointer !important;
}
html[data-vmp-theme] body.theme-city .city-faq-section .faq-q:hover,
html[data-vmp-theme] body.theme-city .city-faq-section .faq-item.open .faq-q { color: var(--vmp-primary, #153E6E) !important; }
html[data-vmp-theme] body.theme-city .city-faq-section .faq-q .plus {
  display: grid !important;
  place-items: center !important;
  width: 28px !important;
  height: 28px !important;
  flex: 0 0 28px !important;
  margin: 0 !important;
  border-radius: 50% !important;
  background: var(--vmp-soft, #E9F0FA) !important;
  color: var(--vmp-primary, #153E6E) !important;
  font: 500 18px/1 'Work Sans', sans-serif !important;
}
html[data-vmp-theme] body.theme-city .city-faq-section .faq-a { padding: 0 18px !important; }
html[data-vmp-theme] body.theme-city .city-faq-section .faq-a p {
  padding: 0 0 18px !important;
  max-width: 900px !important;
  color: var(--vmp-muted, #5A6C80) !important;
  font: 400 13.5px/1.8 'Work Sans', sans-serif !important;
}
html[data-vmp-theme] body.theme-city .city-faq-section .faq-item.open .faq-a { max-height: 520px !important; }

/* AREA GUIDES: one shared editorial layout; only the location accent changes. */
html[data-vmp-theme] body.theme-area .area-hero {
  border-bottom-color: var(--vmp-local-accent, var(--vmp-highlight)) !important;
  padding-top: clamp(34px, 5.4vw, 68px) !important;
  padding-bottom: clamp(38px, 5vw, 60px) !important;
}
html[data-vmp-theme] body.theme-area .area-hero .crumb {
  max-width: 100% !important;
  overflow-wrap: anywhere !important;
}
html[data-vmp-theme] body.theme-area .area-hero h1 { max-width: 900px !important; }
html[data-vmp-theme] body.theme-area .area-hero p { max-width: 760px !important; }
html[data-vmp-theme] body.theme-area .sitewide-related--nearby .sitewide-related__grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
html[data-vmp-theme] body.theme-area .sitewide-related--area .sitewide-related__head {
  padding-left: 16px !important;
  border-left: 3px solid var(--vmp-local-accent, var(--vmp-accent)) !important;
}
html[data-vmp-theme] body.theme-area .sitewide-related--area .sitewide-related__content {
  background: linear-gradient(145deg, rgba(255,255,255,.95), rgba(var(--vmp-rgb), .035)) !important;
}

/* Responsive grid and type scale. */
@media (max-width: 980px) {
  html[data-vmp-theme] .sitewide-related__grid,
  html[data-vmp-theme] .sitewide-related__grid--three,
  html[data-vmp-theme] body.theme-area .sitewide-related--nearby .sitewide-related__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  html[data-vmp-theme] body.theme-city .hero { gap: 26px !important; }
}
@media (max-width: 640px) {
  html[data-vmp-theme] body.theme-city .hero {
    grid-template-columns: minmax(0, 1fr) !important;
    padding: 34px 16px 44px !important;
    gap: 22px !important;
  }
  html[data-vmp-theme] body.theme-city .hero h1.headline,
  html[data-vmp-theme] body.theme-city h1.headline { font-size: clamp(32px, 9vw, 45px) !important; }
  html[data-vmp-theme] body.theme-city .hero .hero-sub { font-size: 14px !important; line-height: 1.72 !important; }
  html[data-vmp-theme] body.theme-city .hero-stat { min-width: 0 !important; padding: 11px 12px !important; }
  html[data-vmp-theme] body.theme-city .visual-gallery,
  html[data-vmp-theme] body.theme-city .sitewide-related,
  html[data-vmp-theme] body.theme-area .sitewide-related {
    width: calc(100% - 22px) !important;
    margin: 14px auto !important;
    padding: 21px 15px !important;
    border-radius: 20px !important;
  }
  html[data-vmp-theme] .sitewide-related__head { margin-bottom: 18px !important; }
  html[data-vmp-theme] .sitewide-related__head h2 { font-size: clamp(22px, 6vw, 28px) !important; }
  html[data-vmp-theme] .sitewide-related__head p { font-size: 13px !important; line-height: 1.7 !important; }
  html[data-vmp-theme] .sitewide-related__grid,
  html[data-vmp-theme] .sitewide-related__grid--three,
  html[data-vmp-theme] body.theme-area .sitewide-related--nearby .sitewide-related__grid {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 9px !important;
  }
  html[data-vmp-theme] .sitewide-related__card { min-height: auto !important; padding: 15px !important; border-radius: 15px !important; }
  html[data-vmp-theme] .sitewide-related__card strong { font-size: 14px !important; }
  html[data-vmp-theme] .sitewide-related__card span { font-size: 12px !important; }
  html[data-vmp-theme] .sitewide-related__content { padding: 15px !important; border-radius: 16px !important; }
  html[data-vmp-theme] .sitewide-related__content ul,
  html[data-vmp-theme] .sitewide-related__checklist { grid-template-columns: minmax(0, 1fr) !important; }
  html[data-vmp-theme] body.theme-city .city-faq-section .faq-q { padding: 13px 13px !important; font-size: 13px !important; }
  html[data-vmp-theme] body.theme-city .city-faq-section .faq-a { padding: 0 13px !important; }
}
@media (hover: none) {
  html[data-vmp-theme] .sitewide-related__card:hover,
  html[data-vmp-theme] .sitewide-related__pill:hover { transform: none !important; }
}
@media (prefers-reduced-motion: reduce) {
  html[data-vmp-theme] .sitewide-related__card,
  html[data-vmp-theme] .sitewide-related__pill,
  html[data-vmp-theme] .city-faq-section .faq-q,
  html[data-vmp-theme] body.theme-city .hero::before,
  html[data-vmp-theme] body.theme-city .hero::after { transition: none !important; animation: none !important; }
}
'''

marker = '/* ===========================================================================\n   CITY + AREA PAGE PRESENTATION REPAIR'
if marker not in css:
    CSS.write_text(css + block, encoding='utf-8')
else:
    print('block already present; not duplicating')

REPORT.write_text('''# City and area page theme repair\n\n## Changes\n- Added a scoped visual system for all city and locality guide sections, which previously had content classes but no shared styles for the newly added SEO panels and related-link grids.\n- Reused the existing 30-session-theme CSS variables for primary surfaces, text, borders, glows, cards and section accents.\n- Added subtle locality-specific accent colours while retaining the selected theme as the main palette.\n- Improved city hero backgrounds, stats, quote launcher surface, service gallery, planning panels, process panel, common-request chips, FAQ accordions, and area-guide breadcrumbs/content cards.\n- Added responsive layouts for desktop, tablet and mobile with reduced-motion support.\n- Did not change text content, links, quote-form JavaScript, navigation, Call buttons, WhatsApp buttons, or their click targets.\n\n## Files\n- `styles.css`: shared presentation changes, loaded across the existing site.\n- `area-*.html`: body classes added to identify their parent city for location-specific accent styling.\n- `movers-in-*.html`: city region classes added for a matching location accent.\n\n## Validation\nStatic checks are reported in `CITY-AREA-VALIDATION.json`. A full visual browser screenshot was not available during this update; preview representative city and area pages at desktop and mobile widths before deployment.\n''', encoding='utf-8')

print('HTML files',len(html_files),'area region classes',changed_area_classes,'city classes',changed_city_classes)
