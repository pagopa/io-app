import { none, Option, some } from "fp-ts/lib/Option";
import hoistNonReactStatics from "hoist-non-react-statics";
import * as pot from "italia-ts-commons/lib/pot";
import { Omit } from "italia-ts-commons/lib/types";
import React from "react";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";

type State = {
  selectedMessageIds: Option<Set<string>>;
  isAllMessagesSelected: boolean;
};

export type InjectedWithMessagesSelectionProps = {
  selectedMessageIds: Option<Set<string>>;
  toggleMessageSelection: (id: string) => void;
  resetSelection: () => void;
  toggleAllMessagesSelection: (
    potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
  ) => void;
  isAllMessagesSelected: boolean;
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
        selectedMessageIds: none,
        isAllMessagesSelected: false
      };
    }

    public render() {
      const { isAllMessagesSelected, selectedMessageIds } = this.state;

      return (
        <WrappedComponent
          {...this.props as P}
          selectedMessageIds={selectedMessageIds}
          toggleMessageSelection={this.toggleMessageSelection}
          resetSelection={this.resetSelection}
          toggleAllMessagesSelection={this.toggleAllMessagesSelection}
          isAllMessagesSelected={isAllMessagesSelected}
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

    // A function to add/remove all messages in the selectedMessageIds Set.
    private toggleAllMessagesSelection = (
      potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
    ) => {
      const { isAllMessagesSelected } = this.state;
      const allMessagesIds = pot.getOrElse(
        pot.map(potMessagesState, _ =>
          _.map(messageState => messageState.meta.id)
        ),
        []
      );
      const newSelectedMessageIds = new Set(allMessagesIds);
      if (isAllMessagesSelected) {
        this.setState({
          selectedMessageIds: some(new Set()),
          isAllMessagesSelected: false
        });
      } else {
        this.setState({
          selectedMessageIds: some(newSelectedMessageIds),
          isAllMessagesSelected: true
        });
      }
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
