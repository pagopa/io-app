import type {
  InspectedActor,
  StateNodeConfig
} from "../../shared/inspector/types";
import type { DiagramRenderer } from "./mermaidRenderer";
import type { PanZoom } from "./panZoom";

import { toNodeId } from "../../shared/inspector/nodeIds";
import { buildStateDiagram } from "./model/stateDiagram";
import { listStateNodes } from "./model/stateNodes";
import { markTakenEdges } from "./svgEdges";

const STATE_ELEMENTS = "g.node, g.cluster, g.statediagram-cluster";

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
  details: {
    render: (
      state: undefined | { node: StateNodeConfig; path: Array<string> }
    ) => void;
  },
  renderDiagram: DiagramRenderer,
  viewport: Pick<PanZoom, "update">
) => {
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const requests = { latest: 0 };
  const shown: {
    actor?: InspectedActor;
    code?: string;
    definition?: InspectedActor["definition"];
    requestedDefinition?: InspectedActor["definition"];
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
      const id = stateIdOf(element, ids);
      const node = id ? ids.get(id) : undefined;
      element.classList.toggle(
        "selected",
        node !== undefined && id === shown.selectedId
      );
      if (node) {
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute(
          "aria-label",
          `Show details for state ${node.path.join(".")}`
        );
      }
    });
    details.render(state);
  };
  const showMessage = (text: string) => {
    requests.latest++;
    shown.code = undefined;
    shown.definition = undefined;
    shown.requestedDefinition = undefined;
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
      if (
        drawing === shown.code &&
        actor.definition === shown.requestedDefinition
      ) {
        return;
      }
      shown.code = drawing;
      shown.requestedDefinition = actor.definition;
      request.id = ++requests.latest;
      const svg = await renderDiagram(code, colorScheme.matches);
      if (request.id !== requests.latest || svg === undefined) {
        return;
      }
      const focused = container.ownerDocument?.activeElement;
      const focusedId =
        actor.definition === shown.definition &&
        focused &&
        container.contains(focused)
          ? stateIdOf(focused, states())
          : undefined;
      container.innerHTML = svg;
      markTakenEdges(container, taken);
      const isNew = actor.definition !== shown.definition;
      if (isNew) {
        shown.selectedId = undefined;
      }
      shown.definition = actor.definition;
      showSelection();
      if (focusedId) {
        const ids = states();
        const replacement = Array.from(
          container.querySelectorAll(STATE_ELEMENTS)
        ).find(element => stateIdOf(element, ids) === focusedId);
        (replacement as SVGElement | undefined)?.focus({ preventScroll: true });
      }
      viewport.update({ isNew });
    } catch (error) {
      if (request.id === requests.latest) {
        showMessage(
          `Could not render the diagram: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  };
  const handleThemeChange = () => {
    if (shown.actor) {
      void render(shown.actor);
    }
  };
  colorScheme.addEventListener("change", handleThemeChange);
  return {
    destroy: () => {
      requests.latest++;
      colorScheme.removeEventListener("change", handleThemeChange);
    },
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
