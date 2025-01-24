import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";
import * as ALL_PAGINATED from "../../../../messages/store/reducers/allPaginated";
import { UIMessage } from "../../../../messages/types";
import {
  isForceDismissAndNotUnreadMessagesHiddenSelector,
  pushNotificationsBannerForceDismissionDateSelector,
  shouldResetNotificationBannerDismissStateSelector,
  timesPushNotificationBannerDismissedSelector,
  unreadMessagesCountAfterForceDismissionSelector
} from "../notificationsBannerDismissed";
import { UserBehaviourState } from "../../reducers/userBehaviour";

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
        pushNotificationBannerDismissalCount: timesDismissed ?? 0,
        pushNotificationBannerForceDismissionDate: forceDismissionDate
      } as UserBehaviourState
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

describe("pushNotificationsBannerForceDismissionDateSelector", () => {
  it("should return undefined when 'pushNotificationBannerForceDismissionDate' has no value", () => {
    const dismissionDate = pushNotificationsBannerForceDismissionDateSelector(
      getTestState({})
    );
    expect(dismissionDate).toBe(undefined);
  });
  it("should return proper value when 'pushNotificationBannerForceDismissionDate' is defined", () => {
    const dismissionDateUE = new Date().getTime();
    const dismissionDate = pushNotificationsBannerForceDismissionDateSelector(
      getTestState({ forceDismissionDate: dismissionDateUE })
    );
    expect(dismissionDate).toBe(dismissionDateUE);
  });
});

describe("timesPushNotificationsBannerDismissedSelector", () => {
  it("should return timesPushNotificationsBannerDismissed", () => {
    expect(
      timesPushNotificationBannerDismissedSelector(
        getTestState({ timesDismissed: 1 })
      )
    ).toBe(1);
  });
});

describe("unreadMessagesCountAfterForceDismissionSelector, isForceDismissAndNotUnreadMessagesHiddenSelector, shouldResetNotificationBannerDismissStateSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  describe(`if 'messageList' is undefined`, () => {
    const noMessageListTestState = getTestState({
      forceDismissionDate: 1,
      timesDismissed: 3
    });
    it("unreadMessagesCountAfterForceDismissionSelector should return 'undefined'", () => {
      expect(
        unreadMessagesCountAfterForceDismissionSelector(noMessageListTestState)
      ).toBeUndefined();
    });
    it("isForceDismissAndNotUnreadMessagesHiddenSelector should return 'false'", () => {
      expect(
        isForceDismissAndNotUnreadMessagesHiddenSelector(noMessageListTestState)
      ).toBe(false);
    });
    it("shouldResetNotificationBannerDismissStateSelector should return 'false'", () => {
      expect(
        shouldResetNotificationBannerDismissStateSelector(
          noMessageListTestState
        )
      ).toBe(false);
    });
  });
  describe("if 'forceDismissDate' is 'undefined'", () => {
    const noForceDismissDateTestState = getTestState({
      messages: [unreadMessage, unreadMessage, unreadMessage, unreadMessage],
      timesDismissed: 3
    });
    it("unreadMessagesCountAfterForceDismissionSelector should return 'undefined'", () => {
      expect(
        unreadMessagesCountAfterForceDismissionSelector(
          noForceDismissDateTestState
        )
      ).toBeUndefined();
    });
    it("isForceDismissAndNotUnreadMessagesHiddenSelector should return 'false'", () => {
      expect(
        isForceDismissAndNotUnreadMessagesHiddenSelector(
          noForceDismissDateTestState
        )
      ).toBe(false);
    });
    it("shouldResetNotificationBannerDismissStateSelector should return 'false' ", () => {
      expect(
        shouldResetNotificationBannerDismissStateSelector(
          noForceDismissDateTestState
        )
      ).toBe(false);
    });
  });

  describe.each`
    unread   | moreThanFour | isNew    | unreadCount | expected
    ${true}  | ${true}      | ${true}  | ${5}        | ${true}
    ${true}  | ${true}      | ${false} | ${0}        | ${false}
    ${true}  | ${false}     | ${true}  | ${2}        | ${false}
    ${true}  | ${false}     | ${false} | ${0}        | ${false}
    ${false} | ${true}      | ${true}  | ${0}        | ${false}
    ${false} | ${true}      | ${false} | ${0}        | ${false}
    ${false} | ${false}     | ${true}  | ${0}        | ${false}
    ${false} | ${false}     | ${false} | ${0}        | ${false}
  `(
    `when 'messageListForCategorySelector' returns a list with {more than 4? $moreThanFour, unread? $unread, unreadCount? $unreadCount new? $isNew} messages`,
    // `should return '$unreadCount' '!$expected' '$expected' when messageListForCategorySelector returns a list with {more than 4? $moreThanFour, unread? $unread, unreadCount? $unreadCount new? $isNew} messages`,
    ({ unread, moreThanFour, isNew, unreadCount, expected }) => {
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
      const testState = getTestState({
        messages: messageList,
        forceDismissionDate: isNew
          ? new Date("2000-1-1").getTime()
          : new Date("2500-1-1").getTime()
      });
      it(`unreadMessagesCountAfterForceDismissionSelector should return '${unreadCount}'`, () => {
        expect(unreadMessagesCountAfterForceDismissionSelector(testState)).toBe(
          unreadCount
        );
      });
      it(`isForceDismissAndNotUnreadMessagesHiddenSelector should return '${!expected}'`, () => {
        expect(
          isForceDismissAndNotUnreadMessagesHiddenSelector(testState)
        ).toBe(!expected);
      });
      it(`shouldResetNotificationBannerDismissStateSelector should return '${expected}'`, () => {
        expect(
          shouldResetNotificationBannerDismissStateSelector(testState)
        ).toBe(expected);
      });
    }
  );
});
