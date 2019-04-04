import { compareAsc, startOfDay, startOfMonth } from "date-fns";
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import {
  isMessageWithContentAndDueDatePO,
  MessageWithContentAndDueDatePO
} from "../../types/MessageWithContentAndDueDatePO";
import { ComponentProps } from "../../types/react";
import MessageAgenda, { MessageAgendaSection, Sections } from "./MessageAgenda";

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
  messagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  navigateToMessageDetail: (id: string) => void;
};

type Props = Pick<ComponentProps<typeof MessageAgenda>, "onRefresh"> & OwnProps;

type State = {
  sections: Sections;
  // Here we save the sections to render.
  // We only want to render sections starting from a specific time limit.
  sectionsToRender: Sections;
  currentTimeLimit: number;
  lastMessagesState?: pot.Pot<ReadonlyArray<MessageState>, string>;
};

/**
 * Filter only the messages with a due date and group them by due_date day.
 */
const generateSections = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
): Sections =>
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
 * Return sections from a specific timeLimit.
 *
 * NOTE: Each section represent a calendar day.
 */
const sectionsFromTimeLimit = (
  sections: Sections,
  timeLimit: number
): Sections => {
  const initialIndex = sections.findIndex(
    section => new Date(section.title).getTime() >= timeLimit
  );

  return initialIndex < 0 ? [] : sections.slice(initialIndex);
};

/**
 * A component to show the messages with a due_date.
 */
class MessagesDeadlines extends React.PureComponent<Props, State> {
  private scrollToSectionsIndex: Option<number> = none;
  private messageAgendaRef = React.createRef<MessageAgenda>();

  constructor(props: Props) {
    super(props);
    this.state = {
      sections: [],
      sectionsToRender: [],
      // The initial time limit is the start of the current month.
      currentTimeLimit: startOfMonth(new Date()).getTime()
    };
  }

  public static getDerivedStateFromProps = (
    nextProps: Props,
    prevState: State
  ): Partial<State> | null => {
    const { lastMessagesState, currentTimeLimit } = prevState;
    const { messagesState } = nextProps;

    // If the messagesState is changed we need to recalculate sections and sectionsToRender.
    if (lastMessagesState !== messagesState) {
      const sections = generateSections(messagesState);
      const sectionsToRender = sectionsFromTimeLimit(
        sections,
        currentTimeLimit
      );

      return {
        sections,
        sectionsToRender
      };
    }

    // Return null to not update the store.
    return null;
  };

  public render() {
    const { messagesState } = this.props;
    const { sectionsToRender } = this.state;

    const isRefreshing = pot.isLoading(messagesState);

    return (
      <View style={styles.listWrapper}>
        <MessageAgenda
          ref={this.messageAgendaRef}
          onContentSizeChange={this.onContentSizeChange}
          sections={sectionsToRender}
          refreshing={isRefreshing}
          onRefresh={this.onRefresh}
          onPressItem={this.handleOnPressItem}
        />
      </View>
    );
  }

  /**
   * On refresh we need to load more "previous" data.
   */
  private onRefresh = () => {
    this.loadNewSectionsToRender()
      .then(newSectionsToRender =>
        this.setState(prevState => {
          const { sectionsToRender } = prevState;
          // Save the sectionIndex we want to scroll to onContentSizeChange.
          // tslint:disable-next-line: no-object-mutation
          this.scrollToSectionsIndex = some(
            newSectionsToRender.length - sectionsToRender.length
          );
          return {
            sectionsToRender: newSectionsToRender,
            currentTimeLimit: startOfMonth(
              newSectionsToRender[0].title
            ).getTime()
          };
        })
      )
      .catch(_ => 0);
  };

  private handleOnPressItem = (id: string) => {
    this.props.navigateToMessageDetail(id);
  };

  /**
   * Used to maintain the same ScrollView position when loading
   * "previous" data.
   */
  private onContentSizeChange = () => {
    if (this.messageAgendaRef.current && this.scrollToSectionsIndex.isSome()) {
      // Scroll to the sectionIndex we was before the content size change.
      this.messageAgendaRef.current.scrollToSectionsIndex(
        this.scrollToSectionsIndex.value
      );
      // Reset the value to none.
      // tslint:disable-next-line: no-object-mutation
      this.scrollToSectionsIndex = none;
    }
  };

  /**
   * Loads new section from the "previous" data.
   */
  private loadNewSectionsToRender = (): Promise<Sections> => {
    return new Promise((resolve, reject) => {
      const { sections, sectionsToRender } = this.state;

      // We are already rendering all the sections
      if (sections.length === sectionsToRender.length) {
        reject();
      }

      // Get the month of the first section not already rendered and
      // calculate the initiam month time.
      const newTimeLimit = startOfMonth(
        sections[sections.length - sectionsToRender.length - 1].title
      ).getTime();

      // Get and return all the section from the new time limit.
      resolve(sectionsFromTimeLimit(sections, newTimeLimit));
    });
  };
}

export default MessagesDeadlines;
