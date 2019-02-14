import hoistNonReactStatics from "hoist-non-react-statics";
import { Omit } from "italia-ts-commons/lib/types";
import React from "react";

type State = {
  isSelectionModeEnabled: boolean;
  selectedMessageIds: Map<string, true>;
};

export type InjectedWithMessagesSelectionProps = {
  isSelectionModeEnabled: boolean;
  selectedMessageIds: Map<string, true>;
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
        isSelectionModeEnabled: false,
        selectedMessageIds: new Map()
      };
    }
    public render() {
      const { isSelectionModeEnabled, selectedMessageIds } = this.state;

      const mergedProps = {
        ...this.props,
        isSelectionModeEnabled,
        selectedMessageIds,
        toggleMessageSelection: this.toggleMessageSelection,
        resetSelection: this.resetSelection
      } as P;

      return <WrappedComponent {...mergedProps} />;
    }

    private toggleMessageSelection = (id: string) => {
      this.setState(prevState => {
        const selectedMessageIds = new Map(prevState.selectedMessageIds);
        selectedMessageIds.get(id)
          ? selectedMessageIds.delete(id)
          : selectedMessageIds.set(id, true);
        return { isSelectionModeEnabled: true, selectedMessageIds };
      });
    };

    private resetSelection = () => {
      this.setState({
        isSelectionModeEnabled: false,
        selectedMessageIds: new Map()
      });
    };
  }

  hoistNonReactStatics(WithMessagesSelection, WrappedComponent);

  return WithMessagesSelection;
}
