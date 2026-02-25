# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains **Vòng Quay May Mắn** (Lucky Wheel) — a Vietnamese-language prize wheel app. It is a pure vanilla HTML/CSS/JS single-page application with no build system, package manager, or dependencies beyond a Google Fonts CDN import.

## Running the App

Open `lucky-wheel/index.html` directly in a browser. There is no build step, server, or compilation required.

## Architecture

The app has three files:

- **`lucky-wheel/index.html`** — Static markup. All major UI regions (wheel canvas, spin button, prize grid, history list, result modal) are defined here as empty containers populated by JS at runtime.
- **`lucky-wheel/js/app.js`** — All application logic. A single flat script with no modules or classes.
- **`lucky-wheel/css/style.css`** — All styling, using CSS custom properties defined on `:root` for the color/design system.

### Key JS patterns

- **Prize configuration** is the `PRIZES` array at the top of `app.js`. Each entry has `label`, `emoji`, `color` (hex), and `weight` (integer for weighted randomness).
- **Spin result** is determined by `getWeightedRandom()` before the animation starts. The wheel visually decelerates to land on the pre-selected prize using a cubic ease-out via `requestAnimationFrame`.
- **Wheel rendering** uses the Canvas 2D API (`drawWheel(rotation)`). Segment geometry is based on equal angular distribution (`segmentAngle = 2π / totalSegments`), ignoring weights visually.
- **LED ring** is 24 absolutely positioned `div` elements placed via trigonometry, animated with `requestAnimationFrame`.
- **History** is kept in the in-memory `spinHistory` array (max 20 items shown); it resets on page refresh.
- Keyboard shortcuts: `Space`/`Enter` triggers spin, `Escape` closes the modal.

### CSS design system

All colors and shadows are CSS custom properties on `:root`. The dark theme uses `--bg-primary: #0a0a1a`. Accent colors `--accent-1` through `--accent-6` map to the prize palette. Glass-morphism cards use `--glass-bg` / `--glass-border` with `backdrop-filter: blur`.

## Modifying Prizes

Edit the `PRIZES` array in `lucky-wheel/js/app.js`. The wheel automatically redraws with however many entries are in the array — `totalSegments` and `segmentAngle` are derived from `PRIZES.length`.
