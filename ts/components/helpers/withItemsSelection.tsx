import { Omit } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";

type State = {
  selectedItemIds: O.Option<Set<string>>;
};

export type InjectedWithItemsSelectionProps = {
  selectedItemIds: O.Option<Set<string>>;
  toggleItemSelection: (id: string) => void;
  resetSelection: () => void;
  setSelectedItemIds: (newSelectedItemIds: O.Option<Set<string>>) => void;
};

/**
 * An HOC to maintain and manipulate a list of selected items.
 *
 * @deprecated please use the hook useItemsSelection instead
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
        selectedItemIds: O.none
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
        pipe(
          selectedItemIds,
          O.map(_ => {
            const newSelectedItemIds = new Set(_);
            if (newSelectedItemIds.has(id)) {
              newSelectedItemIds.delete(id);
            } else {
              newSelectedItemIds.add(id);
            }

            return {
              selectedItemIds: O.some(newSelectedItemIds)
            };
          }),
          O.getOrElse(() => ({
            selectedItemIds: O.some(new Set<string>([id]))
          }))
        )
      );
    };

    private setSelectedItemIds = (
      newSelectedItemIds: O.Option<Set<string>>
    ) => {
      this.setState({
        selectedItemIds: newSelectedItemIds
      });
    };

    private resetSelection = () => {
      this.setState({
        selectedItemIds: O.none
      });
    };
  }

  hoistNonReactStatics(WithItemsSelection, WrappedComponent);

  return WithItemsSelection;
}
