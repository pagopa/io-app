import {
  IOColorPalette,
  IOColorTheme,
  IOTokenColor
} from "@io-app/design-system";

import type { TimelineStatus } from "./components/Timeline";

/** SEND colors of a mode. Read the current mode's with `usePnColors()` */
export const pnColors = (s: IOColorTheme) => ({
  /** Notification history */
  timeline: {
    status: {
      cancelled: IOColorPalette.yellow[500],
      default: IOColorPalette.greyscale[300],
      effective: IOColorPalette.lightBlue[500],
      unreachable: IOColorPalette.red[500],
      viewed: IOColorPalette.green[500]
    } satisfies Record<TimelineStatus, IOTokenColor>,
    // The ring separates the dot from the line, so it matches the sheet
    dotRing: s.background.default,
    line: s.stroke.divider,
    title: s.text.heading.secondary,
    time: s.text.content.tertiary,
    day: s.text.content.secondary,
    month: s.text.content.tertiary
  }
});
