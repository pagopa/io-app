import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";
import * as ALL_PAGINATED from "../../../../messages/store/reducers/allPaginated";
import { UIMessage } from "../../../../messages/types";
import {
  shouldResetNotificationBannerDismissStateSelector,
  timesPushNotificationBannerDismissedSelector
} from "../notificationsBannerDismissed";

type TestStateProps = {
  timesDismissed?: number;
  forceDismissionDate?: number;
  messages?: Array<UIMessage>;
};
const getTestState = ({
  timesDismissed,
  forceDismissionDate,
  messages
}: TestStateProps): GlobalState =>
  ({
    entities: {
      messages: {
        allPaginated: {
          inbox: {
            data: pot.some({
              page: messages
            })
          }
        }
      }
    },
    notifications: {
      userBehaviour: {
        pushNotificationsBanner: {
          timesDismissed: timesDismissed ?? 0,
          forceDismissionDate
        }
      }
    }
  } as unknown as GlobalState);

const unreadMessage = {
  isRead: false,
  createdAt: new Date("2100-01-01")
} as unknown as UIMessage;

const readMessage = {
  isRead: true,
  createdAt: new Date("2100-01-01")
} as unknown as UIMessage;

describe("timesPushNotificationsBannerDismissedSelector", () => {
  it("should return timesPushNotificationsBannerDismissed", () => {
    expect(
      timesPushNotificationBannerDismissedSelector(
        getTestState({ timesDismissed: 1 })
      )
    ).toBe(1);
  });
});

describe("shouldResetNotificationsBannerDismissStateSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it("should return false if 'messageList' is undefined", () => {
    expect(
      shouldResetNotificationBannerDismissStateSelector(getTestState({}))
    ).toBe(false);
  });
  it("should return false if 'forceDismissDate' is undefined", () => {
    expect(
      shouldResetNotificationBannerDismissStateSelector(
        getTestState({ forceDismissionDate: undefined })
      )
    ).toBe(false);
  });

  it.each`
    unread   | moreThanFour | isNew    | expected
    ${true}  | ${true}      | ${true}  | ${true}
    ${true}  | ${true}      | ${false} | ${false}
    ${true}  | ${false}     | ${true}  | ${false}
    ${true}  | ${false}     | ${false} | ${false}
    ${false} | ${true}      | ${true}  | ${false}
    ${false} | ${true}      | ${false} | ${false}
    ${false} | ${false}     | ${true}  | ${false}
    ${false} | ${false}     | ${false} | ${false}
  `(
    "should return $expected when messageListForCategorySelector returns a list with {more than 4? $moreThanFour, unread? $unread, new? $isNew} messages",
    ({ unread, moreThanFour, isNew, expected }) => {
      const messageList = unread
        ? [
            unreadMessage,
            unreadMessage,
            ...(moreThanFour
              ? [unreadMessage, unreadMessage, unreadMessage]
              : [])
          ]
        : [
            readMessage,
            readMessage,
            ...(moreThanFour ? [readMessage, readMessage, readMessage] : [])
          ];

      jest
        .spyOn(ALL_PAGINATED, "messageListForCategorySelector")
        .mockImplementation(() => messageList);
      expect(
        shouldResetNotificationBannerDismissStateSelector(
          getTestState({
            messages: messageList,
            forceDismissionDate: isNew
              ? new Date("2000-1-1").getTime()
              : new Date("2500-1-1").getTime()
          })
        )
      ).toBe(expected);
    }
  );
});
