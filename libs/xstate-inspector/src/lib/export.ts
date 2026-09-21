/**
 * The JSON the Export button downloads: one block per tab, each holding the raw
 * wire events, so an inspection can be attached to a bug report.
 */
import type { MachineTimeline } from "../types";

export interface ExportedMachine {
  droppedEvents: number;
  events: Array<unknown>;
  key: string;
  label: string;
  rootId: string;
}

export interface TimelineExport {
  exportedAt: string;
  machines: Array<ExportedMachine>;
}

export const buildExport = (
  machines: ReadonlyMap<string, MachineTimeline>,
  dropped: ReadonlyMap<string, number>,
  now: Date
): TimelineExport => ({
  exportedAt: now.toISOString(),
  machines: [...machines.values()].map(machine => ({
    key: machine.key,
    label: machine.label,
    rootId: machine.rootId,
    droppedEvents: dropped.get(machine.key) ?? 0,
    events: machine.events.map(entry => entry.payload)
  }))
});
