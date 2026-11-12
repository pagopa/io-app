import type { DiagramRenderer } from "../renderers/mermaidRenderer.js";
import type { InspectedActor } from "../types/inspector.js";
import type { PanZoom } from "../widgets/panZoom.js";
import type { createStateDetailsView } from "./stateDetailsView.js";

import { toNodeId } from "../builders/nodeIds.js";
import { buildStateDiagram } from "../builders/stateDiagram.js";
import { listStateNodes } from "../utils/stateNodes.js";
import { markTakenEdges } from "../utils/svgEdges.js";

const STATE_ELEMENTS = "g.node, g.cluster";

// Mermaid builds element ids around ours, e.g. `diagram-1-state-s_idle-0`.
const stateIdOf = (element: Element, ids: ReadonlyMap<string, unknown>) =>
  [element.id, element.getAttribute("data-id")]
    .flatMap(value => value?.split("-") ?? [])
    .find(part => ids.has(part));

/**
 * Draws the selected machine with `renderDiagram`, highlighting its state and
 * the path taken to it. Snapshots that change neither do not redraw it;
 * `viewport` is told whether a new machine is shown. A clicked state is
 * described in `details`.
 */
export const createDiagramView = (
  container: HTMLElement,
  details: Pick<ReturnType<typeof createStateDetailsView>, "render">,
  renderDiagram: DiagramRenderer,
  viewport: Pick<PanZoom, "update">
) => {
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const requests = { latest: 0 };
  const shown: {
    actor?: InspectedActor;
    code?: string;
    definition?: InspectedActor["definition"];
    selectedId?: string;
  } = {};
  const states = () =>
    new Map(
      listStateNodes(shown.definition ?? {}).map(state => [
        toNodeId(state.path),
        state
      ])
    );
  const showSelection = () => {
    const ids = states();
    const state = shown.selectedId ? ids.get(shown.selectedId) : undefined;
    container.querySelectorAll(STATE_ELEMENTS).forEach(element => {
      element.classList.toggle(
        "selected",
        state !== undefined && stateIdOf(element, ids) === shown.selectedId
      );
    });
    details.render(state);
  };
  const showMessage = (text: string) => {
    requests.latest++;
    shown.code = undefined;
    shown.definition = undefined;
    shown.actor = undefined;
    shown.selectedId = undefined;
    container.textContent = text;
    details.render(undefined);
    viewport.update({ isNew: true });
  };
  const render = async (actor: InspectedActor | undefined) => {
    shown.actor = actor;
    if (!actor?.definition?.states) {
      showMessage("No machine selected.");
      return;
    }
    const request = { id: requests.latest };
    try {
      const { code, edgeKeys } = buildStateDiagram(
        actor.definition,
        actor.snapshot?.value,
        actor.visited
      );
      const taken = edgeKeys.flatMap((key, index) =>
        key !== undefined && actor.taken.has(key) ? [index] : []
      );
      const drawing = `${colorScheme.matches}\n${code}\n${taken.join(",")}`;
      if (drawing === shown.code) {
        return;
      }
      shown.code = drawing;
      request.id = ++requests.latest;
      const svg = await renderDiagram(code, colorScheme.matches);
      if (request.id !== requests.latest || svg === undefined) {
        return;
      }
      container.innerHTML = svg;
      markTakenEdges(container, taken);
      const isNew = actor.definition !== shown.definition;
      if (isNew) {
        shown.selectedId = undefined;
      }
      shown.definition = actor.definition;
      showSelection();
      viewport.update({ isNew });
    } catch (error) {
      if (request.id === requests.latest) {
        showMessage(
          `Could not render the diagram: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  };
  colorScheme.addEventListener("change", () => {
    if (shown.actor) {
      void render(shown.actor);
    }
  });
  return {
    render,
    /** Describes the state drawn at `target`, or closes the description. */
    selectAt: (target: Element | null) => {
      const element = target?.closest(STATE_ELEMENTS);
      shown.selectedId = element ? stateIdOf(element, states()) : undefined;
      showSelection();
    },
    showMessage
  };
};
