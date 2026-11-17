import { Cancel01Icon } from "@hugeicons/core-free-icons";

import type { StateNodeConfig } from "../../shared/inspector/types";

import { IconButton } from "../../shared/ui/IconButton";
import { describeState } from "./model/stateDetails";

export type SelectedState = { node: StateNodeConfig; path: Array<string> };

type Props = {
  onClose: () => void;
  state: SelectedState | undefined;
};

export const StateDetails = ({ state, onClose }: Props) => {
  const sections = state ? describeState(state.node) : [];
  return (
    <aside
      aria-label="State details"
      aria-live="polite"
      data-no-pan
      hidden={state === undefined}
      id="state-details"
    >
      {state && (
        <>
          <header>
            <h3>
              {state.path.join(".")}
              {state.node.type && (
                <span className="state-type">{state.node.type}</span>
              )}
            </h3>
            <IconButton
              icon={Cancel01Icon}
              label="Close state details"
              onClick={onClose}
            />
          </header>
          <div>
            {sections.length ? (
              sections.map(({ title, rows }) => (
                <section key={title}>
                  <h4>{title}</h4>
                  <ul>
                    {rows.map((row, index) => (
                      <li key={`${index}:${row}`}>{row}</li>
                    ))}
                  </ul>
                </section>
              ))
            ) : (
              <span className="empty">No actions, actors or transitions.</span>
            )}
          </div>
        </>
      )}
    </aside>
  );
};
