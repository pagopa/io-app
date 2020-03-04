import { compareDesc, startOfDay } from "date-fns";
import { isNone, none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Tuple2 } from "italia-ts-commons/lib/tuples";
import { View } from "native-base";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import I18n from "../../i18n";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { isCreatedMessageWithContentAndDueDate } from "../../types/CreatedMessageWithContentAndDueDate";
import { ComponentProps } from "../../types/react";
import { HEADER_HEIGHT } from "../../utils/constants";
import {
  InjectedWithItemsSelectionProps,
  withItemsSelection
} from "../helpers/withItemsSelection";
import { ListSelectionBar } from "../ListSelectionBar";
import MessageAgenda, {
  MessageAgendaItem,
  MessageAgendaSection,
  Sections
} from "./MessageAgenda";

const SCROLL_RANGE_FOR_ANIMATION = HEADER_HEIGHT;

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },
  animatedStartPosition: {
    bottom: Platform.OS === "ios" ? SCROLL_RANGE_FOR_ANIMATION : 0
  },
  listContainer: {
    flex: 1
  }
});

type OwnProps = {
  currentTab: number;
  messagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  navigateToMessageDetail: (id: string) => void;
  setMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
};

type Props = Pick<
  ComponentProps<typeof MessageAgenda>,
  "servicesById" | "paymentsByRptId" | "onMoreDataRequest"
> &
  OwnProps &
  InjectedWithItemsSelectionProps;

type State = {
  sections: Sections;
  // Here we save the sections to render.
  // We only want to render sections starting from a specific time limit.
  sectionsToRender: Sections;
  maybeLastLoadedStartOfMonthTime: Option<number>;
  lastMessagesState?: pot.Pot<ReadonlyArray<MessageState>, string>;
  allMessageIdsState: Set<string>;
  nextDeadlineId: Option<string>;
};

export type FakeItem = {
  fake: true;
};

export const isFakeItem = (item: any): item is FakeItem => {
  return item.fake;
};

/**
 * Get the next deadline id
 */
export const getNextDeadlineId = (sections: Sections): Option<string> => {
  const now = startOfDay(new Date()).getTime();
  return sections
    .reduce<Option<MessageAgendaItem>>((acc, curr) => {
      const item = curr.data[0];
      // if item is fake, return the accumulator
      if (isFakeItem(item)) {
        return acc;
      }
      const newDate = new Date(item.e1.content.due_date).getTime();
      const diff = newDate - now;
      // if the acc is none, we don't need to make comparison with previous value
      if (isNone(acc)) {
        // just check the newDate is about future
        return diff >= 0 ? some(item) : none;
      }
      const lastDate = acc.value.e1.content.due_date.getTime();
      // if the new date is about future and is less than in accomulator
      if (newDate >= now && lastDate > newDate) {
        return some(item);
      }
      return acc;
    }, none)
    .map(item => item.e1.id);
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
        _.reduce<MessageAgendaItem[]>((accumulator, messageState) => {
          const { isRead, isArchived, message } = messageState;
          if (
            !isArchived &&
            pot.isSome(message) &&
            isCreatedMessageWithContentAndDueDate(message.value)
          ) {
            accumulator.push(
              Tuple2(message.value, {
                isRead
              })
            );
          }

          return accumulator;
        }, [])
          // Sort by due_date
          .sort((messageAgendaItem1, messageAgendaItem2) =>
            compareDesc(
              messageAgendaItem1.e1.content.due_date,
              messageAgendaItem2.e1.content.due_date
            )
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
            (accumulator, messageAgendaItem) => {
              // As title of the section we use the ISOString rapresentation
              // of the due_date day.
              const title = startOfDay(
                messageAgendaItem.e1.content.due_date
              ).toISOString();
              if (
                accumulator.lastTitle.isNone() ||
                title !== accumulator.lastTitle.value
              ) {
                // We need to create a new section
                const newSection = {
                  title,
                  data: [messageAgendaItem]
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
                  data: [...prevSection.data, messageAgendaItem]
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
class MessagesDeadlines extends React.PureComponent<Props, State> {
  private messageAgendaRef = React.createRef<MessageAgenda>();

  private handleOnPressItem = (id: string) => {
    if (this.props.selectedItemIds.isSome()) {
      // Is the selection mode is active a simple "press" must act as
      // a "longPress" (select the item).
      this.handleOnLongPressItem(id);
    } else {
      this.props.navigateToMessageDetail(id);
    }
  };

  private handleOnLongPressItem = (id: string) => {
    this.props.toggleItemSelection(id);
  };

  private toggleAllMessagesSelection = () => {
    const { allMessageIdsState } = this.state;
    const { selectedItemIds } = this.props;
    if (selectedItemIds.isSome()) {
      this.props.setSelectedItemIds(
        some(
          allMessageIdsState.size === selectedItemIds.value.size
            ? new Set()
            : allMessageIdsState
        )
      );
    }
  };

  private archiveMessages = () => {
    this.props.resetSelection();
    this.props.setMessagesArchivedState(
      this.props.selectedItemIds.map(_ => Array.from(_)).getOrElse([]),
      true
    );
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      sections: [],
      sectionsToRender: [],
      maybeLastLoadedStartOfMonthTime: none,
      allMessageIdsState: new Set(),
      nextDeadlineId: none
    };
  }

  public async componentDidMount() {
    const { messagesState } = this.props;
    const sectionsWithFakeItem = await Promise.resolve(
      generateSections(messagesState)
    );

    const sections: Sections = sectionsWithFakeItem.filter(section => {
      const item = section.data[0];
      return !isFakeItem(item);
    });

    const nextDeadlineId = await Promise.resolve(getNextDeadlineId(sections));

    this.setState({
      sections,
      allMessageIdsState: this.generateMessagesIdsFromMessageAgendaSection(
        sections
      ),
      nextDeadlineId
    });
  }

  public async componentDidUpdate(prevProps: Props) {
    const { messagesState } = this.props;
    const { messagesState: prevMessagesState } = prevProps;

    if (prevProps.currentTab !== this.props.currentTab) {
      this.props.resetSelection();
    }

    if (messagesState !== prevMessagesState) {
      const sectionsWithFakeItem = await Promise.resolve(
        generateSections(messagesState)
      );
      const sections: Sections = sectionsWithFakeItem.filter(section => {
        const item = section.data[0];
        return !isFakeItem(item);
      });
      const nextDeadlineId = await Promise.resolve(getNextDeadlineId(sections));
      this.setState({
        sections,
        allMessageIdsState: this.generateMessagesIdsFromMessageAgendaSection(
          sections
        ),
        nextDeadlineId
      });
    }
  }

  private generateMessagesIdsFromMessageAgendaSection(
    sections: Sections
  ): Set<string> {
    // tslint:disable-next-line: readonly-array
    const messagesIds: string[] = [];
    sections.forEach(messageAgendaSection =>
      messageAgendaSection.data.forEach(item => {
        const idMessage = !isFakeItem(item) ? item.e1.id : undefined;
        if (idMessage !== undefined) {
          messagesIds.push(idMessage);
        }
      })
    );
    return messagesIds.length > 0 ? new Set(messagesIds) : new Set();
  }

  /**
   * Return number pof sections to load
   */
  private sectionToLoad = (
    // tslint:disable-next-line: readonly-array
    messagesState: pot.Pot<MessageState[], string>
  ): number | undefined => {
    if (pot.isSome(messagesState)) {
      const value = messagesState.value;
      // check loading messages
      const isSomeLoading = value.filter(m => {
        const message = m.message;
        return pot.isLoading(message);
      });
      if (isSomeLoading.length > 0) {
        return undefined;
      }
      const tot = value.filter(m => {
        const message = m.message;
        return (
          pot.isSome(message) && message.value.content.due_date !== undefined
        );
      });
      return tot.length;
    }
    return undefined;
  };

  public render() {
    const {
      servicesById,
      paymentsByRptId,
      selectedItemIds,
      resetSelection,
      onMoreDataRequest
    } = this.props;
    const { sections, allMessageIdsState, nextDeadlineId } = this.state;

    const isLoading = pot.isLoading(this.props.messagesState);
    const sectionToLoad = pot.isSome(this.props.messagesState)
      ? this.sectionToLoad(this.props.messagesState)
      : undefined;

    return (
      <View style={styles.listWrapper}>
        <View style={styles.listContainer}>
          <MessageAgenda
            ref={this.messageAgendaRef}
            sections={sections}
            sectionToLoad={sectionToLoad}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            selectedMessageIds={selectedItemIds}
            onPressItem={this.handleOnPressItem}
            onLongPressItem={this.handleOnLongPressItem}
            onMoreDataRequest={onMoreDataRequest}
            refreshing={isLoading}
            nextDeadlineId={nextDeadlineId}
          />
        </View>
        <ListSelectionBar
          selectedItemIds={selectedItemIds}
          allItemIds={some(allMessageIdsState)}
          onToggleSelection={this.archiveMessages}
          onToggleAllSelection={this.toggleAllMessagesSelection}
          onResetSelection={resetSelection}
          primaryButtonText={I18n.t("messages.cta.archive")}
        />
      </View>
    );
  }
}

export default withItemsSelection(MessagesDeadlines);
