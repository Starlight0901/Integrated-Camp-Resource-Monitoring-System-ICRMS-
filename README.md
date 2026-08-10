# ICRMS

## Integrated Camp Resource Monitoring System

ICRMS is a centralized monitoring dashboard that provides visibility into resource and utility conditions across geographically distributed camp sites in Sri Lanka. The current implementation is a **demonstration prototype** that uses **deterministic dummy telemetry data** while maintaining a service-layer architecture that can later be connected to real telemetry sources.

---

## Overview

ICRMS addresses the need for a single operational view across multiple remote camp locations. Operators can assess fleet-wide status at a glance, drill into individual sites, review live readings, inspect historical trends, and respond to active alarms — all from one web interface.

The dashboard monitors four resource metrics per camp:

- **Apparent Power** — electrical load
- **Temperature** — environmental/operational temperature
- **Water Tank Level** — stored water volume
- **Fuel Level** — stored fuel volume

Users interact with the application through:

1. A **homepage** with an interactive Sri Lanka map and camp location cards
2. **Camp detail pages** with live telemetry, active alarms, and historical trend charts
3. A global **alarm bell panel** for fleet-wide alert visibility

Centralized monitoring is useful because operational issues at one site (low fuel, high temperature, power anomalies) can be detected alongside fleet-wide patterns without visiting each location individually.

> **Note:** All telemetry, alarms, and camp statuses in the current version are generated from seeded dummy data. No live sensors, SCADA systems, or backend APIs are connected.

---

## Key Features

### Geographic Monitoring

- Interactive Sri Lanka map (Leaflet / React Leaflet)
- Camp markers at representative city-level coordinates
- Status-colored markers (Online, Warning, Critical, Offline)
- Clickable map popups with camp status and navigation to camp dashboards
- Map legend showing site count and active alarm count

### Camp Monitoring

- Individual camp dashboards at `/camp/:campId`
- Current telemetry readings for all four metrics
- Operational status badge derived from active alarms
- Camp identification, location, coordinates, and site overview image
- Last updated timestamp aligned with the telemetry timeline

### Resource Monitoring

- **Apparent Power** (kVA)
- **Temperature** (°C)
- **Water Tank Level** (m³)
- **Fuel Level** (L)
- Per-metric status indicators (Online / Warning / Critical)
- Capacity percentage bars for tank metrics (water and fuel)

### Historical Telemetry

- **7-day** historical period (default UI view)
- **5-minute** sampling interval
- Approximately **2,016 data points** per metric per camp (7 × 24 × 12)
- Interactive area/line trend charts (Recharts)
- Min, Average, Max, and Current statistics
- Metric-specific chart colors (blue/green telemetry palette)
- Current dashboard value matches the latest historical point

### Alarm & Alert Monitoring

- Active alarms derived from threshold evaluation on current telemetry
- **Warning** and **Critical** severity levels
- Global alarm bell with count badge and dropdown list
- Camp-specific alarm sections on detail pages
- Alarm-driven camp status propagation to map markers and camp cards
- Click-through navigation from alarms to the relevant camp metric chart

### UI / UX

- **Light Mode** — primary/default theme
- **Dark Mode** — supported alternative (persisted in `localStorage`)
- Responsive layout for map, cards, and charts
- Corporate color system (red, grey, white, black)
- Loading skeletons, error states, and empty states
- Professional industrial monitoring interface

---

## Demo Sites

Four demonstration camp locations are configured. Coordinates are **representative city-level positions** for demo purposes — not precise installation coordinates.

| Camp | Location | Demo Status | Primary Demo Scenario |
| ---- | -------- | ----------- | --------------------- |
| **Colombo Camp** | Colombo, Western Province | Online | Healthy baseline operation |
| **Trincomalee Camp** | Trincomalee, Eastern Province | Warning | Elevated temperature crossing warning threshold |
| **Jaffna Camp** | Jaffna, Northern Province | Online | Healthy baseline operation |
| **Galle Camp** | Galle, Southern Province | Critical | Declining fuel level without refuel events |

These statuses are intentionally distributed (**2 Online / 1 Warning / 1 Critical**) to demonstrate different operational states across the fleet. Status is derived automatically from alarm evaluation — not hard-coded per camp.

Camp site images are stored in `public/images/camps/` (`colombo.svg`, `trincomalee.svg`, `jaffna.svg`, `galle.svg`).

---

## Dashboard Structure

```text
Homepage (/)
   │
   ├── Global Header
   │      ├── ICRMS branding
   │      ├── Theme toggle (Light / Dark)
   │      └── Alarm bell panel
   │
   ├── Sri Lanka Map
   │      ├── Colombo Camp
   │      ├── Trincomalee Camp
   │      ├── Jaffna Camp
   │      └── Galle Camp
   │
   └── Camp Location Cards
           │
           └── Camp Detail Page (/camp/:campId)
                    │
                    ├── Camp header (status, last updated)
                    ├── Site overview image
                    ├── Live telemetry cards
                    ├── Active alarms (if any)
                    └── Historical trend modal (on metric click)
```

**Routes:**

| Path | Page | Description |
| ---- | ---- | ----------- |
| `/` | Overview | Map + camp cards |
| `/camp/:campId` | Camp Dashboard | Site detail, telemetry, alarms |
| `*` | Not Found | 404 page |

---

## Homepage

The homepage (`OverviewPage` → `OverviewView`) contains:

- **ICRMS header** — sticky global header with branding, theme switcher, and alarm notification bell
- **Operational Map** — full-width Sri Lanka map with camp markers
- **Camp markers** — color-coded by operational status; popups show status and an "Open dashboard" action
- **Camp status** — reflected on markers, cards, and the map legend
- **Camp Location Cards** — grid of cards showing camp name, location, status badge, all four metric readings, and last updated time

**User interactions:**

- Click a **camp location card** → navigates to `/camp/:campId`
- Click a **map marker popup** → navigates to the camp dashboard
- Click the **alarm bell** → opens a dropdown of active alarms across all camps; selecting an alarm navigates to `/camp/:campId?metric=:metricKey` and opens the historical chart for that metric

---

## Camp Detail Page

The camp detail page (`CampDashboardPage` → `CampDashboardView`) includes:

| Section | Content |
| ------- | ------- |
| **Navigation** | Back link to overview |
| **Camp identification** | Camp name, location, coordinates |
| **Operational status** | Status badge (Online / Warning / Critical / Offline) |
| **Last updated** | Timestamp from the active telemetry index |
| **Site overview** | Camp image with coordinate overlay |
| **Live telemetry** | Four clickable metric cards with status and capacity bars |
| **Active alarms** | "Requires Attention" section (shown only when alarms exist) |
| **Historical telemetry** | Modal chart opened by clicking a metric card or alarm |

Clicking a **metric card** opens the **Telemetry History Modal** showing a 7-day trend chart with Current, Minimum, Average, and Maximum values.

Clicking an **alarm row** opens the same modal, pre-focused on the alarm's metric (via `?metric=` URL parameter).

If a camp is configured as **Offline** (supported in data profiles but not used by any current demo camp), telemetry panels are replaced with an offline state message.

---

## Telemetry Metrics

| Metric | Unit | Label in UI | Configured Range | Description |
| ------ | ---- | ------------- | ---------------- | ----------- |
| Apparent Power | kVA | Apparent Power | 80 – 200 kVA | Electrical apparent power with diurnal load variation |
| Temperature | °C | Temperature | 24 – 26 °C | Environmental temperature with daily cycles |
| Water Tank Level | m³ | Water Tank | 1 – 50 m³ | Water storage level with consumption and refill events |
| Fuel Level | L | Fuel | 1 – 20,000 L | Fuel storage with consumption and refuel events |

Tank metrics (water, fuel) also display **capacity percentage** relative to the configured maximum.

---

## Historical Telemetry

| Property | Value |
| -------- | ----- |
| Period | 7 days |
| Interval | 5 minutes |
| Points per metric/camp | 2,016 (`7 × 24 × 12`) |
| Data source | Deterministic seeded generator |
| Reference end time | `2026-08-10T08:00:00.000Z` (fixed anchor) |
| Live advancement | Disabled (`DEMO_LIVE_TELEMETRY = false`) |

The historical dataset simulates realistic telemetry behavior:

- **Power** — diurnal load curves, demand events, camp-specific volatility
- **Temperature** — daily min/max cycles aligned to Sri Lanka local time (UTC+5:30)
- **Water** — consumption bursts, stable periods, and refill events
- **Fuel** — declining consumption with periodic refueling (disabled for Galle demo)

Camp-specific profiles in `src/data/constants.ts` control base values, consumption rates, and demo narrative parameters (e.g., Galle's scripted fuel decline to a critical endpoint).

The **current metric value** displayed on dashboards corresponds to the **latest point** in the historical series at the active telemetry index. A development verification utility confirms this alignment (`src/data/verifyDemoSnapshot.ts`).

The telemetry service supports `24h`, `48h`, and `7d` query ranges, but the UI currently displays **7 days only**.

---

## Alarm System

### Severity Levels

| Severity | Meaning |
| -------- | ------- |
| **Warning** | Metric crossed a warning threshold |
| **Critical** | Metric crossed a critical threshold |

### Threshold Rules

Thresholds are defined in `src/data/alarmThresholds.ts` and evaluated against current telemetry values:

#### Temperature

| Severity | Condition |
| -------- | --------- |
| Warning | > 25.5 °C |
| Critical | > 26.0 °C |

#### Fuel Level (percentage of 20,000 L max capacity)

| Severity | Condition |
| -------- | --------- |
| Warning | < 30% capacity (< 6,000 L) |
| Critical | < 15% capacity (< 3,000 L) |

#### Water Tank Level (percentage of 50 m³ max capacity)

| Severity | Condition |
| -------- | --------- |
| Warning | < 30% capacity (< 15 m³) |
| Critical | < 15% capacity (< 7.5 m³) |

#### Apparent Power (relative to 80–200 kVA range)

| Severity | Condition |
| -------- | --------- |
| Warning (lower) | ≤ 94.4 kVA (min + 12% of range) |
| Critical (lower) | ≤ 86.0 kVA (min + 5% of range) |
| Warning (upper) | ≥ 185.6 kVA (max − 12% of range) |
| Critical (upper) | ≥ 194.0 kVA (max − 5% of range) |

### Alarm Flow

```text
Telemetry (current values at active index)
        ↓
Threshold Evaluation (evaluateMetricAlarm)
        ↓
Active Alarms (deriveAlarmsFromCamps)
        ↓
Camp Operational Status (calculateCampOperationalStatus)
        ↓
Map Markers / Camp Cards / Camp Dashboard / Alarm Bell
```

### Alarm Display

- **Global:** Alarm bell in header with active count; critical alarms highlight the bell in red
- **Camp page:** "Requires Attention" section listing camp-specific active alarms
- **Navigation:** Alarm selection navigates to the camp dashboard with the related metric chart open

Alarm timestamps are estimated from the most recent threshold crossing in the historical series when available.

> **Note:** The `Alarm` type includes an `acknowledged` status field, but alarm acknowledgement is **not implemented** in the UI. All derived alarms are always `active`.

---

## Camp Status

Operational status labels used throughout the UI:

| Status | UI Label | Meaning |
| ------ | -------- | ------- |
| `online` | ONLINE | No active warning or critical alarms |
| `warning` | WARNING | At least one active warning alarm |
| `critical` | CRITICAL | At least one active critical alarm |
| `offline` | OFFLINE | Explicitly configured offline in camp profile data |

### Status Derivation

Camp status is computed in `calculateCampOperationalStatus()`:

1. If the camp profile has `offline: true` → **Offline**
2. Else if any active **critical** alarm exists for the camp → **Critical**
3. Else if any active **warning** alarm exists → **Warning**
4. Else → **Online**

Fleet-wide status (`calculateSystemOperationalStatus`) uses the highest severity across all camps: Offline > Critical > Warning > Online.

No demo camp is currently configured as offline, but the offline code path is fully implemented.

---

## Map Implementation

| Component | Technology |
| --------- | ---------- |
| Map library | [Leaflet](https://leafletjs.com/) v1.9 |
| React integration | [React Leaflet](https://react-leaflet.js.org/) v5 |
| Base tiles | CARTO Light / Dark (OpenStreetMap data) |
| Bounds | Sri Lanka bounding box (prevents panning far off-island) |
| Zoom range | 7 – 12 |

**Features:**

- Theme-aware tile layers (light tiles in Light Mode, dark tiles in Dark Mode)
- Custom camp markers with status color, alarm indicator, and camp name label
- Marker z-index prioritizes critical camps
- Auto-fit bounds to visible camp markers (`MapCampBounds`)
- Popup with status badge, alarm count, and dashboard navigation
- Map legend overlay (site count, alarm count, status key)

Camp coordinates are city-level demo positions defined in `CAMP_PROFILES` (`src/data/constants.ts`).

---

## UI Design

### Corporate Palette

| Color | Usage |
| ----- | ----- |
| **Red** (`--cw-brand`, `--cw-status-critical`) | Brand accent and critical alarm severity — intentionally restrained |
| **Grey** | Surfaces, borders, muted text |
| **White** | Primary light-mode surfaces |
| **Black / Charcoal** | Dark-mode backgrounds and primary text |

Red is reserved for brand accents and critical conditions to avoid visual overload.

### Telemetry Visualization

| Color | Usage |
| ----- | ----- |
| **Blue** (`--cw-telemetry-blue`) | Apparent Power and Water Tank chart series |
| **Green** (`--cw-telemetry-green`) | Temperature and Fuel chart series |

Blue and green distinguish telemetry trends from alarm severity colors (amber warning, red critical).

### Themes

| Theme | Description |
| ----- | ----------- |
| **Light Mode** | Primary/default experience; neutral enterprise palette |
| **Dark Mode** | Alternative theme; toggled via header control |

Theme preference is stored in `localStorage` under the key `icrms-theme`. The initial theme defaults to **light** unless a stored preference exists.

Design tokens are defined as CSS custom properties in `src/styles/index.css` and consumed via Tailwind `cw-*` utility classes. Typography uses **Inter** (UI) and **JetBrains Mono** (telemetry values) from Google Fonts.

---

## Technology Stack

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| React | ^19.2 | Frontend UI framework |
| React DOM | ^19.2 | DOM rendering |
| TypeScript | ~6.0 | Type safety |
| Vite | ^8.2 | Development server and production bundler |
| React Router | ^7.18 | Client-side routing |
| Tailwind CSS | ^4.3 | Utility-first styling (`@tailwindcss/vite` plugin) |
| Leaflet | ^1.9 | Interactive map engine |
| React Leaflet | ^5.0 | React bindings for Leaflet |
| Recharts | ^3.10 | Telemetry trend charts |
| Lucide React | ^1.31 | Icon library |
| Oxlint | ^1.75 | Linting (dev) |

---

## Project Architecture

```text
Integrated-Camp-Resource-Monitoring-System-ICRMS-/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── images/camps/          # Camp site SVG illustrations
├── src/
│   ├── components/
│   │   ├── alarms/            # Alarm bell, list items, navigation
│   │   ├── camp/              # Camp dashboard views and panels
│   │   ├── homepage/          # Camp location cards
│   │   ├── layout/            # Global header
│   │   ├── map/               # Sri Lanka map, markers, legend
│   │   ├── overview/          # Homepage view composition
│   │   ├── telemetry/         # Historical chart modal and utilities
│   │   └── ui/                # Shared UI primitives and states
│   ├── data/
│   │   ├── constants.ts       # Camp profiles, ranges, telemetry config
│   │   ├── telemetryGenerators.ts  # Seeded metric series generators
│   │   ├── generateDataset.ts # Dataset assembly and exports
│   │   ├── alarmDerivation.ts # Alarm derivation from telemetry
│   │   ├── alarmThresholds.ts # Threshold evaluation logic
│   │   ├── campOperationalStatus.ts # Status calculation
│   │   ├── telemetrySnapshot.ts   # Live snapshot builder
│   │   ├── telemetryClock.ts      # Telemetry index resolution
│   │   └── timestamps.ts          # Timestamp axis generation
│   ├── hooks/
│   │   ├── useCamps.ts        # Fleet camp data hook
│   │   ├── useCamp.ts         # Single camp hook
│   │   ├── useAlarms.ts       # Alarm data hook
│   │   ├── useCampTelemetry.ts # Historical telemetry hook
│   │   └── useTelemetryRefresh.ts # Periodic refresh scheduling
│   ├── layouts/
│   │   └── AppShellLayout.tsx # App shell with header + outlet
│   ├── pages/
│   │   ├── OverviewPage.tsx
│   │   ├── CampDashboardPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   ├── dummyTelemetryService.ts  # Demo telemetry service
│   │   ├── telemetryService.types.ts # Service interface
│   │   └── index.ts                  # Active service export
│   ├── styles/
│   │   └── index.css          # Tailwind + design tokens
│   ├── theme/
│   │   ├── ThemeProvider.tsx  # Theme context
│   │   ├── ThemeToggle.tsx    # Theme switch control
│   │   └── chartTheme.ts      # Chart color theming
│   ├── types/                 # TypeScript interfaces
│   ├── utils/                 # Formatting, status styles, helpers
│   ├── App.tsx                # Route definitions
│   └── main.tsx               # Application entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .oxlintrc.json
```

### Directory Responsibilities

| Directory | Responsibility |
| --------- | -------------- |
| `components/` | Presentational React components organized by feature area |
| `pages/` | Route-level page components (thin wrappers over views) |
| `layouts/` | Shared page layout shells |
| `data/` | Dummy data generation, thresholds, status derivation |
| `services/` | Telemetry service abstraction and dummy implementation |
| `hooks/` | Data-fetching hooks wrapping the telemetry service |
| `types/` | Shared TypeScript type definitions |
| `utils/` | Formatting, status styling, and helper functions |
| `theme/` | Theme provider, toggle, and chart color configuration |
| `styles/` | Global CSS, Tailwind imports, design tokens |

Path alias `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

---

## Data Architecture

```text
Camp Profiles (constants.ts)
        ↓
Seeded Telemetry Generators (telemetryGenerators.ts)
        ↓
7-Day Timestamp Axis (timestamps.ts)
        ↓
Generated Dataset (generateDataset.ts)
        ↓
Telemetry Snapshot (telemetrySnapshot.ts)
   ├── Current camp metrics
   └── Derived alarms
        ↓
DummyTelemetryService (dummyTelemetryService.ts)
        ↓
React Hooks (useCamps, useCamp, useAlarms, useCampTelemetry)
        ↓
UI Components
   ├── Map / Camp Cards / Dashboard
   ├── Alarm Bell
   └── Historical Charts
```

The `TelemetryService` interface (`src/services/telemetryService.types.ts`) abstracts all data access. UI components and hooks depend on this interface — not on the dummy generators directly. To connect real telemetry in the future, implement a new service class and swap the export in `src/services/index.ts`.

---

## Dummy Data Generation

Demonstration telemetry is generated deterministically using seeded pseudo-random number generators (`src/data/seededRandom.ts`).

| Property | Detail |
| -------- | ------ |
| Deterministic | Same seed + profile → same data on every load |
| Interval | 5 minutes |
| History | 7 days (2,016 points per metric) |
| Camp profiles | Unique seeds, base power, consumption rates, temp offsets |
| Time anchor | Fixed `DATA_END_TIME` for reproducible demo snapshots |

**Per-metric simulation:**

- **Apparent Power** — diurnal load curves, scheduled demand events, camp-specific volatility
- **Temperature** — daily min/max profiles, Sri Lanka timezone offset, Trincomalee heat events
- **Water Tank** — consumption bursts, stable periods, scheduled refills
- **Fuel** — phased consumption, refuel events (disabled for Galle; scripted decline to critical)

**Alarm-generating scenarios:**

- **Trincomalee** — temperature profile ends above 25.5 °C (warning)
- **Galle** — fuel declines without refueling to below 15% capacity (critical)
- **Colombo / Jaffna** — remain within normal thresholds (online)

This is **demonstration data only** — not real sensor telemetry.

---

## Installation

### Prerequisites

- **Node.js** — LTS version recommended (no specific version pinned in `package.json`)
- **npm** — included with Node.js

### Setup

```bash
git clone https://github.com/Starlight0901/Integrated-Camp-Resource-Monitoring-System-ICRMS-.git
cd Integrated-Camp-Resource-Monitoring-System-ICRMS-
npm install
npm run dev
```

The development server starts via Vite (default: `http://localhost:5173`).

---

## Available Scripts

| Script | Command | Description |
| ------ | ------- | ----------- |
| `dev` | `npm run dev` | Start Vite development server with hot module replacement |
| `build` | `npm run build` | Type-check (`tsc -b`) and produce production bundle |
| `preview` | `npm run preview` | Serve the production build locally |
| `lint` | `npm run lint` | Run Oxlint across the project |

---

## Environment Variables

No environment variables are required to run the application.

The project does not include a `.env` or `.env.example` file. The only runtime environment check is `import.meta.env.DEV` used for development-time dataset validation warnings in `generateDataset.ts`.

| Variable | Purpose | Required |
| -------- | ------- | -------- |
| — | No environment variables are currently used | No |

---

## Development Workflow

1. **Install dependencies** — `npm install`
2. **Start development server** — `npm run dev`
3. **Modify code:**
   - UI changes → `src/components/`, `src/pages/`, `src/layouts/`
   - Dummy data / camp profiles → `src/data/constants.ts`, `src/data/telemetryGenerators.ts`
   - Threshold / alarm logic → `src/data/alarmThresholds.ts`, `src/data/alarmDerivation.ts`
   - Status logic → `src/data/campOperationalStatus.ts`
   - Service layer → `src/services/`
   - Map → `src/components/map/`
   - Charts → `src/components/telemetry/`
   - Theme / design tokens → `src/styles/index.css`, `src/theme/`
4. **Run linting** — `npm run lint`
5. **Build production bundle** — `npm run build`
6. **Preview production build** — `npm run preview`
7. **Verify in browser** — use the manual checklist below

---

## Testing / Verification

### Automated Tests

**No automated test suite is currently configured.** There are no unit, integration, or end-to-end test files in the repository.

### Development Verification Utility

`src/data/verifyDemoSnapshot.ts` is a standalone script that validates:

- Demo camp status distribution (2 online / 1 warning / 1 critical)
- 2,016 points per telemetry series
- Dashboard values match latest historical points
- Series have realistic variation (not flat lines)
- Demo narrative scenarios (Trincomalee temperature, Galle fuel decline)

This script is not wired to an npm script. It can be executed manually with a TypeScript runner if needed.

### Manual Verification Checklist

- [ ] Homepage loads with map and four camp cards
- [ ] Map markers display correct status colors (Colombo/Jaffna online, Trincomalee warning, Galle critical)
- [ ] Clicking a camp card navigates to the camp dashboard
- [ ] Clicking a map popup opens the camp dashboard
- [ ] Camp dashboard shows all four live telemetry metrics
- [ ] Clicking a metric card opens the 7-day historical chart modal
- [ ] Chart displays Current, Min, Average, Max statistics
- [ ] Alarm bell shows active alarm count
- [ ] Clicking an alarm navigates to the relevant camp and metric
- [ ] Trincomalee shows temperature warning alarm
- [ ] Galle shows fuel critical alarm
- [ ] Light Mode renders correctly (default)
- [ ] Dark Mode toggle works and persists on reload
- [ ] Layout is usable on mobile and desktop viewports

---

## Build & Production

```bash
npm run build
```

This runs TypeScript project references build (`tsc -b`) followed by Vite production bundling. Output is written to the `dist/` directory:

```text
dist/
├── index.html
├── assets/          # Bundled JS and CSS
├── favicon.svg
├── icons.svg
└── images/camps/    # Static camp images
```

Preview the production build locally:

```bash
npm run preview
```

No deployment platform or CI/CD pipeline is configured in this repository.

---

## Future Enhancements

The following are **not currently implemented** but represent logical next steps:

- Real-time telemetry APIs and backend services
- SCADA / PLC / IoT gateway integration
- WebSocket or SSE live telemetry streaming
- Historical telemetry database and long-term storage
- User authentication and role-based access control
- Persistent alarm management and alarm acknowledgement workflow
- Notification services (email, SMS, push)
- Configurable threshold management UI
- Additional camp sites and resource/metric types
- Historical range selector in UI (24h / 48h / 7d — service layer already supports these)
- Live telemetry advancement (`DEMO_LIVE_TELEMETRY` toggle exists but is disabled)
- Reporting and data export functionality
- Production deployment configuration and CI/CD pipeline
- Automated test suite

---

## Security Considerations

ICRMS is currently a **client-side demonstration application** with no backend:

- **No authentication or authorization** — the dashboard is open to anyone with access to the URL
- **No API endpoints** — all data is generated in-browser from seeded dummy data
- **No encryption or secure communication** — there is no server-side data exchange
- **No secrets or credentials** — no environment variables or API keys are used
- **External map tiles** — the map loads tile images from CARTO CDN (OpenStreetMap data)

Do not deploy this prototype to production without implementing appropriate access controls and a secure backend if real operational data is involved.

---

## Limitations

| Limitation | Detail |
| ---------- | ------ |
| Simulated telemetry | All readings are generated dummy data |
| No hardware connection | No real-time sensor, SCADA, or IoT integration |
| No backend | Pure frontend SPA — no server-side API or database |
| Fixed demo snapshot | `DEMO_LIVE_TELEMETRY` is disabled; readings do not advance with real time |
| Representative locations | City-level coordinates for demonstration only |
| Alarm acknowledgement | Type defined but not implemented in UI |
| No persistence | Telemetry, alarms, and preferences (except theme) are not stored server-side |
| No automated tests | Manual verification only |
| Single historical range in UI | Charts always show 7 days despite service supporting shorter ranges |

---

## Project Status

**Status: Demonstration / Prototype**

The following is currently functional:

- Fleet overview with interactive Sri Lanka map
- Four demo camps with distinct operational scenarios
- Live telemetry display (from deterministic dummy data)
- 7-day historical trend charts with statistics
- Threshold-based alarm derivation and display
- Camp status propagation across map, cards, and dashboards
- Light and Dark theme support
- Responsive industrial monitoring UI
- Service-layer abstraction ready for future backend integration

---

## Screens / UI Overview

```text
Homepage
├── Global header (ICRMS, theme toggle, alarm bell)
├── Sri Lankan map with status markers
├── Camp location cards (4 sites)
└── Active alarms (via alarm bell dropdown)

Camp Dashboard
├── Back navigation + camp header
├── Site overview image
├── Live telemetry cards (4 metrics)
├── Active alarms section (when applicable)
└── Historical telemetry modal (7-day chart)

Historical View (Modal)
├── Metric title and camp name
├── Current / Min / Average / Max stats
├── Interactive area/line chart (Recharts)
└── Footer: 5-minute interval, 7-day period
```

No screenshots are included in this repository.

---

## Contribution / Development Notes

When extending ICRMS, use these general guidelines:

| Change Type | Location |
| ----------- | -------- |
| UI components / pages | `src/components/`, `src/pages/` |
| Camp profiles / demo data | `src/data/constants.ts` |
| Telemetry generation | `src/data/telemetryGenerators.ts` |
| Alarm thresholds | `src/data/alarmThresholds.ts` |
| Status derivation | `src/data/campOperationalStatus.ts` |
| Service / API integration | `src/services/` |
| Map behavior | `src/components/map/` |
| Charts | `src/components/telemetry/` |
| Theme / colors | `src/styles/index.css`, `src/theme/` |
| Shared types | `src/types/` |

To add a new camp, extend `CAMP_PROFILES` in `src/data/constants.ts` and add a corresponding image in `public/images/camps/`. The telemetry generators, alarm derivation, and map will pick up the new profile automatically.

To connect real telemetry, implement `TelemetryService` with API calls and replace the export in `src/services/index.ts`. No UI changes should be required if the interface contract is maintained.

---

## License

> License information has not yet been specified.
