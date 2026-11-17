import { Cancel01Icon } from "@hugeicons/core-free-icons";

import type { StateNodeConfig } from "../../shared/inspector/types";

import { IconButton } from "../../shared/ui/IconButton";
import { describeState } from "./model/stateDetails";

export type SelectedState = { node: StateNodeConfig; path: Array<string> };

type Props = {
  onClose: () => void;
  state: SelectedState | undefined;
};

const References = ({ values }: { values: Array<string> }) => (
  <ul className="state-details-values">
    {values.map((value, index) => (
      <li key={`${index}:${value}`}>
        <code>{value}</code>
      </li>
    ))}
  </ul>
);

export const StateDetails = ({ state, onClose }: Props) => {
  const details = state ? describeState(state.node) : undefined;
  const hasDetails =
    details &&
    (details.initial ||
      details.entryActions.length ||
      details.exitActions.length ||
      details.actors.length ||
      details.transitions.length);

  return (
    <>
      <span className="sr-only" role="status">
        {state ? `Selected state ${state.path.join(".")}` : ""}
      </span>
      <aside
        aria-label="State details"
        data-no-pan
        hidden={state === undefined}
        id="state-details"
      >
        {state && details && (
          <>
            <header className="state-details-header">
              <div>
                <p className="state-details-eyebrow">State details</p>
                <h2>{state.path.join(".")}</h2>
                {state.node.type && (
                  <p className="state-details-type">
                    Type: <code>{state.node.type}</code>
                  </p>
                )}
              </div>
              <IconButton
                icon={Cancel01Icon}
                label="Close state details"
                onClick={onClose}
              />
            </header>
            <div
              aria-label="State configuration"
              className="state-details-content"
              key={JSON.stringify(state.path)}
              role="region"
              tabIndex={0}
            >
              {state.node.description && (
                <p className="state-details-description">
                  {state.node.description}
                </p>
              )}
              <p className="state-details-hint">
                Configured behavior, not execution history.
              </p>
              {details.initial && (
                <section className="state-details-section">
                  <h3>Initial state</h3>
                  <dl className="state-details-rows">
                    {details.initial.target !== undefined && (
                      <div>
                        <dt>Target</dt>
                        <dd>
                          <code>{details.initial.target}</code>
                        </dd>
                      </div>
                    )}
                    {details.initial.actions.length > 0 && (
                      <div>
                        <dt>Actions</dt>
                        <dd>
                          <References values={details.initial.actions} />
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}
              {(details.entryActions.length > 0 ||
                details.exitActions.length > 0) && (
                <section className="state-details-section">
                  <h3>Actions</h3>
                  <dl className="state-details-rows">
                    {details.entryActions.length > 0 && (
                      <div>
                        <dt>On entry</dt>
                        <dd>
                          <References values={details.entryActions} />
                        </dd>
                      </div>
                    )}
                    {details.exitActions.length > 0 && (
                      <div>
                        <dt>On exit</dt>
                        <dd>
                          <References values={details.exitActions} />
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}
              {details.actors.length > 0 && (
                <section className="state-details-section">
                  <h3>Invoked actors</h3>
                  <ul className="state-details-actors">
                    {details.actors.map((actor, index) => (
                      <li key={`${index}:${actor.source}`}>
                        <code>{actor.source}</code>
                        {actor.id !== undefined && (
                          <span>
                            ID: <code>{actor.id}</code>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {details.transitions.length > 0 && (
                <section className="state-details-section">
                  <h3>Transitions</h3>
                  <ul className="state-details-transitions">
                    {details.transitions.map(({ trigger, options }, index) => (
                      <li className="state-transition" key={index}>
                        <h4 className="state-transition-trigger">
                          <span>{trigger.label}</span>
                          {trigger.value !== undefined && (
                            <code>{trigger.value}</code>
                          )}
                          {trigger.actorId !== undefined && (
                            <span>
                              ID: <code>{trigger.actorId}</code>
                            </span>
                          )}
                        </h4>
                        {options.length > 1 && (
                          <p className="state-details-hint">
                            Options are checked in order. The first without a
                            guard, or with a passing guard, is taken.
                          </p>
                        )}
                        <ol className="state-transition-options">
                          {options.map((option, optionIndex) => (
                            <li key={optionIndex}>
                              {options.length > 1 && (
                                <h5>Option {optionIndex + 1}</h5>
                              )}
                              <dl className="state-details-rows">
                                <div>
                                  <dt>Guard</dt>
                                  <dd>
                                    {option.guard === undefined ? (
                                      <span className="state-details-muted">
                                        None
                                      </span>
                                    ) : (
                                      <code className="state-guard">
                                        {option.guard}
                                      </code>
                                    )}
                                  </dd>
                                </div>
                                <div>
                                  <dt>Target</dt>
                                  <dd>
                                    {option.targets.length ? (
                                      <References values={option.targets} />
                                    ) : (
                                      <span className="state-details-muted">
                                        No target; state stays the same
                                      </span>
                                    )}
                                  </dd>
                                </div>
                                <div>
                                  <dt>Actions</dt>
                                  <dd>
                                    {option.actions.length ? (
                                      <References values={option.actions} />
                                    ) : (
                                      <span className="state-details-muted">
                                        None
                                      </span>
                                    )}
                                  </dd>
                                </div>
                              </dl>
                            </li>
                          ))}
                        </ol>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {!hasDetails && (
                <p className="state-details-hint">
                  No actions, actors, or transitions configured.
                </p>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
};
