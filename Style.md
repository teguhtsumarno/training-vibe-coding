# Design System Inspired by Google Antigravity

## 1. Visual Theme & Atmosphere

Google Antigravity embodies a minimalist, forward-thinking aesthetic grounded in precision and clarity. The design system favors a near-monochromatic palette with subtle warm and cool grays, creating an air of technical sophistication while maintaining accessibility an2d ease of navigation. The visual language is deliberately restrained, allowing content and interaction to take center stage. Deep charcoal foundations paired with generous whitespace establish a modern, professional environment that feels simultaneously approachable and authoritative. This system prioritizes functional elegance over ornamentation, reflecting a platform designed for developers and technical builders.

**Key Characteristics**
- Minimalist, content-first layout with extensive whitespace
- Subtle grayscale hierarchy with strategic blue accent color
- Rounded button treatments (`9999px` radius for organic, approachable feel)
- Clean typographic progression using Google Sans Flex family
- High contrast for accessibility and legibility
- Flat design language with no decorative shadows
- Responsive, touch-friendly interaction targets

## 2. Color Palette & Roles

### Primary

- **Dominant Dark** (`#121317`): Primary text, primary UI containers, dominant background for navigation and headers
- **Deep Black** (`#000000`): High-contrast text, borders, critical hierarchy elements
- **Pure White** (`#FFFFFF`): Primary background, card surfaces, text on dark backgrounds

### Accent Colors

- **Bright Blue** (`#3279F9`): Primary call-to-action, interactive elements, focus states, link emphasis

### Interactive

- **Medium Gray** (`#45474D`): Secondary text, hover states, disabled states
- **Light Gray Secondary** (`#6A6A71`): Tertiary text, subtle labels, de-emphasized content

### Neutral Scale

- **Charcoal Medium** (`#212226`): Secondary UI containers, subtle borders, background subdivisions
- **Charcoal Dark** (`#18191D`): Deep backgrounds, high-contrast surfaces
- **Soft Gray** (`#B7BFD9`): Light hover overlays, subtle interactive states
- **Muted Lavender** (`#AAB1CC`): Subtle UI accents, light interactive backgrounds

### Surface & Borders

- **Pale Blue** (`#EFF2F7`): Subtle surface overlay, very light background tint
- **Off-White** (`#F8F9FC`): Secondary surface background, card alternatives
- **Light Neutral** (`#E6EAF0`): Subtle divider lines, border definition
- **Lighter Neutral** (`#E1E6EC`): Minimal border definition, very subtle dividers
- **Medium Neutral** (`#2F3034`): Medium-emphasis borders, container outlines

### Semantic / Status

- **Error Red** (`#FF0000`): Error states, validation failures, critical alerts, destructive actions

## 3. Typography Rules

### Font Family

**Primary:** Google Sans Flex, sans-serif, fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif

**Secondary (Symbols):** Google Symbols, system-ui, fallback: Arial, sans-serif

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display/H1 | Google Sans Flex | 80px | 450 | 88px | 0px | Hero headlines, page titles |
| Heading H2 | Google Sans Flex | 42px | 450 | 43.68px | 0px | Section headers, major divisions |
| Large Body | Google Sans Flex | 24px | 450 | 25.92px | 0px | Feature descriptions, lead content |
| Body Standard | Google Sans Flex | 16px | 400 | 24px | 0px | Main paragraph text, copy |
| Navigation/Button | Google Sans Flex | 14.5px | 450 | 21.02px | 0px | Nav items, button text, labels |
| Link | Google Sans Flex | 16px | 400 | 24px | 0px | Hyperlinks, interactive text |
| Caption/Small | Google Sans Flex | 14.5px | 430 | 21.02px | 0px | Supplementary text, hints |
| Icon/Symbol | Google Symbols | 21.75px | 300 | 21.02px | 0px | Icon glyphs and symbols |

### Principles

- Weight `450` dominates the system, creating consistent visual rhythm
- Line height scales proportionally with font size, maintaining breathing room
- Hierarchy relies on size and weight rather than color shifts
- Body text uses weight `400` for improved readability and reduced cognitive load
- All type sizes are pixel-perfect, optimized for screen rendering
- Icon symbols use lighter weight (`300`) for refined appearance
- Maintain minimum 1.2× line-height ratio to ensure accessibility

## 4. Component Stylings

### Buttons

#### Primary Button (Standard)
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#45474D`
- **Font Size:** `14.5px`
- **Font Weight:** `450`
- **Font Family:** Google Sans Flex
- **Padding:** `6px 16px`
- **Border Radius:** `9999px`
- **Border:** `1px solid rgba(0, 0, 0, 0)` (no visible border)
- **Box Shadow:** `none`
- **Height:** `36px`
- **Line Height:** `21.02px`
- **Hover State:** Background `rgba(183, 191, 217, 0.09)`, text `#121317`
- **Focus State:** Outline `2px solid #3279F9`, outline-offset `2px`
- **Active State:** Background `rgba(183, 191, 217, 0.15)`, text `#121317`
- **Disabled State:** Text `#AAB1CC`, background `rgba(0, 0, 0, 0)`, cursor `not-allowed`

#### Secondary Button (With Icon)
- **Background:** `rgba(0, 0, 0, 0)`
- **Text Color:** `#45474D`
- **Font Size:** `14.5px`
- **Font Weight:** `450`
- **Padding:** `6px 8px 6px 16px`
- **Border Radius:** `9999px`
- **Height:** `36px`
- **Display:** `flex`, gap `4px`, align-items `center`
- **Hover State:** Background `rgba(183, 191, 217, 0.09)`

#### Ghost Button (Minimal)
- **Background:** `rgba(0, 0, 0, 0)`
- **Text Color:** `#45474D`
- **Font Size:** `14.5px`
- **Font Weight:** `450`
- **Padding:** `6px 16px`
- **Border Radius:** `9999px`
- **Border:** `none`
- **Height:** `36px`
- **Hover State:** Background `rgba(183, 191, 217, 0.09)`, text `#121317`

#### CTA Button (Download)
- **Background:** `#121317`
- **Text Color:** `#FFFFFF`
- **Font Size:** `14.5px`
- **Font Weight:** `450`
- **Padding:** `10px 20px`
- **Border Radius:** `45px`
- **Height:** `40px`
- **Border:** `1px solid #121317`
- **Box Shadow:** `none`
- **Hover State:** Background `#212226`, border-color `#212226`
- **Focus State:** Outline `2px solid #3279F9`, outline-offset `2px`
- **Active State:** Background `#18191D`

### Cards & Containers

#### Default Card
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E1E6EC`
- **Border Radius:** `16px`
- **Padding:** `24px` to `48px` (context-dependent)
- **Box Shadow:** `none`
- **Hover State:** Background `#F8F9FC`, border `1px solid #E6EAF0`

#### Subtle Container
- **Background:** `#EFF2F7`
- **Border:** `none`
- **Border Radius:** `16px`
- **Padding:** `32px`
- **Box Shadow:** `none`

#### Overlay Container
- **Background:** `rgba(18, 19, 23, 0.05)`
- **Border:** `1px solid rgba(183, 191, 217, 0.1)`
- **Border Radius:** `16px`
- **Padding:** `24px`
- **Backdrop Filter:** `blur(10px)` (optional)

### Inputs & Forms

#### Input Field
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E1E6EC`
- **Border Radius:** `8px`
- **Padding:** `8px 12px`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Font Family:** Google Sans Flex
- **Color:** `#121317`
- **Line Height:** `24px`
- **Placeholder Color:** `#AAB1CC`
- **Focus State:** Border `1px solid #3279F9`, box-shadow `0 0 0 3px rgba(50, 121, 249, 0.1)`
- **Hover State:** Border `1px solid #B7BFD9`, background `#F8F9FC`
- **Error State:** Border `1px solid #FF0000`, background `rgba(255, 0, 0, 0.02)`

#### Label
- **Font Size:** `14.5px`
- **Font Weight:** `450`
- **Color:** `#121317`
- **Margin Bottom:** `8px`
- **Display:** `block`

#### Input Helper Text
- **Font Size:** `12px`
- **Font Weight:** `400`
- **Color:** `#6A6A71`
- **Margin Top:** `4px`

### Navigation

#### Nav Item (Standard)
- **Background:** `rgba(0, 0, 0, 0)`
- **Text Color:** `#121317`
- **Font Size:** `14.5px`
- **Font Weight:** `450`
- **Font Family:** Google Sans Flex
- **Padding:** `8px 16px`
- **Border Radius:** `0px`
- **Border:** `none`
- **Height:** `36px`
- **Line Height:** `21.02px`
- **Hover State:** Background `rgba(183, 191, 217, 0.09)`, text `#121317`
- **Active State:** Background `rgba(183, 191, 217, 0.15)`, text `#121317`, border-bottom `2px solid #3279F9`
- **Focus State:** Outline `2px solid #3279F9`, outline-offset `2px`

#### Dropdown Menu Trigger
- **Display:** `flex`, align-items `center`, gap `4px`
- **Padding:** `8px 16px 8px 8px`
- **Border Radius:** `9999px`
- **Cursor:** `pointer`
- **Hover State:** Background `rgba(183, 191, 217, 0.09)`

#### Dropdown Menu
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E1E6EC`
- **Border Radius:** `16px`
- **Padding:** `8px 0px`
- **Box Shadow:** `0px 4px 12px rgba(0, 0, 0, 0.08)`
- **Position:** `absolute`
- **Z-Index:** `1000`

#### Dropdown Item
- **Padding:** `8px 16px`
- **Color:** `#121317`
- **Font Size:** `14.5px`
- **Font Weight:** `400`
- **Background:** `rgba(0, 0, 0, 0)`
- **Hover State:** Background `rgba(183, 191, 217, 0.09)`
- **Active State:** Background `rgba(50, 121, 249, 0.1)`, color `#3279F9`

### Links

#### Standard Link
- **Background:** `rgba(0, 0, 0, 0)`
- **Text Color:** `#45474D`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Font Family:** Google Sans Flex
- **Text Decoration:** `none`
- **Border Bottom:** `1px solid transparent`
- **Line Height:** `24px`
- **Hover State:** Border-bottom `1px solid #45474D`, color `#121317`
- **Focus State:** Outline `2px solid #3279F9`, outline-offset `2px`, border-radius `4px`
- **Visited State:** Color `#6A6A71`

#### Link with Badge
- **Background:** `rgba(183, 191, 217, 0.09)`
- **Text Color:** `#121317`
- **Font Size:** `14.5px`
- **Font Weight:** `430`
- **Padding:** `8px 16px`
- **Border Radius:** `9999px`
- **Border:** `none`
- **Display:** `inline-flex`, align-items `center`, gap `4px`
- **Hover State:** Background `rgba(183, 191, 217, 0.15)`, color `#3279F9`

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Scale with Usage:**
- `4px`: Micro gaps between icon + text, tightest spacing
- `8px`: Form input padding, small component gaps
- `16px`: Standard padding for buttons, navigation items, internal component spacing
- `24px`: Card padding, section subsections, moderate spacing
- `32px`: Larger card padding, spacing between related components
- `36px`: Component height alignment, structural spacing
- `48px`: Large card padding, feature section spacing
- `60px`: Major section separation (less common)
- `64px`: Margin between major page sections
- `72px`: Header/footer spacing, large vertical divisions
- `88px`: Hero section padding, maximum breathing room
- `120px`: Page margin (top), container edge spacing

### Grid & Container

- **Max Width:** `1440px` for standard layouts, `1200px` for contained content
- **Column Strategy:** 12-column grid at desktop, 6-column at tablet, 4-column at mobile
- **Gutter:** `24px` between columns at desktop, `16px` at tablet, `12px` at mobile
- **Container Padding:** `48px` left/right on desktop, `32px` on tablet, `16px` on mobile
- **Section Patterns:** Full-bleed sections use `#FFFFFF` or `#EFF2F7` backgrounds with contained content via wrapper divs

### Whitespace Philosophy

Whitespace is a first-class citizen in this design system. Generous negative space surrounds interactive elements, content blocks, and sections. This breathing room reduces cognitive load and establishes visual hierarchy through absence rather than color. Minimum 32–64px vertical spacing separates distinct content areas. Smaller 8–16px spacing clusters related elements. Horizontal rhythm mirrors vertical; avoid cramped layouts at any breakpoint.

### Border Radius Scale

- `0px`: Sharp edges for tables, strict grid structures
- `4px`: Input fields, slight softness for form controls
- `8px`: Minimal rounding for subtle definition
- `9999px`: Buttons, pill-shaped badges, interactive affordances, approachability
- `16px`: Cards, containers, modal windows, primary spatial boundaries
- `45px`: Large CTA buttons, premium download action
- `2376px`: Extreme rounding (rarely used, decorative elements only)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (0) | No shadow, `box-shadow: none` | Standard surfaces, cards, containers |
| Hover (1) | `0px 2px 4px rgba(0, 0, 0, 0.08)` | Hovered card, tooltip approach |
| Overlay (2) | `0px 4px 12px rgba(0, 0, 0, 0.08)` | Dropdown menus, modal windows, floating panels |
| Lifted (3) | `0px 8px 20px rgba(0, 0, 0, 0.12)` | Floating action buttons, premium modals |
| Maximum (4) | `0px 12px 32px rgba(0, 0, 0, 0.16)` | Full-page overlays, critical alerts |

**Shadow Philosophy:** This design system avoids excessive layering through shadows. Depth is established through proximity, color shifts, and borders rather than drop shadows. Shadows are minimal and only applied to floating UI elements (dropdowns, modals) that must visually separate from the background. The flat aesthetic reinforces the technical, approachable nature of the platform. All shadows use soft black with low opacity to maintain subtlety and reduce visual noise.

## 7. Do's and Don'ts

### Do

- **Use `#121317` as the primary text color** for all body content and high-contrast UI
- **Apply `9999px` border radius to all interactive buttons** for consistent, friendly affordance
- **Maintain 8–16px padding within buttons** for comfortable tap targets
- **Pair Google Sans Flex weight 450 with weight 400** for clear hierarchy without excessive weight variation
- **Use `#3279F9` sparingly** as an accent color for primary CTAs, focus states, and active navigation
- **Place cards on `#FFFFFF` backgrounds** with `1px solid #E1E6EC` borders for definition
- **Include minimum 24px vertical spacing** between content sections
- **Test all interactive states** (hover, focus, active, disabled) with sufficient color contrast
- **Use transparent backgrounds** (`rgba(0, 0, 0, 0)`) for buttons and navigation items to maintain visual lightness
- **Nest interactive targets in touch-friendly zones** of minimum `44px × 44px`
- **Apply subtle overlay backgrounds** (`rgba(183, 191, 217, 0.09)`) for hover states on interactive elements

### Don't

- **Don't use colors outside the defined palette** without explicit approval
- **Don't apply shadows to static card surfaces** unless floating above the page
- **Don't mix font families within a single section** (stick to Google Sans Flex)
- **Don't reduce padding below `6px`** in buttons or form elements
- **Don't use border radius below `4px`** except for specialized grid structures
- **Don't apply multiple interactive states simultaneously** (hover + active) in UI
- **Don't display text smaller than `14.5px`** for readability
- **Don't create color combinations with less than 4.5:1 contrast ratio** against backgrounds
- **Don't use `#FF0000` (red) for non-critical or non-error elements**
- **Don't nest interactive elements more than 2 levels deep** in dropdown menus
- **Don't apply decorative text transforms** (uppercase, lowercase) to body copy
- **Don't remove focus indicators** for keyboard accessibility

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | `0px – 599px` | Single-column layout, 16px container padding, 12px gutter, full-width cards, 36px hero text size |
| Tablet | `600px – 1023px` | 2–3 column grid, 32px container padding, 16px gutter, 56px heading text |
| Desktop | `1024px – 1439px` | 3–4 column grid, 48px container padding, 24px gutter, full typography hierarchy |
| Wide | `1440px+` | Max-width container at 1440px, centered layout, 64px horizontal padding |

### Touch Targets

- **Minimum interactive target size:** `44px × 44px` (iOS guideline)
- **Recommended button height:** `36px` with 8–16px padding
- **Minimum link hit area:** `24px` line-height with 4–8px vertical padding
- **Form input height:** `36px` minimum with 8px internal padding
- **Dropdown target:** `36px` height, expand dropdown below/above based on viewport space

### Collapsing Strategy

- **Buttons:** At mobile, stack vertically with `100%` width; at tablet+, display inline
- **Navigation:** Hamburger menu (icon only) at `< 600px`; horizontal nav at `600px+`
- **Typography:** Reduce heading sizes by 20–30% at mobile (`56px → 42px` for H2)
- **Padding/Margins:** Halve spacing at mobile (`48px → 24px`), maintain full at desktop
- **Columns:** Collapse multi-column grids to single-column at mobile; restore at tablet breakpoint
- **Images:** Use `max-width: 100%` with `height: auto` for fluid scaling
- **Containers:** Expand to full available width at mobile; apply max-width constraints at desktop

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA Button:** Dominant Dark (`#121317`)
- **Secondary CTA Button:** Bright Blue (`#3279F9`)
- **Primary Text:** Dominant Dark (`#121317`)
- **Secondary Text:** Medium Gray (`#45474D`)
- **Background:** Pure White (`#FFFFFF`)
- **Surface Subtle:** Off-White (`#F8F9FC`)
- **Surface Accent:** Pale Blue (`#EFF2F7`)
- **Heading Text:** Deep Black (`#000000`)
- **Border/Divider:** Light Neutral (`#E1E6EC`)
- **Disabled Text:** Muted Lavender (`#AAB1CC`)
- **Error State:** Error Red (`#FF0000`)
- **Hover Overlay:** Soft Gray at `rgba(183, 191, 217, 0.09)`

### Iteration Guide

1. **All buttons must use `border-radius: 9999px`** to maintain the organic, pill-shaped affordance
2. **Font family is always Google Sans Flex** with weight 450 for UI text, weight 400 for body copy
3. **Primary button text color is `#45474D`** on transparent background; use solid `#121317` background only for premium/download actions
4. **Every interactive element requires focus state:** `outline: 2px solid #3279F9` with `outline-offset: 2px`
5. **Card and container borders are `1px solid #E1E6EC`** with `border-radius: 16px`
6. **Spacing between major sections is minimum `64px`** vertical margin; use `24px` for internal component spacing
7. **Hover state for interactive elements is `background: rgba(183, 191, 217, 0.09)`** to maintain lightness
8. **All input fields have `border-radius: 8px`** and `1px solid #E1E6EC` border; focus adds blue border and soft blue shadow
9. **Typography hierarchy uses size and weight, never color changes;** stick to `#121317` text throughout
10. **Error states use `#FF0000`** with `rgba(255, 0, 0, 0.02)` background tint for visibility without harshness
11. **Navigation items remain transparent** (`background: rgba(0, 0, 0, 0)`) until hover/active; active state adds bottom border or background tint
12. **Shadows are applied only to floating UI** (dropdowns, modals) using `0px 4px 12px rgba(0, 0, 0, 0.08)` or greater