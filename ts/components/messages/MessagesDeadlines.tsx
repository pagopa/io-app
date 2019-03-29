import { compareAsc, differenceInCalendarMonths, startOfDay } from 'date-fns';
import { none, Option, some } from 'fp-ts/lib/Option';
import * as pot from 'italia-ts-commons/lib/pot';
import { View } from 'native-base';
import React, { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';

import { lexicallyOrderedMessagesStateSelector } from '../../store/reducers/entities/messages';
import { MessageState } from '../../store/reducers/entities/messages/messagesById';
import {
  isMessageWithContentAndDueDatePO,
  MessageWithContentAndDueDatePO,
} from '../../types/MessageWithContentAndDueDatePO';
import MessageAgenda, { MessageAgendaSection } from './MessageAgenda';

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
  isProcessing: boolean;
  // How many months back to consider when showing the messages with deadline
  monthsBack: number;
  sections: ReturnType<typeof generateSections>;
  sectionsToRender: ReturnType<typeof generateSections>;
  lastMessagesState?: pot.Pot<ReadonlyArray<MessageState>, string>;
};

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

const calculateInitialSectionsToRender = (
  sections: ReturnType<typeof generateSections>,
  monthsBack: number
) => {
  // Get the current date
  const currentDate = new Date();

  // Find the first section with a date that is `monthsBack` back.
  const initialSectionsIndex = sections.findIndex(section => {
    const months = differenceInCalendarMonths(
      currentDate,
      new Date(section.title)
    );
    return months <= monthsBack;
  });

  return initialSectionsIndex < 0 ? [] : sections.slice(initialSectionsIndex);
};

const calculateNewSectionsToRenderWithNewMonthsBack = (
  sections: ReturnType<typeof generateSections>,
  initialMonthsBack: number
) => {
  const currentDate = new Date();

  // tslint:disable-next-line: no-let
  let newInitialSectionIndex = -1;
  // tslint:disable-next-line: no-let
  let newMonthsBack = initialMonthsBack;

  if (
    differenceInCalendarMonths(currentDate, new Date(sections[0].title)) <
    newMonthsBack
  ) {
    return none;
  }

  while (newInitialSectionIndex < 0) {
    // Find the first section with a date that is `monthsBack` back.
    newInitialSectionIndex = sections.findIndex(section => {
      const months = differenceInCalendarMonths(
        currentDate,
        new Date(section.title)
      );
      return months <= newMonthsBack;
    });
    newMonthsBack++;
  }

  return some({
    newSectionsToRender: sections.slice(newInitialSectionIndex),
    newMonthsBack: newMonthsBack + 1
  });
};

/**
 * A component to show the messages with a due_date.
 */
class MessagesDeadlines extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isProcessing: false,
      monthsBack: 0,
      sections: [],
      sectionsToRender: []
    };
  }

  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    // Calculate sections only if messagesState is changed
    const sections =
      nextProps.messagesState !== prevState.lastMessagesState
        ? generateSections(nextProps.messagesState)
        : prevState.sections;

    const sectionsToRender =
      sections !== prevState.sections
        ? calculateInitialSectionsToRender(sections, prevState.monthsBack)
        : prevState.sectionsToRender;

    return {
      sections,
      sectionsToRender,
      lastMessagesState: nextProps.messagesState
    };
  }

  public render() {
    const { messagesState } = this.props;
    const { isProcessing, sectionsToRender } = this.state;

    const isLoading = pot.isLoading(messagesState) || isProcessing;

    return (
      <View style={styles.listWrapper}>
        <MessageAgenda
          isRefreshing={isLoading}
          sections={sectionsToRender}
          onRefresh={this.onRefresh}
          onPressItem={this.handleOnPressItem}
        />
      </View>
    );
  }

  private onRefresh = () => {
    this.setState({
      isProcessing: true
    });
    this.loadPreviousData().then(
      _ => {
        this.setState({
          isProcessing: false,
          monthsBack: _.newMonthsBack,
          sectionsToRender: _.newSectionsToRender
        });
      },
      _ => this.setState({ isProcessing: false, monthsBack: _.newMonthsBack })
    );
  };

  private handleOnPressItem = (id: string) => {
    this.props.navigateToMessageDetail(id);
  };

  private loadPreviousData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { monthsBack, sections } = this.state;
      const maybeNewSectionsToRenderWithNewMonthsBack = calculateNewSectionsToRenderWithNewMonthsBack(
        sections,
        monthsBack + 1
      );
      if (maybeNewSectionsToRenderWithNewMonthsBack.isSome()) {
        resolve(maybeNewSectionsToRenderWithNewMonthsBack.value);
      }
      reject({ newMonthsBack: monthsBack + 1 });
    });
  };
}

export default MessagesDeadlines;
