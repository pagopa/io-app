import { compareAsc, startOfDay, startOfMonth } from "date-fns";
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import {
  isMessageWithContentAndDueDatePO,
  MessageWithContentAndDueDatePO
} from "../../types/MessageWithContentAndDueDatePO";
import MessageAgenda, {
  ItemLayout,
  MessageAgendaSection,
  Sections
} from "./MessageAgenda";

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
  sectionsToRender: Sections;
  itemLayouts: ReadonlyArray<ItemLayout>;
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

const sectionsFromTimeLimit = (
  sections: Sections,
  timeLimit: number
): Sections => {
  const initialIndex = sections.findIndex(
    section => new Date(section.title).getTime() >= timeLimit
  );

  return initialIndex < 0 ? [] : sections.slice(initialIndex);
};

const generateItemLayouts = (sections: Sections) => {
  // tslint:disable-next-line: no-let
  let offset = 0;
  // tslint:disable-next-line: no-let
  let index = 0;
  // tslint:disable-next-line: readonly-array
  const itemLayouts: ItemLayout[] = [];
  sections.forEach(section => {
    itemLayouts.push({
      length: 50,
      offset,
      index
    });

    offset += 50;
    index++;

    section.data.forEach(_ => {
      itemLayouts.push({
        length: 100,
        offset,
        index
      });

      offset += 100;
      index++;
    });

    itemLayouts.push({
      length: 0,
      offset,
      index
    });

    offset += 0;
    index++;
  });

  return itemLayouts;
};

/**
 * A component to show the messages with a due_date.
 */
class MessagesDeadlines extends React.PureComponent<Props, State> {
  private scrollToSectionsIndex: Option<number> = none;
  private messageAgendaRef = React.createRef<any>();

  constructor(props: Props) {
    super(props);
    this.state = {
      sections: [],
      sectionsToRender: [],
      itemLayouts: [],
      currentTimeLimit: startOfMonth(new Date()).getTime()
    };
  }

  public static getDerivedStateFromProps = (
    nextProps: Props,
    prevState: State
  ): Partial<State> | null => {
    const { lastMessagesState, currentTimeLimit } = prevState;
    const { messagesState } = nextProps;

    if (lastMessagesState !== messagesState) {
      const sections = generateSections(messagesState);
      const sectionsToRender = sectionsFromTimeLimit(
        sections,
        currentTimeLimit
      );
      const itemLayouts = generateItemLayouts(sectionsToRender);

      return {
        sections,
        sectionsToRender,
        itemLayouts
      };
    }

    return null;
  };

  public render() {
    console.log("MessagesDeadlines::render", this.props, this.state);
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
          getItemLayout={this.getItemLayout}
          onPressItem={this.handleOnPressItem}
        />
      </View>
    );
  }

  public componentDidMount = () => {
    console.log("After mount");
  };

  private getItemLayout = (_: Sections | null, index: number) =>
    this.state.itemLayouts[index];

  private onRefresh = () => {
    this.loadNewSectionsToRender()
      .then(newSectionsToRender =>
        this.setState(prevState => {
          const { sectionsToRender } = prevState;
          // tslint:disable-next-line: no-object-mutation
          this.scrollToSectionsIndex = some(
            newSectionsToRender.length - sectionsToRender.length
          );
          return {
            sectionsToRender: newSectionsToRender,
            itemLayouts: generateItemLayouts(newSectionsToRender),
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

  private onContentSizeChange = () => {
    if (this.scrollToSectionsIndex.isSome()) {
      if (this.messageAgendaRef.current) {
        this.messageAgendaRef.current.scrollToSectionsIndex(
          this.scrollToSectionsIndex.value
        );
      }
      // tslint:disable-next-line: no-object-mutation
      this.scrollToSectionsIndex = none;
    }
  };

  private loadNewSectionsToRender = (): Promise<Sections> => {
    return new Promise((resolve, reject) => {
      const { sections, sectionsToRender } = this.state;

      // We are already rendering all the sections
      if (sections.length === sectionsToRender.length) {
        reject();
      }

      const newTimeLimit = startOfMonth(
        sections[sections.length - sectionsToRender.length - 1].title
      ).getTime();

      resolve(sectionsFromTimeLimit(sections, newTimeLimit));
    });
  };
}

export default MessagesDeadlines;
