import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { ActionType } from "typesafe-actions";
import { GlobalState } from "../../../../../store/reducers/types";
import { MessageListCategory } from "../../../types/messageListCategory";
import * as allPaginated from "../../../store/reducers/allPaginated";
import {
  accessibilityLabelForMessageItem,
  getInitialReloadAllMessagesActionIfNeeded,
  getLoadNextPageMessagesActionIfAllowed,
  getLoadPreviousPageMessagesActionIfAllowed,
  getMessagesViewPagerInitialPageIndex,
  getReloadAllMessagesActionForRefreshIfAllowed,
  messageListCategoryToViewPageIndex,
  messageViewPageIndexToListCategory,
  nextPageLoadingWaitMillisecondsGenerator,
  refreshIntervalMillisecondsGenerator,
  archiveUnarchiveAccessibilityInstructions
} from "../homeUtils";
import { maximumItemsFromAPI, pageSize } from "../../../../../config";
import { Action } from "../../../../../store/actions/types";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../store/actions";
import { UIMessage } from "../../../types";
import {
  isLoadingOrUpdating,
  isSomeOrSomeError,
  isStrictNone,
  isStrictSome,
  isStrictSomeError
} from "../../../../../utils/pot";
import {
  ArchivingStatus,
  INITIAL_STATE
} from "../../../store/reducers/archiving";
import { activeSessionLoginIntialState } from "../../../../authentication/activeSessionLogin/store/reducer";

const createGlobalState = (
  archiveData: allPaginated.MessagePagePot,
  inboxData: allPaginated.MessagePagePot,
  shownCategory: MessageListCategory,
  archivingStatus: ArchivingStatus = "disabled"
) =>
  ({
    entities: {
      messages: {
        allPaginated: {
          archive: {
            data: archiveData
          },
          inbox: {
            data: inboxData
          },
          shownCategory
        },
        archiving: {
          ...INITIAL_STATE,
          status: archivingStatus
        }
      }
    },
    features: {
      loginFeatures: {
        activeSessionLogin: {
          ...activeSessionLoginIntialState
        }
      }
    }
  } as GlobalState);

const checkReturnedAction = (action?: Action, getArchived: boolean = false) => {
  expect(action).not.toBeUndefined();
  expect(action?.type).toBe("MESSAGES_RELOAD_REQUEST");
  const reloadAllMessagesRequest = action as ActionType<
    typeof reloadAllMessages.request
  >;
  expect(reloadAllMessagesRequest?.payload.pageSize).toBe(pageSize);
  expect(reloadAllMessagesRequest?.payload.filter.getArchived).toBe(
    getArchived
  );
};

describe("getInitialReloadAllMessagesActionIfNeeded", () => {
  const shownCategories: ReadonlyArray<MessageListCategory> = [
    "ARCHIVE",
    "INBOX"
  ];
  const archiveStatuses: ReadonlyArray<ArchivingStatus> = [
    "disabled",
    "enabled",
    "processing"
  ];
  const messagePage = {} as allPaginated.MessagePage;
  const anError = { reason: "", time: new Date() } as allPaginated.MessageError;
  const potValues = [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(messagePage),
    pot.noneError(anError),
    pot.some(messagePage),
    pot.someLoading(messagePage),
    pot.someUpdating(messagePage, messagePage),
    pot.someError(messagePage, anError)
  ];
  const outputActionShouldBeUndefined = (
    archivingStatus: ArchivingStatus,
    currentCategoryPot: pot.Pot<
      allPaginated.MessagePage,
      allPaginated.MessageError
    >,
    oppositeCategoryPot: pot.Pot<
      allPaginated.MessagePage,
      allPaginated.MessageError
    >
  ) =>
    archivingStatus === "processing" ||
    isLoadingOrUpdating(oppositeCategoryPot) ||
    !isStrictNone(currentCategoryPot);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  shownCategories.forEach(shownCategory =>
    archiveStatuses.forEach(archiveStatus =>
      potValues.forEach(inboxPot =>
        potValues.forEach(archivePot => {
          const currentCategoryPot =
            shownCategory === "ARCHIVE" ? archivePot : inboxPot;
          const oppositeCategoryPot =
            shownCategory === "INBOX" ? archivePot : inboxPot;
          const reloadAllMessagesActionShouldBeDefined =
            !outputActionShouldBeUndefined(
              archiveStatus,
              currentCategoryPot,
              oppositeCategoryPot
            );
          it(`Should return ${
            reloadAllMessagesActionShouldBeDefined
              ? "reloadAllMessages.request"
              : "undefined"
          } when showing ${shownCategory}, inbox status is ${
            inboxPot.kind
          }, archive status is ${
            archivePot.kind
          }, archiving mode is ${archiveStatus}`, () => {
            const globalState = createGlobalState(
              archivePot,
              inboxPot,
              shownCategory,
              archiveStatus
            );
            const reloadAllMessagesRequest =
              getInitialReloadAllMessagesActionIfNeeded(globalState);

            if (reloadAllMessagesActionShouldBeDefined) {
              checkReturnedAction(
                reloadAllMessagesRequest,
                shownCategory === "ARCHIVE"
              );
            } else {
              expect(reloadAllMessagesRequest).toBeUndefined();
            }
          });
        })
      )
    )
  );
});

describe("getMessagesViewPagerInitialPageIndex", () => {
  it("should return 1 when shownCategory is ARCHIVED", () => {
    const globalState = createGlobalState(pot.none, pot.none, "ARCHIVE");
    const pageIndex = getMessagesViewPagerInitialPageIndex(globalState);
    expect(pageIndex).toBe(1);
  });
  it("should return 0 when shownCategory is INBOX", () => {
    const globalState = createGlobalState(pot.none, pot.none, "INBOX");
    const pageIndex = getMessagesViewPagerInitialPageIndex(globalState);
    expect(pageIndex).toBe(0);
  });
});

describe("messageListCategoryToViewPageIndex", () => {
  it("should return 0 for INBOX", () => {
    const pageIndex = messageListCategoryToViewPageIndex("INBOX");
    expect(pageIndex).toBe(0);
  });
  it("should return 1 for ARCHIVE", () => {
    const pageIndex = messageListCategoryToViewPageIndex("ARCHIVE");
    expect(pageIndex).toBe(1);
  });
});

describe("messageViewPageIndexToListCategory", () => {
  it("should return ARCHIVE when index is 1", () => {
    const listCategory = messageViewPageIndexToListCategory(1);
    expect(listCategory).toBe("ARCHIVE");
  });
  it("should return INBOX when index is 0", () => {
    const listCategory = messageViewPageIndexToListCategory(0);
    expect(listCategory).toBe("INBOX");
  });
  it("should return INBOX when index is -1", () => {
    const listCategory = messageViewPageIndexToListCategory(-1);
    expect(listCategory).toBe("INBOX");
  });
  it("should return INBOX when index is 2", () => {
    const listCategory = messageViewPageIndexToListCategory(2);
    expect(listCategory).toBe("INBOX");
  });
});

describe("accessibilityLabelForMessageItem", () => {
  const baseMessage = {
    organizationName: "Organization A",
    serviceName: "Service A",
    title: "Message Title",
    createdAt: new Date(2023, 5, 15)
  } as UIMessage;

  it("should match expected output for unread message, in archive, selected is undefined", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(
      message,
      "ARCHIVE",
      undefined
    );
    expect(result).toBe(
      "Messaggio non letto , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per selezionare e in seguito disarchiviare"
    );
  });
  it("should match expected output for unread message, in archive, selected is false", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(message, "ARCHIVE", false);
    expect(result).toBe(
      "Messaggio non letto , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per selezionare e in seguito disarchiviare"
    );
  });
  it("should match expected output for unread message, in archive, selected is true", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(message, "ARCHIVE", true);
    expect(result).toBe(
      "Messaggio non letto selezionato, ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per deselezionare"
    );
  });
  it("should match expected output for unread message, in inbox  , selected is undefined", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(
      message,
      "INBOX",
      undefined
    );
    expect(result).toBe(
      "Messaggio non letto , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per selezionare e in seguito archiviare"
    );
  });
  it("should match expected output for unread message, in inbox  , selected is false", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(message, "INBOX", false);
    expect(result).toBe(
      "Messaggio non letto , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per selezionare e in seguito archiviare"
    );
  });
  it("should match expected output for unread message, in inbox  , selected is true", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(message, "INBOX", true);
    expect(result).toBe(
      "Messaggio non letto selezionato, ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per deselezionare"
    );
  });
  it("should match expected output for unread message, in search , selected is undefined", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(
      message,
      "SEARCH",
      undefined
    );
    expect(result).toBe(
      "Messaggio non letto , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . "
    );
  });
  it("should match expected output for unread message, in search , selected is false", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(message, "SEARCH", false);
    expect(result).toBe(
      "Messaggio non letto , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . "
    );
  });
  it("should match expected output for unread message, in search , selected is true", () => {
    const message = {
      ...baseMessage,
      isRead: false
    };
    const result = accessibilityLabelForMessageItem(message, "SEARCH", true);
    expect(result).toBe(
      "Messaggio non letto selezionato, ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . "
    );
  });
  it("should match expected output for read message  , in archive, selected is undefined", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(
      message,
      "ARCHIVE",
      undefined
    );
    expect(result).toBe(
      "Messaggio , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per selezionare e in seguito disarchiviare"
    );
  });
  it("should match expected output for read message  , in archive, selected is false", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(message, "ARCHIVE", false);
    expect(result).toBe(
      "Messaggio , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per selezionare e in seguito disarchiviare"
    );
  });
  it("should match expected output for read message  , in archive, selected is true", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(message, "ARCHIVE", true);
    expect(result).toBe(
      "Messaggio selezionato, ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per deselezionare"
    );
  });
  it("should match expected output for read message  , in inbox  , selected is undefined", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(
      message,
      "INBOX",
      undefined
    );
    expect(result).toBe(
      "Messaggio , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per selezionare e in seguito archiviare"
    );
  });
  it("should match expected output for read message  , in inbox  , selected is false", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(message, "INBOX", false);
    expect(result).toBe(
      "Messaggio , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per selezionare e in seguito archiviare"
    );
  });
  it("should match expected output for read message  , in inbox  , selected is true", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(message, "INBOX", true);
    expect(result).toBe(
      "Messaggio selezionato, ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . Tieni premuto per deselezionare"
    );
  });
  it("should match expected output for read message  , in search , selected is undefined", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(
      message,
      "SEARCH",
      undefined
    );
    expect(result).toBe(
      "Messaggio , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . "
    );
  });
  it("should match expected output for read message  , in search , selected is false", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(message, "SEARCH", false);
    expect(result).toBe(
      "Messaggio , ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . "
    );
  });
  it("should match expected output for read message  , in search , selected is true", () => {
    const message = {
      ...baseMessage,
      isRead: true
    };
    const result = accessibilityLabelForMessageItem(message, "SEARCH", true);
    expect(result).toBe(
      "Messaggio selezionato, ricevuto da Organization A, Service A. Message Title. \n    ricevuto il 15 giugno 2023\n  . "
    );
  });
});

describe("getLoadNextPageMessagesActionIfNeeded", () => {
  const nextValues = [undefined, "01J0KB1T5XVKHERASERQ01CG4J"];
  const generatePots = (
    errorTime: Date = new Date(2024, 1, 1, 9, 30, 0, 0),
    nextValue?: string
  ) => [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating({ page: [], next: nextValue }),
    pot.noneError({ reason: "", time: errorTime }),
    pot.some({ page: [], next: nextValue }),
    pot.someLoading({ page: [], next: nextValue }),
    pot.someUpdating(
      { page: [], next: nextValue },
      { page: [], next: nextValue }
    ),
    pot.someError(
      { page: [], next: nextValue },
      { reason: "", time: errorTime }
    )
  ];
  const lastRequestValues = [
    O.none,
    O.some("next"),
    O.some("previous"),
    O.some("all")
  ];
  const categories: Array<MessageListCategory> = ["INBOX", "ARCHIVE"];

  const computeExpectedLoadNextPageMessagesValue = (
    state: GlobalState,
    category: MessageListCategory,
    timeOfCheck: Date
  ) => {
    // This method is the human-unreadable logic of the `getLoadNextPageMessagesActionIfAllowed` method
    // Check that one instead to filter out the case where the loadNextPageMessages.request action is returned.
    const allPaginatedInstance = state.entities.messages.allPaginated;
    const selectedCollection =
      category === "ARCHIVE"
        ? allPaginatedInstance.archive
        : allPaginatedInstance.inbox;
    const oppositeCollection =
      category === "ARCHIVE"
        ? allPaginatedInstance.inbox
        : allPaginatedInstance.archive;
    const selectedCollectionNextValue = isSomeOrSomeError(
      selectedCollection.data
    )
      ? selectedCollection.data.value.next
      : undefined;

    const canLoadNextMessages =
      !pot.isLoading(oppositeCollection.data) &&
      !pot.isUpdating(oppositeCollection.data) &&
      ((isStrictSome(selectedCollection.data) &&
        !!selectedCollectionNextValue) ||
        (isStrictSomeError(selectedCollection.data) &&
          !!selectedCollectionNextValue &&
          (O.isNone(selectedCollection.lastRequest) ||
            selectedCollection.lastRequest.value !== "next" ||
            timeOfCheck.getTime() -
              selectedCollection.data.error.time.getTime() >
              nextPageLoadingWaitMillisecondsGenerator())));
    return canLoadNextMessages
      ? loadNextPageMessages.request({
          pageSize,
          cursor: selectedCollectionNextValue,
          filter: { getArchived: category === "ARCHIVE" },
          fromUserAction: true
        })
      : undefined;
  };
  const timeOfCheck = new Date(2024, 1, 1, 9, 30, 30, 0);
  const errorTimes = [
    new Date(2024, 1, 1, 9, 30, 29, 0),
    new Date(2024, 1, 1, 9, 30, 27, 0)
  ];
  // eslint-disable-next-line sonarjs/cognitive-complexity
  generatePots().forEach(oppositeCategoryData =>
    errorTimes.forEach(errorTime =>
      nextValues.forEach(selectedCategoryNextValue =>
        generatePots(errorTime, selectedCategoryNextValue).forEach(
          selectedCategoryData =>
            lastRequestValues.forEach(selectedCategoryLastRequestValue =>
              categories.forEach(selectedCategory => {
                const state = {
                  entities: {
                    messages: {
                      allPaginated: {
                        inbox: {
                          data:
                            selectedCategory === "INBOX"
                              ? selectedCategoryData
                              : oppositeCategoryData,
                          lastRequest:
                            selectedCategory === "INBOX"
                              ? selectedCategoryLastRequestValue
                              : O.none
                        },
                        archive: {
                          data:
                            selectedCategory === "ARCHIVE"
                              ? selectedCategoryData
                              : oppositeCategoryData,
                          lastRequest:
                            selectedCategory === "ARCHIVE"
                              ? selectedCategoryLastRequestValue
                              : O.none
                        }
                      },
                      archiving: INITIAL_STATE
                    }
                  }
                } as GlobalState;
                const expectedOutput = computeExpectedLoadNextPageMessagesValue(
                  state,
                  selectedCategory,
                  timeOfCheck
                );
                it(`Should return '${
                  expectedOutput ? "loadNextPageMessages.request" : "undefined"
                }' for '${selectedCategory}' with state '${
                  selectedCategoryData.kind
                }' where next page index is '${selectedCategoryNextValue}' and lastRequest value is '${
                  O.isSome(selectedCategoryLastRequestValue)
                    ? selectedCategoryLastRequestValue.value
                    : "None"
                }' (time from last error is ${
                  timeOfCheck.getTime() - errorTime.getTime()
                } milliseconds), opposite category state '${
                  oppositeCategoryData.kind
                }'`, () => {
                  const loadNextPageMessageAction =
                    getLoadNextPageMessagesActionIfAllowed(
                      state,
                      selectedCategory,
                      timeOfCheck
                    );
                  expect(loadNextPageMessageAction).toStrictEqual(
                    expectedOutput
                  );
                });
              })
            )
        )
      )
    )
  );
});

describe("refreshIntervalMillisecondsGenerator", () => {
  it("should return 60000 milliseconds", () => {
    const refreshInterval = refreshIntervalMillisecondsGenerator();
    expect(refreshInterval).toBe(60000);
  });
});

describe("getReloadAllMessagesActionForRefreshIfAllowed", () => {
  const pots = [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating({ page: [] }),
    pot.noneError(""),
    pot.some({ page: [] }),
    pot.someLoading({ page: [] }),
    pot.someUpdating({ page: [] }, { page: [] }),
    pot.someError({ page: [] }, "")
  ];
  const categories: Array<MessageListCategory> = ["INBOX", "ARCHIVE"];
  categories.forEach(category =>
    pots.forEach(inboxPot =>
      pots.forEach(archivePot => {
        const expectedOutput =
          !isLoadingOrUpdating(inboxPot) && !isLoadingOrUpdating(archivePot)
            ? reloadAllMessages.request({
                pageSize,
                filter: { getArchived: category === "ARCHIVE" },
                fromUserAction: true
              })
            : undefined;
        it(`should return '${
          expectedOutput ? "reloadAllMessages.request" : "undefined"
        }' for category '${category}', where inbox state is '${
          inboxPot.kind
        }' and archive state is '${archivePot.kind}'`, () => {
          const state = {
            entities: {
              messages: {
                allPaginated: {
                  archive: {
                    data: archivePot
                  },
                  inbox: {
                    data: inboxPot
                  }
                },
                archiving: INITIAL_STATE
              }
            }
          } as GlobalState;
          const reloadAllMessagesAction =
            getReloadAllMessagesActionForRefreshIfAllowed(state, category);
          expect(reloadAllMessagesAction).toStrictEqual(expectedOutput);
        });
      })
    )
  );
});

describe("getLoadNextPreviousPageMessagesActionIfAllowed", () => {
  const generateMessagePots = (previousPageMessageId?: string) => [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating({ page: [], previous: previousPageMessageId }),
    pot.noneError(""),
    pot.some({ page: [], previous: previousPageMessageId }),
    pot.someLoading({ page: [], previous: previousPageMessageId }),
    pot.someUpdating(
      { page: [], previous: previousPageMessageId },
      { page: [], previous: previousPageMessageId }
    ),
    pot.someError({ page: [], previous: previousPageMessageId }, "")
  ];
  const lastUpdateTimes = [
    new Date(new Date().getTime() - refreshIntervalMillisecondsGenerator() - 1), // Can update
    new Date(new Date().getTime() + 60 * 60 * 1000) // Cannot update
  ];
  const expectedOutputGenerator = (
    shownCategoryMessagePot: pot.Pot<{ previous?: string }, unknown>,
    previousPageMessageId: string | undefined,
    dateIndex: number,
    archivingStatus: string,
    otherCategoryMessagePot: pot.Pot<unknown, unknown>,
    shownCategory: string
  ) => {
    const shownCategoryMessageOption = pot.toOption(shownCategoryMessagePot);
    if (
      !previousPageMessageId ||
      dateIndex === 1 ||
      O.isNone(shownCategoryMessageOption) ||
      !shownCategoryMessageOption.value.previous ||
      archivingStatus === "processing" ||
      pot.isLoading(shownCategoryMessagePot) ||
      pot.isUpdating(shownCategoryMessagePot) ||
      pot.isLoading(otherCategoryMessagePot) ||
      pot.isUpdating(otherCategoryMessagePot)
    ) {
      return undefined;
    }
    return loadPreviousPageMessages.request({
      pageSize: maximumItemsFromAPI,
      cursor: previousPageMessageId,
      filter: {
        getArchived: shownCategory === "ARCHIVE"
      },
      fromUserAction: false
    });
  };
  // eslint-disable-next-line sonarjs/cognitive-complexity
  ["INBOX", "ARCHIVE"].forEach(shownCategory =>
    [undefined, "01J2C0Z8H1XFTNRHRJHB20QZHG"].forEach(previousPageMessageId =>
      generateMessagePots(previousPageMessageId).forEach(
        shownCategoryMessagePot =>
          generateMessagePots().forEach(otherCategoryMessagePot =>
            ["disabled", "enabled", "processing"].forEach(archivingStatus =>
              lastUpdateTimes.forEach((lastUpdateTime, dateIndex) => {
                const expectedOutput = expectedOutputGenerator(
                  shownCategoryMessagePot,
                  previousPageMessageId,
                  dateIndex,
                  archivingStatus,
                  otherCategoryMessagePot,
                  shownCategory
                );
                it(`should return '${
                  expectedOutput
                    ? "loadPreviousPageMessages.request"
                    : "undefined"
                }' for category '${shownCategory}' with pot '${
                  shownCategoryMessagePot.kind
                }' previous Id '${previousPageMessageId}' date that '${
                  dateIndex === 0 ? "allows" : "denies"
                }' update, while other category is '${
                  otherCategoryMessagePot.kind
                }' and archving status is '${archivingStatus}'`, () => {
                  const state = {
                    entities: {
                      messages: {
                        allPaginated: {
                          archive:
                            shownCategory === "ARCHIVE"
                              ? {
                                  data: shownCategoryMessagePot,
                                  lastRequest: O.none,
                                  lastUpdateTime
                                }
                              : {
                                  data: otherCategoryMessagePot,
                                  lastRequest: O.none,
                                  lastUpdateTime: new Date(0)
                                },
                          inbox:
                            shownCategory === "INBOX"
                              ? {
                                  data: shownCategoryMessagePot,
                                  lastRequest: O.none,
                                  lastUpdateTime
                                }
                              : {
                                  data: otherCategoryMessagePot,
                                  lastRequest: O.none,
                                  lastUpdateTime: new Date(0)
                                },
                          shownCategory
                        },
                        archiving: {
                          status: archivingStatus
                        }
                      }
                    },
                    features: {
                      loginFeatures: {
                        activeSessionLogin: {
                          ...activeSessionLoginIntialState,
                          refreshMessagesSection: true
                        }
                      }
                    }
                  } as GlobalState;
                  const loadPreviousPageMessagesAction =
                    getLoadPreviousPageMessagesActionIfAllowed(state);
                  expect(loadPreviousPageMessagesAction).toStrictEqual(
                    expectedOutput
                  );
                });
              })
            )
          )
      )
    )
  );
});

describe("archiveUnarchiveAccessibilityInstructions", () => {
  it("should return empty string when source is SEARCH and isSelected is undefined", () => {
    const result = archiveUnarchiveAccessibilityInstructions(
      "SEARCH",
      undefined
    );
    expect(result).toBe("");
  });

  it("should return empty string when source is SEARCH and isSelected is false", () => {
    const result = archiveUnarchiveAccessibilityInstructions("SEARCH", false);
    expect(result).toBe("");
  });

  it("should return empty string when source is SEARCH and isSelected is true", () => {
    const result = archiveUnarchiveAccessibilityInstructions("SEARCH", true);
    expect(result).toBe("");
  });

  it("should return deselect instructions when isSelected is true and source is INBOX", () => {
    const result = archiveUnarchiveAccessibilityInstructions("INBOX", true);
    expect(result).toBe("Tieni premuto per deselezionare");
  });

  it("should return deselect instructions when isSelected is true and source is ARCHIVE", () => {
    const result = archiveUnarchiveAccessibilityInstructions("ARCHIVE", true);
    expect(result).toBe("Tieni premuto per deselezionare");
  });

  it("should return archive instructions when source is INBOX and isSelected is false", () => {
    const result = archiveUnarchiveAccessibilityInstructions("INBOX", false);
    expect(result).toBe(
      "Tieni premuto per selezionare e in seguito archiviare"
    );
  });

  it("should return unarchive instructions when source is ARCHIVE and isSelected is false", () => {
    const result = archiveUnarchiveAccessibilityInstructions("ARCHIVE", false);
    expect(result).toBe(
      "Tieni premuto per selezionare e in seguito disarchiviare"
    );
  });

  it("should return archive instructions when source is INBOX and isSelected is undefined", () => {
    const result = archiveUnarchiveAccessibilityInstructions(
      "INBOX",
      undefined
    );
    expect(result).toBe(
      "Tieni premuto per selezionare e in seguito archiviare"
    );
  });

  it("should return unarchive instructions when source is ARCHIVE and isSelected is undefined", () => {
    const result = archiveUnarchiveAccessibilityInstructions(
      "ARCHIVE",
      undefined
    );
    expect(result).toBe(
      "Tieni premuto per selezionare e in seguito disarchiviare"
    );
  });
});
