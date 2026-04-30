# Daily Page Spec

## Overview

- `daily` is a puzzle page where a new puzzle is published every day.
- Puzzle data must not be embedded in client-side static assets.
- The client fetches puzzle data from a Workers API at runtime.
- The publication timezone is `Asia/Tokyo`.
- `OGP` can use a fixed image and fixed metadata. A dedicated per-day `OGP` payload is not required.

## Puzzle Metadata

Each daily puzzle has the following metadata:

- `date`
- `difficulty`
- `credit.author`
- `credit.sourceName`
- `credit.sourceUrl`
- `problemCode`

`author` is required. Other credit fields are nullable.

## Data Model

```ts
type Difficulty = 'easy' | 'medium' | 'hard';

interface DailyCredit {
  author: string;
  sourceName: string | null;
  sourceUrl: string | null;
}

interface DailyProblem {
  date: string; // YYYY-MM-DD, Asia/Tokyo
  problemCode: string;
  difficulty: Difficulty;
  credit: DailyCredit;
}
```

## Routing

- The page is served from `daily.html`.
- The current day is shown at `daily.html`.
- Past days are shown with a query parameter: `daily.html?date=YYYY-MM-DD`.
- Date interpretation is based on `Asia/Tokyo`.

## API

Short-term operation only needs the following endpoints:

### `GET /api/daily/today`

Returns the current day's puzzle.

Response:

```ts
DailyProblem
```

### `GET /api/daily/archives`

Returns the list of published past puzzles.

Response:

```ts
{
  items: DailyProblem[];
}
```

Notes:

- `items` should contain enough data to render and open archived puzzles directly.
- For the current plan, this includes `problemCode`.
- The response should contain only already-published puzzles under the Tokyo timezone rule.

## Client Loading Rules

- The client must not contain hardcoded daily puzzle data in bundled assets.
- `daily.html` loads puzzle data by requesting the Workers API after page load.
- When `?date=YYYY-MM-DD` is present:
  - the client fetches `/api/daily/archives`
  - finds the matching item by `date`
  - renders that archived puzzle
- When no `date` query is present:
  - the client fetches `/api/daily/today`
  - renders the current day's puzzle

## Required UI Elements

The `daily` page must include the following:

- fixed `OGP`
- reset button
- credit display
- link or guidance to the tutorial
- button to copy text for social sharing
- references to past daily puzzles

## Screen Layout

The page uses a single-column layout.

- The main reading flow is top to bottom.
- The puzzle canvas is the primary element and should be given the largest area.
- Supporting metadata and controls are placed above and below the puzzle.
- The archive list is placed below the puzzle area.
- The same overall structure is used for both desktop and mobile. Do not switch to a two-column layout.

### Header

The header includes:

- page title: `Daily`
- puzzle date
- difficulty badge
- context label

Context label rules:

- current day: `今日の問題`
- archived day: `過去のDaily`

### Metadata Row

The metadata row includes:

- credit
- source information when available
- tutorial link

### Puzzle Area

- Use the existing puzzle runtime and canvas-based board.
- The puzzle itself is the central interaction area.

### Control Row

The control row includes:

- `リセット`
- `共有文をコピー`
- `今日の問題へ`

`今日の問題へ` is shown only when the user is viewing an archived puzzle.

### Time Display

The page includes a progress/time display.

- before solve: `経過時間`
- after solve: `クリアタイム`

### Archive Section

The archive section is shown below the puzzle.

- section title: `過去のDaily`
- items are shown in descending date order
- each item shows `date`, `difficulty`, and `credit.author`
- if a stored clear time exists for the day on the current device, show it as well
- for the current short-term operation, showing all archived items is acceptable

## Credits

Credit display rules:

- `author` is always shown
- `sourceName` is shown only when present
- `sourceUrl` is shown only when present

Planned UI wording:

- author: `作：AUTHOR`
- source with name: `出典：NAME`
- source with URL only: `出典リンク`

## Social Share Text

The page should provide a button that copies share text for `SNS`.

Planned content:

- puzzle date
- difficulty
- page URL
- clear time, if the puzzle has already been solved on this device

Example before solve:

```text
レーザーパズル Daily 2026-04-30（中級）
https://.../daily.html?date=2026-04-30
```

Example after solve:

```text
レーザーパズル Daily 2026-04-30（中級）を 3:12 でクリア
https://.../daily.html?date=2026-04-30
```

Difficulty label mapping:

- `easy` -> `初級`
- `medium` -> `中級`
- `hard` -> `上級`

The copied text should use the Japanese difficulty labels above.

## Local Storage

The page should persist elapsed time for each daily puzzle, including archived ones.

Suggested model:

```ts
interface DailyProgress {
  accumulatedMs: number;
  startedAtMs: number | null;
  solvedMs: number | null;
  solvedAt: string | null;
}

type DailyProgressMap = Record<string, DailyProgress>; // key = YYYY-MM-DD
```

Behavior:

- On first open of an unsolved puzzle, start timing.
- On page leave, accumulate elapsed time into `accumulatedMs`.
- On revisit, resume timing if the puzzle is still unsolved.
- On solve, store the fixed clear time in `solvedMs`.
- `Reset` resets the board state only. It does not clear recorded elapsed time.

## Publication Rules

- Publication timing is based on `Asia/Tokyo`.
- Unpublished future puzzles must not be returned by the API.
- Archived results must contain only published puzzles.

## Server-Side Operation

Because this is a short-term feature:

- Daily puzzle definitions can be stored server-side in Workers code or another server-only source.
- Future puzzles may exist in server-side data, but the API must filter them by Tokyo publication date.

## States And Messages

### Loading

- show: `問題を読み込んでいます`

### Fetch Failure

- show an error message
- include a retry action

### Unknown Archived Date

When `?date=YYYY-MM-DD` does not resolve from the archive data:

- if the requested date is in the future under `Asia/Tokyo`: `この日の問題はまだ公開されていません`
- otherwise: `この日の問題は見つかりません`

### Solve Dialog

On solve, show a completion dialog.

The dialog should include:

- completion message
- clear time
- `共有文をコピー`
- navigation back to today's puzzle when viewing an archived puzzle

## Confirmed Decisions

The following items are already fixed:

- exact page layout: single-column
- difficulty labels shown in Japanese UI: `初級`, `中級`, `上級`
- archive list behavior for short-term operation: all archived items may be shown

## Open Items

The following are intentionally left for later discussion:

- whether the current day should also appear in the archive list
