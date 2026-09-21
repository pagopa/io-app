/**
 * The JSON the Export button downloads: one block per tab, each holding the raw
 * wire events, so an inspection can be attached to a bug report.
 */
import type { InspectorRuntime, MachineTimeline } from "../types";

export interface ExportedMachine {
  events: Array<unknown>;
  key: string;
  label: string;
  rootId: string;
}

export interface TimelineExport {
  droppedEvents: number;
  exportedAt: string;
  machines: Array<ExportedMachine>;
  runtime?: InspectorRuntime;
}

export const buildExport = (
  machines: ReadonlyMap<string, MachineTimeline>,
  dropped: number,
  runtime: InspectorRuntime | undefined,
  now: Date
): TimelineExport => ({
  droppedEvents: dropped,
  exportedAt: now.toISOString(),
  runtime,
  machines: [...machines.values()].map(machine => ({
    key: machine.key,
    label: machine.label,
    rootId: machine.rootId,
    events: machine.events.map(entry => entry.payload)
  }))
});
