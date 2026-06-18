import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  setShownMessageCategoryAction,
  upsertMessageStatusAttributes
} from "../../../actions";
import { GlobalState } from "../../../../../../store/reducers/types";
import reducer, {
  isLoadingOrUpdatingInbox,
  shownMessageCategorySelector,
  messageListForCategorySelector,
  emptyListReasonSelector,
  shouldShowFooterListComponentSelector,
  shouldShowRefreshControllOnListSelector,
  isPaymentMessageWithPaidNoticeSelector,
  messagePagePotFromCategorySelector
} from "..";
import {
  AllPaginated,
  LastRequestValues,
  MessagePage,
  MessagePagePot
} from "../types";
import { pageSize } from "../../../../../../config";
import { UIMessage } from "../../../../types";
import { clearCache } from "../../../../../settings/common/store/actions";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { MessageListCategory } from "../../../../types/messageListCategory";
import { emptyMessageArray } from "../../../../utils";
import { isSomeLoadingOrSomeUpdating } from "../../../../../../utils/pot";
import { PaymentByRptIdState } from "../../../../../../store/reducers/entities/payments";
import { MessageCategory } from "../../../../../../../definitions/communication/MessageCategory";
import { nextPageLoadingWaitMillisecondsGenerator } from "../../../../components/Home/homeUtils";

type LastRequestType = LastRequestValues | undefined;

describe("allPaginated reducer", () => {
  describe("when `setShownMessageCategoryAction` is received", () => {
    it("should change from INBOX to ARCHIVE", () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("INBOX")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("INBOX");
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should change from ARCHIVE to INBOX", () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("ARCHIVE");
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState,
        setShownMessageCategoryAction("INBOX")
      );
      expect(allPaginatedFinalState.shownCategory).toBe("INBOX");
    });
    it("should stay ARCHIVE", () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("ARCHIVE");
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should stay INBOX", () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("INBOX")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("INBOX");
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState,
        setShownMessageCategoryAction("INBOX")
      );
      expect(allPaginatedFinalState.shownCategory).toBe("INBOX");
    });
  });

  describe("when an action that is not `setShownMessageCategoryAction` is received", () => {
    const allPaginatedInitialStateGenerator = () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("ARCHIVE");
      return allPaginatedInitialState;
    };
    it("should keep its `showCategory` value (reloadAllMessages.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        reloadAllMessages.request({
          pageSize,
          filter: { getArchived: true },
          fromUserAction: false
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (reloadAllMessages.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        reloadAllMessages.success({
          messages: [],
          filter: { getArchived: true },
          pagination: {},
          fromUserAction: false
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (reloadAllMessages.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        reloadAllMessages.failure({
          error: new Error(""),
          filter: { getArchived: true }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (loadNextPageMessages.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        loadNextPageMessages.request({
          pageSize,
          filter: { getArchived: true },
          fromUserAction: false
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (loadNextPageMessages.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        loadNextPageMessages.success({
          messages: [],
          filter: { getArchived: true },
          pagination: {},
          fromUserAction: false
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (loadNextPageMessages.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        loadNextPageMessages.failure({
          error: new Error(""),
          filter: { getArchived: true }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (loadPreviousPageMessages.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        loadPreviousPageMessages.request({
          pageSize,
          filter: { getArchived: true },
          fromUserAction: false
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (loadPreviousPageMessages.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        loadPreviousPageMessages.success({
          messages: [],
          filter: { getArchived: true },
          pagination: {},
          fromUserAction: false
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (loadPreviousPageMessages.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        loadPreviousPageMessages.failure({
          error: new Error(""),
          filter: { getArchived: true }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (upsertMessageStatusAttributes.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        upsertMessageStatusAttributes.request({
          message: { isRead: true } as UIMessage,
          update: { isArchived: false, tag: "bulk" }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (upsertMessageStatusAttributes.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        upsertMessageStatusAttributes.success({
          message: { isRead: true } as UIMessage,
          update: { isArchived: false, tag: "bulk" }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (upsertMessageStatusAttributes.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        upsertMessageStatusAttributes.failure({
          error: new Error(""),
          payload: {
            message: { isRead: true } as UIMessage,
            update: { isArchived: false, tag: "bulk" }
          }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (clearCache)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialStateGenerator(),
        clearCache()
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
  });

  it("'lastUpdateTime' should match expected values for initial state", () => {
    const allPaginatedState = reducer(
      undefined,
      applicationChangeState("active")
    );
    expect(allPaginatedState.archive.lastUpdateTime).toStrictEqual(new Date(0));
    expect(allPaginatedState.inbox.lastUpdateTime).toStrictEqual(new Date(0));
  });
});

const defaultState: AllPaginated = {
  inbox: {
    data: pot.none,
    lastRequest: undefined,
    lastUpdateTime: new Date(0)
  },
  archive: {
    data: pot.none,
    lastRequest: undefined,
    lastUpdateTime: new Date(0)
  },
  shownCategory: "INBOX"
};

function toGlobalState(localState: AllPaginated): GlobalState {
  return {
    entities: { messages: { allPaginated: localState } }
  } as unknown as GlobalState;
}

describe("isLoadingOrUpdatingInbox selector", () => {
  [
    {
      inbox: pot.none,
      expectedReturn: false
    },
    {
      inbox: pot.noneError({ reason: "", time: new Date() }),
      expectedReturn: false
    },
    {
      inbox: pot.some({
        page: []
      }),
      expectedReturn: false
    },
    {
      inbox: pot.someError(
        {
          page: []
        },
        { reason: "", time: new Date() }
      ),
      expectedReturn: false
    },
    {
      inbox: pot.noneLoading,
      expectedReturn: true
    },
    {
      inbox: pot.noneUpdating({
        page: []
      }),
      expectedReturn: true
    },
    {
      inbox: pot.someLoading({
        page: []
      }),
      expectedReturn: true
    },
    {
      inbox: pot.someUpdating(
        {
          page: []
        },
        {
          page: []
        }
      ),
      expectedReturn: true
    }
  ].forEach(({ inbox, expectedReturn }) => {
    describe(`given { inbox: ${inbox.kind} }`, () => {
      it(`should return ${expectedReturn}`, () => {
        expect(
          isLoadingOrUpdatingInbox(
            toGlobalState({
              ...defaultState,
              inbox: {
                data: inbox,
                lastRequest: undefined,
                lastUpdateTime: new Date(0)
              }
            })
          )
        ).toBe(expectedReturn);
      });
    });
  });
});

describe("shownMessageCategorySelector", () => {
  it("should return INBOX for the initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const shownCategory = shownMessageCategorySelector(globalState);
    expect(shownCategory).toBe("INBOX");
  });
  it("should return INBOX when shownCategory is INBOX", () => {
    const globalState = appReducer(
      undefined,
      setShownMessageCategoryAction("INBOX")
    );
    const shownCategory = shownMessageCategorySelector(globalState);
    expect(shownCategory).toBe("INBOX");
  });
  it("should return ARCHIVE when shownCategory is ARCHIVE", () => {
    const globalState = appReducer(
      undefined,
      setShownMessageCategoryAction("ARCHIVE")
    );
    const shownCategory = shownMessageCategorySelector(globalState);
    expect(shownCategory).toBe("ARCHIVE");
  });
});

describe("messageListForCategorySelector", () => {
  const categories: ReadonlyArray<MessageListCategory> = ["INBOX", "ARCHIVE"];
  categories.forEach(category => {
    it(`for ${category} category, data pot.none, should return emptyMessageArray reference`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.none
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(emptyMessageArray);
    });
    it(`for ${category} category, data pot.noneLoading, should return undefined`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.noneLoading
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBeUndefined();
    });
    it(`for ${category} category, data pot.noneUpdating, should return undefined`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.noneUpdating({} as MessagePage)
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBeUndefined();
    });
    it(`for ${category} category, data pot.noneError, should return emptyMessageArray reference`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.noneError({ reason: "", time: new Date() })
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(emptyMessageArray);
    });
    it(`for ${category} category, data pot.some, should return the message list`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.some(nonEmptyMessagePage)
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(readonlyNonEmptyMessageList);
    });
    it(`for ${category} category, data pot.someLoading, should return the message list`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.someLoading(nonEmptyMessagePage)
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(readonlyNonEmptyMessageList);
    });
    it(`for ${category} category, data pot.someUpdating, should return the message list`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.someUpdating(nonEmptyMessagePage, {} as MessagePage)
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(readonlyNonEmptyMessageList);
    });
    it(`for ${category} category, data pot.someError, should return the message list`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(readonlyNonEmptyMessageList);
    });
  });
});

describe("emptyListReasonSelector", () => {
  it("should return 'noData' for INBOX category when inbox message collection is pot.none", () => {
    const state = generateAllPaginatedDataStateForCategory("INBOX", pot.none);
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.noneLoading", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.noneLoading
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.noneUpdating", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.noneUpdating(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'error' for INBOX category when inbox message collection is pot.noneError", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.noneError({ reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("error");
  });
  it("should return 'noData' for INBOX category when inbox message collection is pot.some with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.some(emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.some with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.some(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for INBOX category when inbox message collection is pot.someLoading with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someLoading(emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.someLoading with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someLoading(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for INBOX category when inbox message collection is pot.someUpdating with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someUpdating(emptyMessagePage, nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.someUpdating with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someUpdating(nonEmptyMessagePage, emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for INBOX category when inbox message collection is pot.someError with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someError(emptyMessagePage, { reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.someError with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.none", () => {
    const state = generateAllPaginatedDataStateForCategory("ARCHIVE", pot.none);
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.noneLoading", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.noneLoading
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.noneUpdating", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.noneUpdating(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'error' for ARCHIVE category when inbox message collection is pot.noneError", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.noneError({ reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("error");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.some with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.some(emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.some with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.some(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.someLoading with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someLoading(emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.someLoading with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someLoading(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.someUpdating with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someUpdating(emptyMessagePage, nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.someUpdating with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someUpdating(nonEmptyMessagePage, emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.someError with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someError(emptyMessagePage, { reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.someError with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
});

describe("shouldShowFooterListComponentSelector", () => {
  const categories: Array<MessageListCategory> = ["INBOX", "ARCHIVE"];
  const messagePagePots: Array<MessagePagePot> = [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(emptyMessagePage),
    pot.noneError({ reason: "", time: new Date() }),
    pot.some(nonEmptyMessagePage),
    pot.someLoading(nonEmptyMessagePage),
    pot.someUpdating(nonEmptyMessagePage, emptyMessagePage),
    pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
  ];
  const lastRequests: Array<LastRequestType> = [
    "all",
    "next",
    "previous",
    undefined
  ];
  categories.forEach(category =>
    lastRequests.forEach(lastRequest =>
      messagePagePots.forEach(messagePagePot => {
        const footerIsVisible =
          lastRequest === "next" && isSomeLoadingOrSomeUpdating(messagePagePot);
        it(`Footer should be ${
          footerIsVisible ? "visible" : "hidden"
        }, ${category}, '${
          lastRequest
        }' lastRequest, ${messagePagePot.kind}`, () => {
          const state = generateAllPaginatedDataStateForCategory(
            category,
            messagePagePot,
            lastRequest
          );
          const shouldShowFooterListComponent =
            shouldShowFooterListComponentSelector(state, category);
          expect(shouldShowFooterListComponent).toBe(footerIsVisible);
        });
      })
    )
  );
});

describe("messagePagePotFromCategorySelector", () => {
  it("should return messagePagePot, INBOX category", () => {
    const category: MessageListCategory = "INBOX";
    const messagePagePot = pot.some({} as MessagePage);
    const state = generateAllPaginatedDataStateForCategory(
      category,
      messagePagePot
    );
    const outputMessagePagePot = messagePagePotFromCategorySelector(
      category,
      state
    );
    expect(outputMessagePagePot).toStrictEqual(messagePagePot);
  });
});

describe("nextPageLoadingWaitMillisecondsGenerator", () => {
  it("should return 2 seconds", () => {
    const waitMilliseconds = nextPageLoadingWaitMillisecondsGenerator();
    expect(waitMilliseconds).toBe(2000);
  });
});

describe("shouldShowRefreshControllOnListSelector", () => {
  const categories: ReadonlyArray<MessageListCategory> = ["INBOX", "ARCHIVE"];
  const messagePagePotData: ReadonlyArray<MessagePagePot> = [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(nonEmptyMessagePage),
    pot.noneError({ reason: "", time: new Date() }),
    pot.some(nonEmptyMessagePage),
    pot.someLoading(nonEmptyMessagePage),
    pot.someUpdating(nonEmptyMessagePage, emptyMessagePage),
    pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
  ];
  const messageRequests: ReadonlyArray<LastRequestType> = [
    "next",
    "previous",
    "all",
    undefined
  ];

  categories.forEach(category =>
    messagePagePotData.forEach(messagePagePot =>
      messageRequests.forEach(messageRequest => {
        const expectedOutput =
          (messagePagePot.kind === "PotSomeLoading" ||
            messagePagePot.kind === "PotSomeUpdating") &&
          messageRequest !== undefined &&
          (messageRequest === "all" || messageRequest === "previous");

        it(`should return ${expectedOutput}, ${category}, '${
          messageRequest
        }' lastRequest, ${messagePagePot.kind}`, () => {
          const state = generateAllPaginatedDataStateForCategory(
            category,
            messagePagePot,
            messageRequest
          );
          const shouldShowRefreshControl =
            shouldShowRefreshControllOnListSelector(state, category);
          expect(shouldShowRefreshControl).toBe(expectedOutput);
        });
      })
    )
  );
});

describe("isPaymentMessageWithPaidNoticeSelector", () => {
  it("should return 'false' for GENERIC category", () => {
    const state = {
      entities: {
        paymentByRptId: {
          "00123456789001122334455667788": { kind: "DUPLICATED" }
        } as PaymentByRptIdState
      }
    } as GlobalState;
    const category = {
      tag: "GENERIC"
    } as MessageCategory;
    const isPaid = isPaymentMessageWithPaidNoticeSelector(state, category);
    expect(isPaid).toBe(false);
  });
  it("should return 'false' for EU_COVID_CERT category", () => {
    const state = {
      entities: {
        paymentByRptId: {
          "00123456789001122334455667788": { kind: "DUPLICATED" }
        } as PaymentByRptIdState
      }
    } as GlobalState;
    const category = {
      tag: "EU_COVID_CERT"
    } as MessageCategory;
    const isPaid = isPaymentMessageWithPaidNoticeSelector(state, category);
    expect(isPaid).toBe(false);
  });
  it("should return 'false' for LEGAL_MESSAGE category", () => {
    const state = {
      entities: {
        paymentByRptId: {
          "00123456789001122334455667788": { kind: "DUPLICATED" }
        } as PaymentByRptIdState
      }
    } as GlobalState;
    const category = {
      tag: "LEGAL_MESSAGE"
    } as MessageCategory;
    const isPaid = isPaymentMessageWithPaidNoticeSelector(state, category);
    expect(isPaid).toBe(false);
  });
  it("should return 'false' for SEND category", () => {
    const state = {
      entities: {
        paymentByRptId: {
          "00123456789001122334455667788": { kind: "DUPLICATED" }
        } as PaymentByRptIdState
      }
    } as GlobalState;
    const category = {
      tag: "PN"
    } as MessageCategory;
    const isPaid = isPaymentMessageWithPaidNoticeSelector(state, category);
    expect(isPaid).toBe(false);
  });
  it("should return 'false' for PAYMENT category, unmatching rptId", () => {
    const state = {
      entities: {
        paymentByRptId: {
          "00123456789001122334455667788": { kind: "DUPLICATED" }
        } as PaymentByRptIdState
      }
    } as GlobalState;
    const category = {
      tag: "PAYMENT",
      rptId: "00123456789001122334455667799"
    } as MessageCategory;
    const isPaid = isPaymentMessageWithPaidNoticeSelector(state, category);
    expect(isPaid).toBe(false);
  });
  it("should return 'false' for PAYMENT category, matching rptId, undefined value", () => {
    const state = {
      entities: {
        paymentByRptId: {
          "00123456789001122334455667788": undefined
        } as PaymentByRptIdState
      }
    } as GlobalState;
    const category = {
      tag: "PAYMENT",
      rptId: "00123456789001122334455667799"
    } as MessageCategory;
    const isPaid = isPaymentMessageWithPaidNoticeSelector(state, category);
    expect(isPaid).toBe(false);
  });
  it("should return 'true' for PAYMENT category, matching rptId, 'DUPLICATED' value", () => {
    const state = {
      entities: {
        paymentByRptId: {
          "00123456789001122334455667788": { kind: "DUPLICATED" }
        } as PaymentByRptIdState
      }
    } as GlobalState;
    const category = {
      tag: "PAYMENT",
      rptId: "00123456789001122334455667788"
    } as MessageCategory;
    const isPaid = isPaymentMessageWithPaidNoticeSelector(state, category);
    expect(isPaid).toBe(true);
  });
  it("should return 'true' for PAYMENT category, matching rptId, 'COMPLETED' value", () => {
    const state = {
      entities: {
        paymentByRptId: {
          "00123456789001122334455667788": {
            kind: "COMPLETED",
            transactionId: undefined
          }
        } as PaymentByRptIdState
      }
    } as GlobalState;
    const category = {
      tag: "PAYMENT",
      rptId: "00123456789001122334455667788"
    } as MessageCategory;
    const isPaid = isPaymentMessageWithPaidNoticeSelector(state, category);
    expect(isPaid).toBe(true);
  });
});

const generateAllPaginatedDataStateForCategory = (
  category: MessageListCategory,
  data: MessagePagePot,
  lastRequest: LastRequestType = undefined
): GlobalState =>
  ({
    entities: {
      messages: {
        allPaginated: {
          inbox:
            category === "INBOX"
              ? { data, lastRequest }
              : { data: pot.none, lastRequest: undefined },
          archive:
            category === "ARCHIVE"
              ? { data, lastRequest }
              : { data: pot.none, lastRequest: undefined }
        }
      }
    }
  }) as GlobalState;

const readonlyNonEmptyMessageList: ReadonlyArray<UIMessage> = [{} as UIMessage];
const nonEmptyMessagePage = {
  page: readonlyNonEmptyMessageList,
  next: "01J06J748BP0MS9FZRPZV8DWCC"
} as MessagePage;

const readonlyEmptyMessageList: ReadonlyArray<UIMessage> = [];
const emptyMessagePage = {
  page: readonlyEmptyMessageList
} as MessagePage;
