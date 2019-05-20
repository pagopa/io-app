import {
  compareAsc,
  differenceInMonths,
  endOfMonth,
  endOfYesterday,
  startOfDay,
  startOfMonth,
  startOfToday,
  subMonths
} from "date-fns";
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React from "react";
import { SectionListScrollParams, StyleSheet } from "react-native";

import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import {
  isMessageWithContentAndDueDatePO,
  MessageWithContentAndDueDatePO
} from "../../types/MessageWithContentAndDueDatePO";
import MessageAgenda, { MessageAgendaSection, Sections } from "./MessageAgenda";

// How many past months to load in batch
const PAST_DATA_MONTHS = 3;

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  }
});

type OwnProps = {
  messagesState: ReturnType<typeof lexicallyOrderedMessagesStateSelector>;
  navigateToMessageDetail: (id: string) => void;
};

type Props = OwnProps;

type State = {
  isWorking: boolean;
  sections: Sections;
  // Here we save the sections to render.
  // We only want to render sections starting from a specific time limit.
  sectionsToRender: Sections;
  maybeLastLoadedStartOfMonthTime: Option<number>;
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
 * Return all the section with a date between the from and to time limit.
 */
const filterSectionsWithTimeLimit = (
  sections: Sections,
  fromTimeLimit: number,
  toTimeLimit: number
): Sections => {
  const filteredSections: Sections = [];

  for (const section of sections) {
    const sectionTime = new Date(section.title).getTime();
    if (sectionTime > toTimeLimit) {
      break;
    }

    if (sectionTime >= fromTimeLimit && sectionTime <= toTimeLimit) {
      filteredSections.push(section);
    }
  }

  return filteredSections;
};

const selectFutureData = (sections: Sections): Sections => {
  const startOfTodayTime = startOfToday().getTime();

  const initialIndex = sections.findIndex(section => {
    return new Date(section.title).getTime() >= startOfTodayTime;
  });

  return initialIndex < 0 ? [] : sections.slice(initialIndex);
};

const selectCurrentMonthRemainingData = (sections: Sections): Sections => {
  const startOfCurrentMonthTime = startOfMonth(new Date()).getTime();
  const endOfYesterdayTime = endOfYesterday().getTime();

  return filterSectionsWithTimeLimit(
    sections,
    startOfCurrentMonthTime,
    endOfYesterdayTime
  );
};

const selectPastMonthsData = (
  sections: Sections,
  howManyMonthsBack: number,
  initialStartOfMonthTime: number = startOfMonth(new Date()).getTime()
): Sections => {
  const newSections: Sections = [];

  new Array(howManyMonthsBack).fill(0).forEach((_, index) => {
    const selectedMonth = subMonths(
      initialStartOfMonthTime,
      howManyMonthsBack - index
    );

    const startOfSelectedMonthTime = startOfMonth(selectedMonth).getTime();
    const endOfSelectedMonthTime = endOfMonth(selectedMonth).getTime();

    const monthSections = filterSectionsWithTimeLimit(
      sections,
      startOfSelectedMonthTime,
      endOfSelectedMonthTime
    );

    // If we have no sections for this month create an ad-hoc empty section
    if (monthSections.length === 0) {
      const emptySection: MessageAgendaSection = {
        title: startOfSelectedMonthTime,
        fake: true,
        data: [{ fake: true }]
      };
      monthSections.push(emptySection);
    }

    newSections.push(...monthSections);
  });

  return newSections;
};

const selectInitialSectionsToRender = (
  sections: Sections,
  maybeLastLoadedStartOfMonthTime: Option<number>
): Sections => {
  const sectionsToRender: Sections = [];

  // Select future data (calendar events from today)
  sectionsToRender.push(...selectFutureData(sections));

  if (maybeLastLoadedStartOfMonthTime.isSome()) {
    // Select past months data
    const lastLoadedStartOfMonthTime = maybeLastLoadedStartOfMonthTime.value;
    const startOfCurrentMonthTime = startOfMonth(new Date()).getTime();
    const howManyMonthsBack = differenceInMonths(
      startOfCurrentMonthTime,
      lastLoadedStartOfMonthTime
    );
    sectionsToRender.push(...selectPastMonthsData(sections, howManyMonthsBack));

    // Select current month remaining data
    sectionsToRender.push(...selectCurrentMonthRemainingData(sections));
  }

  return sectionsToRender;
};

const selectMoreSectionsToRenderAsync = async (
  sections: Sections,
  maybeLastLoadedStartOfMonthTime: Option<number>
): Promise<Sections> => {
  return new Promise(resolve => {
    const moreSectionsToRender: Sections = [];

    moreSectionsToRender.push(
      ...selectPastMonthsData(
        sections,
        PAST_DATA_MONTHS,
        maybeLastLoadedStartOfMonthTime.toUndefined()
      )
    );

    if (maybeLastLoadedStartOfMonthTime.isNone()) {
      moreSectionsToRender.push(...selectCurrentMonthRemainingData(sections));
    }

    resolve(moreSectionsToRender);
  });
};

/**
 * A component to show the messages with a due_date.
 */
class MessagesDeadlines extends React.PureComponent<Props, State> {
  private scrollToLocation: Option<SectionListScrollParams> = none;
  private messageAgendaRef = React.createRef<MessageAgenda>();

  /**
   * Used to maintain the same ScrollView position when loading
   * "previous" data.
   */
  private onContentSizeChange = () => {
    if (this.messageAgendaRef.current && this.scrollToLocation.isSome()) {
      // Scroll to the sectionIndex we was before the content size change.
      this.messageAgendaRef.current.scrollToLocation(
        this.scrollToLocation.value
      );
      // Reset the value to none.
      // tslint:disable-next-line: no-object-mutation
      this.scrollToLocation = none;
    }
  };

  private handleOnPressItem = (id: string) => {
    this.props.navigateToMessageDetail(id);
  };

  private onLoadMoreDataRequest = () => {
    const { sections, maybeLastLoadedStartOfMonthTime } = this.state;

    this.setState({
      isWorking: true
    });
    selectMoreSectionsToRenderAsync(sections, maybeLastLoadedStartOfMonthTime)
      .then(moreSectionsToRender => {
        this.setState((prevState: State) => {
          // Save the sectionIndex we want to scroll-to onContentSizeChange.
          if (prevState.sectionsToRender.length === 0) {
            // If not sections are redered we need to move to the bottom after rendering more sections
            const sectionIndex = moreSectionsToRender.length - 1;
            const itemIndex =
              moreSectionsToRender[moreSectionsToRender.length - 1].data
                .length - 1;
            // tslint:disable-next-line: no-object-mutation
            this.scrollToLocation = some({
              sectionIndex,
              itemIndex,
              viewOffset: 0,
              viewPosition: 1,
              animated: true
            });
          } else {
            // tslint:disable-next-line: no-object-mutation
            this.scrollToLocation = some({
              sectionIndex: moreSectionsToRender.length,
              itemIndex: -1,
              viewOffset: 0,
              viewPosition: 1,
              animated: true
            });
          }

          const lastLoadedStartOfMonthTime = maybeLastLoadedStartOfMonthTime.getOrElse(
            startOfMonth(new Date()).getTime()
          );

          return {
            isWorking: false,
            sectionsToRender: [
              ...moreSectionsToRender,
              ...prevState.sectionsToRender
            ],
            maybeLastLoadedStartOfMonthTime: some(
              startOfMonth(
                subMonths(lastLoadedStartOfMonthTime, PAST_DATA_MONTHS)
              ).getTime()
            )
          };
        });
      })
      .catch(() => 0);
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isWorking: true,
      sections: [],
      sectionsToRender: [],
      maybeLastLoadedStartOfMonthTime: none
    };
  }

  public async componentDidMount() {
    const { messagesState } = this.props;
    const { maybeLastLoadedStartOfMonthTime } = this.state;

    const sections = await Promise.resolve(generateSections(messagesState));
    const sectionsToRender = await Promise.resolve(
      selectInitialSectionsToRender(sections, maybeLastLoadedStartOfMonthTime)
    );

    this.setState({
      isWorking: false,
      sections,
      sectionsToRender
    });
  }

  public async componentDidUpdate(prevProps: Props) {
    const { messagesState } = this.props;
    const { messagesState: prevMessagesState } = prevProps;
    const { maybeLastLoadedStartOfMonthTime } = this.state;

    if (messagesState !== prevMessagesState) {
      this.setState({
        isWorking: true
      });

      const sections = await Promise.resolve(generateSections(messagesState));
      const sectionsToRender = await Promise.resolve(
        selectInitialSectionsToRender(sections, maybeLastLoadedStartOfMonthTime)
      );

      this.setState({
        isWorking: false,
        sections,
        sectionsToRender
      });
    }
  }

  public render() {
    const { messagesState } = this.props;
    const { isWorking, sectionsToRender } = this.state;

    const isRefreshing = pot.isLoading(messagesState) || isWorking;

    return (
      <View style={styles.listWrapper}>
        <MessageAgenda
          ref={this.messageAgendaRef}
          onContentSizeChange={this.onContentSizeChange}
          sections={sectionsToRender}
          refreshing={isRefreshing}
          onPressItem={this.handleOnPressItem}
          onMoreDataRequest={this.onLoadMoreDataRequest}
        />
      </View>
    );
  }
}

export default MessagesDeadlines;
