---
name: Thread & Stock
description: A warm, compact administrative workspace for a tailor shop's stockroom.
colors:
  brown: "#6f4b33"
  brown-hover: "#5b3e2b"
  rail: "#553c2d"
  nav-active: "#815b3d"
  amber: "#d9a441"
  chart-received: "#876343"
  ink: "#302b26"
  muted: "#766b60"
  footer-ink: "#716454"
  role-ink: "#715d45"
  chart-ink: "#716558"
  canvas: "#f7f5f1"
  surface: "#ffffff"
  surface-warm: "#fffefa"
  action-ink: "#fffaf5"
  line: "#e8e2da"
  soft: "#f3eee7"
  positive: "#397050"
  negative: "#a1463c"
  status-good-ink: "#356647"
  status-good-bg: "#ecf3eb"
  status-low-ink: "#926014"
  status-low-bg: "#fbf0d6"
  status-out-bg: "#f9ece7"
  balance-ink: "#4b6846"
  balance-bg: "#eff3e9"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "clamp(33px, 3.3vw, 50px)"
    fontWeight: 510
    lineHeight: 1.18
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "27px"
    fontWeight: 640
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 640
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 550
    lineHeight: 1.5
  register:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
  table-heading:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  badge: "5px"
  icon: "6px"
  control: "7px"
  segment: "8px"
  context: "9px"
  panel: "12px"
spacing:
  4: "4px"
  8: "8px"
  10: "10px"
  12: "12px"
  16: "16px"
  20: "20px"
  23: "23px"
  26: "26px"
  32: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brown}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 13px"
  button-primary-hover:
    backgroundColor: "{colors.brown-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 13px"
  button-text:
    textColor: "{colors.brown}"
    typography: "{typography.label}"
    padding: "0"
  button-icon:
    rounded: "{rounded.icon}"
    height: "32px"
    width: "32px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  navigation-active:
    backgroundColor: "{colors.nav-active}"
    rounded: "{rounded.control}"
    padding: "0 13px"
  status-good:
    backgroundColor: "{colors.status-good-bg}"
    textColor: "{colors.status-good-ink}"
    rounded: "{rounded.badge}"
    padding: "3px 7px"
  status-low:
    backgroundColor: "{colors.status-low-bg}"
    textColor: "{colors.status-low-ink}"
    rounded: "{rounded.badge}"
    padding: "3px 7px"
  status-out:
    backgroundColor: "{colors.status-out-bg}"
    textColor: "{colors.negative}"
    rounded: "{rounded.badge}"
    padding: "3px 7px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  balance-preview:
    backgroundColor: "{colors.balance-bg}"
    textColor: "{colors.balance-ink}"
    rounded: "{rounded.segment}"
    padding: "17px 19px"
---

# Design System: Thread & Stock

## Overview

**Creative North Star: "The Organized Stockroom"**

The administrative workspace is designed for a daylit tailor-shop desk: a brown navigation rail anchors a warm light workspace, white registers hold the records, and amber gives selected navigation details and movement charts their familiar warmth. Fine borders and compact Geist typography keep materials, quantities, units, and job references easy to scan.

This is a working stockroom, with the visual weight on finding a record and completing an accurate stock action. Repeated panels, aligned columns, quiet status labels, and a protected editing drawer carry the system across inventory, movements, suppliers, reports, and settings. Thread & Stock remains a provisional demo name; there is no received business logo or shipping raster imagery to extend into a brand system.

**Key Characteristics:**

- Brown administrative navigation around a warm light work area.
- Compact white registers with fine warm borders and right-aligned quantities.
- One self-hosted workhorse type family, with tabular numerals for stock and money.
- Meaningful state color, explicit units, and a live after-balance in movement forms.
- Flat surfaces at rest, with elevation reserved for protected editing and feedback.

## Colors

The palette combines dark wood-like brown, daylight neutrals, and a restrained amber accent; the token frontmatter records the final CSS cascade.

### Primary

- **Stockroom Brown** (`brown`): primary task buttons, text actions, selected tabs, and field carets. **Deep Brown** (`brown-hover`) is its filled-button hover state.
- **Rail Brown** (`rail`): the persistent navigation ground and desktop login story. **Selected Brown** (`nav-active`) identifies the current navigation item.

### Secondary

- **Movement Amber** (`amber`): issued chart bars and their legend; pale amber icon and count accents also distinguish active navigation and attention contexts.
- **Received Brown** (`chart-received`): received chart bars and their legend, paired consistently with Movement Amber.

### Neutral

- **Warm Ink** (`ink`) and **Muted Taupe** (`muted`): primary record text and secondary descriptions.
- **Footer Taupe**, **Role Taupe**, and **Chart Taupe** (`footer-ink`, `role-ink`, `chart-ink`): final small-text foregrounds for their named contexts. These override the earlier, lighter declarations in the stylesheet.
- **Daylight Canvas** (`canvas`): the application ground. **White Register** (`surface`): tables and panels. **Warm White** (`surface-warm`): the header, editing drawer, and selected login role. **Action Cream** (`action-ink`): text on filled brown actions.
- **Warm Line** (`line`) and **Soft Linen** (`soft`): low-emphasis separation and supporting warm surfaces.
- **Receipt Green** (`positive`) and **Issue Red** (`negative`): positive and negative ledger deltas. Stock labels use the dedicated good, low, and out foreground/background pairs. **Balance Green** (`balance-ink`, `balance-bg`) supports the live valid after-balance; an invalid result changes to the existing red error treatment.

### Named Rules

**The Working Color Rule.** Keep the rail brown, the working canvas light, and the registers white; use state color to communicate stock meaning.

**The Paired Status Rule.** Show status text with its dot and pale background, and pair colored quantities with a sign or an explicit unit so color is never the only signal.

## Typography

**Display Font:** Geist Variable, with system-ui and sans-serif fallback.
**Body Font:** the same self-hosted Geist Variable family, imported through Fontsource.

**Character:** restrained, compact, and suited to administrative records. Variable weights provide hierarchy without introducing a second voice; there is no separate display or mono family.

### Hierarchy

- **Display:** the responsive login story, with the frontmatter's display metrics. It is confined to the desktop sign-in composition.
- **Headline:** page titles use the headline role; responsive overrides step down to 25px below 1050px and 24px below 760px. The login form heading is 26px, weight 600, line-height 1.25; the drawer heading is 21px with tighter tracking.
- **Title:** panel headings use the title role; small-screen panel titles reduce to 14px below 450px.
- **Body:** base form text uses the body role. Supporting page copy is usually 12px; register cells use the smaller register role.
- **Label:** ordinary form labels and buttons use the label role. Table headings use the table-heading role. Secondary metadata and status text range from 9px to 11px according to context; this density is part of the pinned administrative implementation, not a general license to shrink new body copy.
- **Numbers:** dashboard facts are typically 27px, weight 620, with tight tracking; detail balances reach 34px. Stock, monetary values, and numeric register cells use tabular numerals and keep their units adjacent.

### Named Rules

**The Stock Number Rule.** Right-align register quantities, retain tabular numerals, and keep units visible wherever a quantity can drive an action.

## Layout

The desktop shell has a fixed rail (232px), a header (70px), and a fluid workspace offset by the rail width. Main content has 30px top padding, 32px horizontal padding, and an 1800px maximum width. Page titles and actions share a row. Four summary facts share one bordered strip; the overview chart and attention list use a 1.7:1 grid with a 22px gap, followed by the recent register. The inventory workspace places tabs and a wrapping search/filter/action toolbar above the register.

Spacing follows the actual compact rhythm in the frontmatter rather than a strict uniform scale: control gaps are commonly 8px or 10px, form grids use 16px, panel interiors use roughly 20px to 26px, and page gutters use 32px. Registers use a 10px heading and 11px body; standard cells have 15px vertical and 22px horizontal padding, with narrower inventory-column insets.

At 1500px and above, horizontal page gutters increase to 40px. At 1200px and below, the rail becomes 210px and gutters 24px. At 1050px and below, overview panels stack, summary facts become a two-column grid, and search takes its own toolbar row. At 760px and below, a 242px off-canvas rail opens over a scrim, the workspace loses its rail offset, the header becomes 62px, and page gutters become 20px. The desktop login story disappears. At 450px and below, title/actions stack and page gutters become 16px.

Wide registers retain their columns and scroll horizontally: inventory has a 900px minimum width, reports 700px, and recent movements 640px. The mobile inventory register explicitly names this scrolling affordance. Drawers are 540px wide, capped at the viewport width, with a fixed header/action region and a scrolling body. Forms use two-column field groups where shown; profile fields collapse to one column on mobile.

## Elevation & Depth

Fine borders, white surfaces, and warm tonal grouping establish depth at rest. Ordinary panels and registers carry no shadow. A dimmed backdrop and side shadow protect the editing drawer; a smaller ambient shadow lifts transient feedback. Selected segments use only a slight inset-context lift.

### Shadow Vocabulary

- **Protected drawer** (`-12px 0 48px #3021141f`): separates the modal editing surface from the workspace.
- **Feedback toast** (`0 6px 24px #38281924`): lifts the fixed status message above content.
- **Selected movement segment** (`0 2px 4px #4b301114`): distinguishes the white selected control from its warm track.
- **Selected demo role** (`0 1px 4px #553c2d12`): the gentlest selected-state lift on the login form.

### Named Rules

**The Flat Register Rule.** Keep ordinary panels and tables flat; reserve shadows for the protected drawer, transient feedback, and the existing selected segments.

## Shapes

Gently rounded rectangles organize the workspace. Panels use the panel radius; controls use the control radius; status labels use the tighter badge radius. Icon buttons, segmented controls, material swatches, and stock context boxes use their corresponding small radii. The modal drawer is a full-height rectangular sheet aligned to the right edge. Circular avatars and state dots retain their native round silhouette.

Fine warm one-pixel borders define cards, fields, table headings, and dividers. The upload field is the existing dashed-border exception. Material-category swatches use simple tinted squares with consistent Lucide package geometry. The spool brand mark is an inline geometric SVG; it is not a supplied business logo.

## Components

### Buttons

Compact, clear task actions. Primary and secondary buttons share the control radius, 8px by 13px padding, an 8px icon gap, and a minimum height of 38px. Primary uses Stockroom Brown and Action Cream; secondary uses white, Warm Ink, and a fine warm border. Primary hover deepens the brown; secondary hover warms its ground and border. Text actions use brown with an underline on hover. Icon buttons are 32px squares with the icon radius. Buttons and links have a visible 3px outline with a 3px offset; disabled buttons reduce opacity to one half and use a not-allowed cursor.

The background transition is 120ms ease. Keep the SVG icon and text aligned; button labels use sentence case. Toolbar and narrow-screen variants reduce type and insets within the same component language.

### Chips

Stock status is a quiet label, not an action: a small colored dot, explicit status text, pale semantic fill, badge radius, and 3px by 7px padding. In-stock, low-stock, and out-of-stock variants retain their distinct foreground/background pairs. Counts and demo/role badges use similarly restrained warm surfaces; they do not compete with primary task buttons.

### Cards / Containers

White panels have a one-pixel Warm Line border, panel radius, and clipped inner content. Panel headings commonly use 20px by 23px padding and align a title/description with its contextual control. Table heading bands and row dividers carry the register structure. Row hover is a subtle warm white. Dashboard summaries use internal dividers instead of separate floating cards.

### Inputs / Fields

White fields have a fine warm border, control radius, 40px height, and 12px horizontal padding. Form labels sit above fields with a 7px gap; help and errors remain beside the relevant task context. Textareas use 10px by 12px padding and an 85px minimum height. Field focus uses a 2px brown-gold outline with a 2px offset. The search wrapper owns its focus ring. Read-only fields use a warm muted ground; errors use an icon, explanatory text, warm red border, and pale red background. Native required, numeric, and disabled states remain visible.

### Navigation

The fixed brown rail contains the workspace identity, icon-and-text links, local status, account, and sign-out. Links have a 43px minimum height, 13px horizontal inset, 11px icon gap, and control radius. Hover warms the brown; the current item uses Selected Brown, light text, and an amber icon. Current-page semantics accompany the visual state. On mobile, the same rail slides in over a scrim and has explicit open/close controls.

### Stock drawer and after-balance

The native modal dialog protects editing focus and scrolls its own body. Header, form body, and bottom actions remain distinct through borders and warm white surfaces. The movement form keeps receive/issue/reconcile selection above material context, then quantity, live after-balance, and reference/reason fields. The live preview displays the calculated balance and unit, switching to an explicit error state if the result is negative. Desktop movement drawer entry uses a short horizontal arrival (200ms, `cubic-bezier(.16,1,.3,1)`); mobile rail entry uses the same timing. Reduced-motion preference collapses animation and transition duration.

### Movement chart

Paired brown received bars and amber issued bars count transactions rather than combining unlike stock units. Quiet dashed horizontal guides, final Chart Taupe axis labels, and a text legend support reading. Date-label density adapts to chart width and preserves the final date without colliding with the penultimate tick. The chart includes an accessible title and a hidden data table.

## Do's and Don'ts

### Do:

- **Do** preserve the brown rail, warm light canvas, white registers, and compact Geist hierarchy.
- **Do** keep quantities right-aligned with tabular numerals and explicit units.
- **Do** use fine warm borders and tonal groups to organize ordinary working surfaces.
- **Do** keep the live after-balance and job or purchase reference close to the quantity action.
- **Do** preserve visible focus, semantic status text, reduced-motion behavior, and mobile table scrolling.
- **Do** use the final small-text foreground tokens rather than the superseded lighter declarations.

### Don't:

- **Don't** add texture, raster decoration, or ornamental material simulation to this administrative world.
- **Don't** use green, amber, or red as an arbitrary decorative status signal.
- **Don't** give ordinary register panels the drawer or toast shadow.
- **Don't** detach an actionable quantity from its unit or substitute color for its status text.
- **Don't** add kickers or eyebrows above headings; let the heading carry its own hierarchy.

Not canonized: superseded lighter footer, role-switch, and chart-axis declarations are excluded in favor of the final CSS cascade. No source defects were repaired during extraction. The original workbook remains pending and its import fields provisional; this system makes no claim about the unseen workbook.
