/**
 * The timeline as React sees it. Every store update publishes a new state
 * object, including the empty update `ingest` sends for its in-place edits, so
 * subscribing to the whole state is enough to repaint.
 */
import { useStore } from "zustand";

import type { TimelineState } from "../types";

import { timelineStore } from "./timeline";

export const useTimeline = (): TimelineState => useStore(timelineStore);
