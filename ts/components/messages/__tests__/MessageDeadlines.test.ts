import { compareAsc, startOfDay } from "date-fns";
import { none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import {
  FiscalCode,
  IPatternStringTag,
  NonEmptyString,
  WithinRangeString
} from "italia-ts-commons/lib/strings";
import { Tuple2 } from "italia-ts-commons/lib/tuples";
import { PaymentAmount } from "../../../../definitions/backend/PaymentAmount";
import { TimeToLiveSeconds } from "../../../../definitions/backend/TimeToLiveSeconds";
import { MessagesStateAndStatus } from "../../../store/reducers/entities/messages";
import { isCreatedMessageWithContentAndDueDate } from "../../../types/CreatedMessageWithContentAndDueDate";
import {
  isPlaceholderItem,
  MessageAgendaItem,
  MessageAgendaSection,
  Sections
} from "../MessageAgenda";
import {
  testGetLastDeadlineId,
  testGetNextDeadlineId
} from "../MessagesDeadlines";

const getNextDeadlineId = testGetNextDeadlineId!;
const getLastDeadlineId = testGetLastDeadlineId!;

/**
 * Filter only the messages with a due date and group them by due_date day.
 */
const generateSections = (
  messagesState: Array<MessagesStateAndStatus>
): Sections =>
  // eslint-disable-next-line
  messagesState
    .reduce<Array<MessageAgendaItem>>((accumulator, messageState) => {
      const { isRead } = messageState;
      const message = pot.toUndefined(messageState.message);
      if (message && isCreatedMessageWithContentAndDueDate(message)) {
        return [
          ...accumulator,
          Tuple2(message, {
            isRead
          })
        ];
      }

      return accumulator;
    }, [])
    // Sort by due_date
    .sort((messageAgendaItem1, messageAgendaItem2) =>
      compareAsc(
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
      lastTitle?: string;
      // eslint-disable-next-line
      sections: MessageAgendaSection[];
    }>(
      (accumulator, messageAgendaItem) => {
        // As title of the section we use the ISOString rappresentation
        // of the due_date day.
        const title = startOfDay(
          messageAgendaItem.e1.content.due_date
        ).toISOString();
        if (title !== accumulator.lastTitle) {
          // We need to create a new section
          const newSection = {
            title,
            data: [messageAgendaItem]
          };
          return {
            lastTitle: title,
            sections: [...accumulator.sections, newSection]
          };
        }
        // We need to add the message to the last section.
        // We are sure that pop will return at least one element because
        // of the previous `if` step.
        const prevSection =
          // eslint-disable-next-line functional/immutable-data
          accumulator.sections.pop() as MessageAgendaSection;
        const newSection = {
          title,
          data: [...prevSection.data, messageAgendaItem]
        };
        return {
          lastTitle: title,
          // We used pop so we need to re-add the section.
          sections: [...accumulator.sections, newSection]
        };
      },
      {
        lastTitle: undefined,
        sections: []
      }
    ).sections;

const setDate = (year: number, hour: number): Date => {
  const d = new Date();
  return new Date(
    d.getFullYear() + year,
    d.getMonth(),
    d.getDate(),
    hour,
    12,
    12
  );
};

const oldestItemID = "01DTH3SAA23QJ436BDHDXJ4H5Y";
const nextItemAfterNowID = "01DQQGBXWSCNNY44CH2QZ95J7A";

const baseMeta = {
  created_at: setDate(-1, 12),
  fiscal_code: "ISPXNB32R82Y766A" as FiscalCode,
  id: oldestItemID,
  sender_service_id: "01DP8VSP2HYYMXSMHN7CV1GNHJ" as NonEmptyString,
  time_to_live: 3600 as TimeToLiveSeconds
};
const baseMessage = {
  isRead: true,
  isArchived: false
};

const messagesState: Array<MessagesStateAndStatus> = [
  {
    ...baseMessage,
    meta: {
      ...baseMeta,
      created_at: setDate(-1, 12),
      id: oldestItemID
    },
    message: pot.some({
      ...baseMeta,
      created_at: setDate(-1, 12),
      id: oldestItemID,
      content: {
        subject: "test wrong organization name 9 😊 😋 😎" as WithinRangeString<
          10,
          121
        >,
        markdown:
          "😊 😋 😎 organization name test wrong organization…ng organization name test wrong organization name" as WithinRangeString<
            80,
            10001
          >,
        due_date: setDate(-1, 12)
      }
    })
  },
  {
    ...baseMessage,
    meta: {
      ...baseMeta,
      created_at: setDate(0, 3),
      id: nextItemAfterNowID
    },
    message: pot.some({
      ...baseMeta,
      created_at: setDate(0, 3),
      id: nextItemAfterNowID,
      content: {
        subject: "[pagoPaTest] payment 2" as WithinRangeString<10, 121>,
        markdown:
          "demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo" as WithinRangeString<
            80,
            10001
          >,
        due_date: setDate(0, 15),
        payment_data: {
          amount: 1 as PaymentAmount,
          notice_number: "002718270840468918" as string &
            IPatternStringTag<"^[0123][0-9]{17}$">,
          invalid_after_due_date: true
        }
      }
    })
  },
  {
    ...baseMessage,
    meta: {
      ...baseMeta,
      created_at: setDate(1, 12),
      id: "01DQQGBXWSCNNY44CH2QZ95PIO"
    },
    message: pot.some({
      ...baseMeta,
      created_at: setDate(1, 12),
      id: "01DQQGBXWSCNNY44CH2QZ95PIO",
      content: {
        subject: "[pagoPaTest] payment 2" as WithinRangeString<10, 121>,
        markdown:
          "demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo" as WithinRangeString<
            80,
            10001
          >,
        due_date: setDate(1, 12),
        payment_data: {
          amount: 1 as PaymentAmount,
          notice_number: "002718270840468918" as string &
            IPatternStringTag<"^[0123][0-9]{17}$">,
          invalid_after_due_date: true
        }
      }
    })
  }
];

const sections = generateSections(messagesState);
describe("getLastDeadlineId", () => {
  it("should retrieve the last section loaded", () => {
    expect(getLastDeadlineId(sections).getOrElse("")).toEqual(oldestItemID);
  });

  it("should return none when the section list is empty", () => {
    expect(getLastDeadlineId([])).toBe(none);
  });
});

describe("getNextDeadlineId", () => {
  it("should return the next section in time", () => {
    expect(getNextDeadlineId(sections).getOrElse("")).toEqual(
      nextItemAfterNowID
    );
  });

  it("should return none when there are no items in the future", () => {
    const sectionsWithNoNext = sections.filter(
      s =>
        // remove any sections with due_date greater than today (no future)
        isPlaceholderItem(s.data[0]) ||
        s.data[0].e1.content.due_date.getTime() <
          startOfDay(new Date()).getTime()
    );
    expect(getNextDeadlineId(sectionsWithNoNext)).toEqual(none);
  });

  it("should return none when the list is empty", () => {
    expect(getNextDeadlineId([])).toEqual(none);
  });
});
