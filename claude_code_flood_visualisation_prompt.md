# Claude Code Prompt — Flood Event Visualisation Project

## Project Goal

Build an interactive HTML/CSS/JavaScript data visualisation in VSCode using **D3.js**.

Use the exported QGIS dataset:

```text
data/four_city_events.csv
```

This dataset contains unique recorded flood events across four UK cities:

- Hull
- York
- Great Yarmouth
- Greater London

---

# Dataset Notes

Each row represents one unique flood event (`rec_grp_id`) within a city boundary.

Likely columns include:

- city
- rec_grp_id
- fxg_year
- fxg_month
- fxg_season
- fxg_flood_src
- fxg_flood_caus
- fxg_name
- fxg_start_date
- fxg_end_date

---

# Step 1 — Data Preparation

Load and clean the CSV using D3.

## Requirements

1. Load:

```text
data/four_city_events.csv
```

2. Parse:

- `fxg_year` as number
- `fxg_month` as number

3. Use `rec_grp_id` as unique event ID.

4. Remove rows with missing or invalid year.

5. Group by:

```text
city + fxg_year
```

6. For each city-year calculate:

- `event_count` = number of unique flood events
- `dominant_season` = season with highest frequency
- retain raw records for tooltip

7. If `flood_src` or `flood_caus` missing:

```text
Unknown
```

---

# Step 2 — Main Visualisation

Create a **Four-City Small Multiple Temporal Chart**

## Layout

Desktop:

```text
2 × 2 grid
```

Mobile:

```text
single column
```

Panels:

- Hull
- York
- Great Yarmouth
- Greater London

## Visual Encoding

### X Axis

```text
Year
```

### Y Axis

```text
Annual Flood Event Count
```

(Number of unique recorded flood events per year)

### Line

Thin connected annual trend line.

### Points

One circular point per year.

### Point Position

- Horizontal = Year
- Vertical = Event Count

### Point Colour = Dominant Season

| Season | Colour |
|--------|--------|
| Spring | #97d8c4 |
| Summer | #f4b942 |
| Autumn | #6b9ac4 |
| Winter | #4059ad |
| Unknown | #999999 |

## Tooltip (Hover)

Show:

- City
- Year
- Event Count
- Dominant Season
- Event IDs
- Flood Source(s)
- Flood Cause(s)
- Start / End Date if available

## Titles

### Main Title

Temporal Patterns of Recorded Flood Events Across Selected UK Cities

### Subtitle

Annual counts are based on unique recorded flood event IDs (rec_grp_id). Point colour indicates the dominant season of events in each city-year.

---

# Summary Table

| City | Total Recorded Flood Events |
|------|-----------------------------|
| Hull | 10 |
| York | 16 |
| Great Yarmouth | 3 |
| Greater London | 73 |

---

# Interpretation Note

These counts represent distinct recorded flood events intersecting each city boundary, not flooded area, damage, or risk intensity. Larger areas such as Greater London may naturally contain more recorded events.

---

# Design Style

Use a clean academic / modern publication style.

# Required Colour Palette

## CSS Variables

```css
:root {
  --sapphire: #4059ad;
  --blue-grey: #6b9ac4;
  --pearl-aqua: #97d8c4;
  --platinum: #eff2f1;
  --sunflower-gold: #f4b942;
}
```

## Colour Usage Guide

- Background: `--platinum`
- Main Titles / Axes / Key Text: `--sapphire`
- Secondary Text / Gridlines: `--blue-grey`
- Cards / Hover Highlights: `--pearl-aqua`
- Emphasis / Important Values: `--sunflower-gold`

## Chart Styling

- subtle gridlines
- elegant spacing
- rounded tooltip box
- soft shadows
- responsive layout
- clean typography
- refined legend

---

# Technical Requirements

Use:

- HTML
- CSS
- Vanilla JavaScript
- D3.js CDN

Create:

```text
index.html
style.css
script.js
```

## Behaviour Requirements

- responsive resizing
- animated chart load
- smooth hover transitions
- clear tooltip positioning
- no React

## Error Handling

If CSV fails, show:

```text
Unable to load dataset.
```

Also log detailed error in console.

---

# Final Request

Please generate complete production-ready code for:

- index.html
- style.css
- script.js

Using the styling, colour palette, and visual logic above.
