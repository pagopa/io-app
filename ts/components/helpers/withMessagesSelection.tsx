import { none, Option, some } from "fp-ts/lib/Option";
import hoistNonReactStatics from "hoist-non-react-statics";
import { Omit } from "io-ts-commons/lib/types";
import React from "react";

type State = {
  selectedMessageIds: Option<Set<string>>;
};

export type InjectedWithMessagesSelectionProps = {
  selectedMessageIds: Option<Set<string>>;
  toggleMessageSelection: (id: string) => void;
  resetSelection: () => void;
};

/**
 * An HOC to maintain and manipulate the messages selection.
 */
export function withMessagesSelection<
  P extends InjectedWithMessagesSelectionProps
>(WrappedComponent: React.ComponentType<P>) {
  class WithMessagesSelection extends React.PureComponent<
    Omit<P, keyof InjectedWithMessagesSelectionProps>,
    State
  > {
    constructor(props: Omit<P, keyof InjectedWithMessagesSelectionProps>) {
      super(props);
      this.state = {
        selectedMessageIds: none
      };
    }

    public render() {
      const { selectedMessageIds } = this.state;

      return (
        <WrappedComponent
          {...this.props as P}
          selectedMessageIds={selectedMessageIds}
          toggleMessageSelection={this.toggleMessageSelection}
          resetSelection={this.resetSelection}
        />
      );
    }

    // A function to add/remove an id from the selectedMessageIds Set.
    private toggleMessageSelection = (id: string) => {
      this.setState(({ selectedMessageIds }) => {
        return selectedMessageIds
          .map(_ => {
            const newSelectedMessageIds = new Set(_);
            newSelectedMessageIds.has(id)
              ? newSelectedMessageIds.delete(id)
              : newSelectedMessageIds.add(id);

            return {
              selectedMessageIds: some(newSelectedMessageIds)
            };
          })
          .getOrElse({ selectedMessageIds: some(new Set().add(id)) });
      });
    };

    private resetSelection = () => {
      this.setState({
        selectedMessageIds: none
      });
    };
  }

  hoistNonReactStatics(WithMessagesSelection, WrappedComponent);

  return WithMessagesSelection;
}
