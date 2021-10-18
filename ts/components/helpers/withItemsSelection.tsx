import { none, Option, some } from "fp-ts/lib/Option";
import hoistNonReactStatics from "hoist-non-react-statics";
import { Omit } from "italia-ts-commons/lib/types";
import React from "react";

type State = {
  selectedItemIds: Option<Set<string>>;
};

export type InjectedWithItemsSelectionProps = {
  selectedItemIds: Option<Set<string>>;
  toggleItemSelection: (id: string) => void;
  resetSelection: () => void;
  setSelectedItemIds: (newSelectedItemIds: Option<Set<string>>) => void;
};

/**
 * An HOC to maintain and manipulate the items selection.
 */
export function withItemsSelection<P extends InjectedWithItemsSelectionProps>(
  WrappedComponent: React.ComponentType<P>
) {
  class WithItemsSelection extends React.PureComponent<
    Omit<P, keyof InjectedWithItemsSelectionProps>,
    State
  > {
    constructor(props: Omit<P, keyof InjectedWithItemsSelectionProps>) {
      super(props);
      this.state = {
        selectedItemIds: none
      };
    }

    public render() {
      const { selectedItemIds } = this.state;
      return (
        <WrappedComponent
          {...(this.props as P)}
          selectedItemIds={selectedItemIds}
          toggleItemSelection={this.toggleItemSelection}
          resetSelection={this.resetSelection}
          setSelectedItemIds={this.setSelectedItemIds}
        />
      );
    }

    // A function to add/remove an id from the selectedItemIds Set.
    private toggleItemSelection = (id: string) => {
      this.setState(({ selectedItemIds }) =>
        selectedItemIds
          .map(_ => {
            const newSelectedItemIds = new Set(_);
            if (newSelectedItemIds.has(id)) {
              newSelectedItemIds.delete(id);
            } else {
              newSelectedItemIds.add(id);
            }

            return {
              selectedItemIds: some(newSelectedItemIds)
            };
          })
          .getOrElse({
            selectedItemIds: some(new Set<string>([id]))
          })
      );
    };

    private setSelectedItemIds = (newSelectedItemIds: Option<Set<string>>) => {
      this.setState({
        selectedItemIds: newSelectedItemIds
      });
    };

    private resetSelection = () => {
      this.setState({
        selectedItemIds: none
      });
    };
  }

  hoistNonReactStatics(WithItemsSelection, WrappedComponent);

  return WithItemsSelection;
}
