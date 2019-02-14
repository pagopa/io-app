import { compareAsc, startOfDay } from "date-fns";
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import { lexicallyOrderedMessagesStateInfoSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import {
  isMessageWithContentAndDueDatePO,
  MessageWithContentAndDueDatePO
} from "../../types/MessageWithContentAndDueDatePO";
import MessageAgenda, { MessageAgendaSection } from "./MessageAgenda";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },

  buttonBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: "#ddd",
    padding: 10,
    opacity: 0.75
  },
  buttonBarButton: {
    opacity: 1
  }
});

type OwnProps = {
  messagesStateInfo: ReturnType<
    typeof lexicallyOrderedMessagesStateInfoSelector
  >;
  navigateToMessageDetail: (id: string) => void;
};

type Props = Pick<ComponentProps<typeof MessageAgenda>, "onRefresh"> & OwnProps;

/**
 * Filter only the messages with a due date and group them by due_date day.
 */
const generateSections = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
) =>
  pot.getOrElse(
    pot.map(
      potMessagesState,
      _ =>
        // tslint:disable-next-line:readonly-array
        _.reduce<MessageWithContentAndDueDatePO[]>(
          (accumulator, messageState) => {
            const message = messageState.message;
            if (
              pot.isSome(message) &&
              isMessageWithContentAndDueDatePO(message.value)
            ) {
              accumulator.push(message.value);
            }

            return accumulator;
          },
          []
        )
          // Sort by due_date
          .sort((d1, d2) =>
            compareAsc(d1.content.due_date, d2.content.due_date)
          )
          // Now we have an array of messages sorted by due_date.
          // To create groups (by due_date day) we can just iterate the array and
          // -  if the current message due_date day is different from the one of
          //    the prevMessage create a new section
          // -  if the current message due_date day is equal to the one of prevMessage
          //    add the message to the last section
          .reduce<{
            lastTitle: Option<string>;
            // tslint:disable-next-line:readonly-array
            sections: MessageAgendaSection[];
          }>(
            (accumulator, message) => {
              // As title of the section we use the ISOString rapresentation
              // of the due_date day.
              const title = startOfDay(message.content.due_date).toISOString();
              if (
                accumulator.lastTitle.isNone() ||
                title !== accumulator.lastTitle.value
              ) {
                // We need to create a new section
                const newSection = {
                  title,
                  data: [message]
                };
                return {
                  lastTitle: some(title),
                  sections: [...accumulator.sections, newSection]
                };
              } else {
                // We need to add the message to the last section.
                // We are sure that pop will return at least one element because
                // of the previous `if` step.
                const prevSection = accumulator.sections.pop() as MessageAgendaSection;
                const newSection = {
                  title,
                  data: [...prevSection.data, message]
                };
                return {
                  lastTitle: some(title),
                  // We used pop so we need to re-add the section.
                  sections: [...accumulator.sections, newSection]
                };
              }
            },
            {
              lastTitle: none,
              sections: []
            }
          ).sections
    ),
    []
  );

/**
 * A component to show the messages with a due_date.
 */
class MessagesDeadlines extends React.PureComponent<Props, never> {
  public render() {
    const { messagesStateInfo, onRefresh } = this.props;
    const isLoading = pot.isLoading(messagesStateInfo.potMessagesState);

    const sections = generateSections(messagesStateInfo.potMessagesState);

    return (
      <View style={styles.listWrapper}>
        <MessageAgenda
          sections={sections}
          refreshing={isLoading}
          onRefresh={onRefresh}
          onPressItem={this.handleOnPressItem}
        />
      </View>
    );
  }

  private handleOnPressItem = (id: string) => {
    this.props.navigateToMessageDetail(id);
  };
}

export default MessagesDeadlines;
