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
  getLoadServiceDetailsActionIfNeeded,
  getMessagesViewPagerInitialPageIndex,
  getReloadAllMessagesActionForRefreshIfAllowed,
  messageListCategoryToViewPageIndex,
  messageListItemHeight,
  messageViewPageIndexToListCategory
} from "../homeUtils";
import { pageSize } from "../../../../../config";
import { Action } from "../../../../../store/actions/types";
import {
  loadNextPageMessages,
  reloadAllMessages
} from "../../../store/actions";
import { UIMessage } from "../../../types";
import { format } from "../../../../../utils/dates";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";
import {
  isLoadingOrUpdating,
  isSomeOrSomeError,
  isStrictSome,
  isStrictSomeError
} from "../../../../../utils/pot";

const createGlobalState = (
  archiveData: allPaginated.MessagePagePot,
  inboxData: allPaginated.MessagePagePot,
  shownCategory: MessageListCategory
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
  it("should return reloadAllMessages.request when showing inbox with pot.none inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.none,
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    checkReturnedAction(reloadAllMessagesRequest);
  });
  it("should return undefined when showing inbox with pot.noneLoading inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.noneLoading,
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.noneUpdating inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.noneUpdating({} as allPaginated.MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.noneError inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.noneError(""),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.some inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.some({} as allPaginated.MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someLoading inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.someLoading({} as allPaginated.MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someUpdating inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.someUpdating(
        {} as allPaginated.MessagePage,
        {} as allPaginated.MessagePage
      ),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someError inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.someError({} as allPaginated.MessagePage, ""),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });

  it("should return reloadAllMessages.request when showing archive with pot.none archive", () => {
    const globalState = createGlobalState(
      pot.none,
      pot.some({} as allPaginated.MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    checkReturnedAction(reloadAllMessagesRequest, true);
  });
  it("should return undefined when showing archive with pot.noneLoading archive", () => {
    const globalState = createGlobalState(
      pot.noneLoading,
      pot.some({} as allPaginated.MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.noneUpdating archive", () => {
    const globalState = createGlobalState(
      pot.noneUpdating({} as allPaginated.MessagePage),
      pot.some({} as allPaginated.MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.noneError archive", () => {
    const globalState = createGlobalState(
      pot.noneError(""),
      pot.some({} as allPaginated.MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.some archive", () => {
    const globalState = createGlobalState(
      pot.some({} as allPaginated.MessagePage),
      pot.some({} as allPaginated.MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someLoading archive", () => {
    const globalState = createGlobalState(
      pot.someLoading({} as allPaginated.MessagePage),
      pot.some({} as allPaginated.MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someUpdating archive", () => {
    const globalState = createGlobalState(
      pot.someUpdating(
        {} as allPaginated.MessagePage,
        {} as allPaginated.MessagePage
      ),
      pot.some({} as allPaginated.MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someError archive", () => {
    const globalState = createGlobalState(
      pot.someError({} as allPaginated.MessagePage, ""),
      pot.some({} as allPaginated.MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
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
  it("should match expected string, unread message, received more than one day ago", () => {
    const organizationName = "Organization Name";
    const serviceName = "Service Name";
    const title = "Message Title";
    const createdAt = new Date(1990, 0, 2, 1, 1, 1);
    const expectedOutput = `Unread message, received by ${organizationName}, ${serviceName}. ${title}. \n    received on ${format(
      createdAt,
      "MMMM Do YYYY"
    )}\n  . `;
    const message = {
      createdAt,
      serviceName,
      organizationName,
      title,
      isRead: false
    } as UIMessage;
    const accessibilityLabel = accessibilityLabelForMessageItem(message);
    expect(accessibilityLabel).toStrictEqual(expectedOutput);
  });
  it("should match expected string, unread message, received less than one day ago", () => {
    const organizationName = "Organization Name";
    const serviceName = "Service Name";
    const title = "Message Title";
    const createdAt = new Date();
    createdAt.setTime(createdAt.getTime() - 60 * 60 * 1000);
    const expectedOutput = `Unread message, received by ${organizationName}, ${serviceName}. ${title}. received at ${format(
      createdAt,
      "H:mm"
    )}. `;
    const message = {
      createdAt,
      serviceName,
      organizationName,
      title,
      isRead: false
    } as UIMessage;
    const accessibilityLabel = accessibilityLabelForMessageItem(message);
    expect(accessibilityLabel).toStrictEqual(expectedOutput);
  });
  it("should match expected string, read message, received more than one day ago", () => {
    const organizationName = "Organization Name";
    const serviceName = "Service Name";
    const title = "Message Title";
    const createdAt = new Date(1990, 0, 2, 1, 1, 1);
    const expectedOutput = `Message, received by ${organizationName}, ${serviceName}. ${title}. \n    received on ${format(
      createdAt,
      "MMMM Do YYYY"
    )}\n  . `;
    const message = {
      createdAt,
      serviceName,
      organizationName,
      title,
      isRead: true
    } as UIMessage;
    const accessibilityLabel = accessibilityLabelForMessageItem(message);
    expect(accessibilityLabel).toStrictEqual(expectedOutput);
  });
  it("should match expected string, read message, received less than one day ago", () => {
    const organizationName = "Organization Name";
    const serviceName = "Service Name";
    const title = "Message Title";
    const createdAt = new Date();
    createdAt.setTime(createdAt.getTime() - 60 * 60 * 1000);
    const expectedOutput = `Message, received by ${organizationName}, ${serviceName}. ${title}. received at ${format(
      createdAt,
      "H:mm"
    )}. `;
    const message = {
      createdAt,
      serviceName,
      organizationName,
      title,
      isRead: true
    } as UIMessage;
    const accessibilityLabel = accessibilityLabelForMessageItem(message);
    expect(accessibilityLabel).toStrictEqual(expectedOutput);
  });
});

describe("messageListItemHeight", () => {
  it("should return 130", () => {
    const height = messageListItemHeight();
    expect(height).toBe(130);
  });
});

describe("getLoadServiceDetailsActionIfNeeded", () => {
  it("should return undefined, defined organization fiscal code", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.none
            }
          }
        }
      }
    } as GlobalState;
    const organizationFiscalCode = "11359591002";
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      organizationFiscalCode
    );
    expect(loadServiceDetailRequestAction).toBeUndefined();
  });
  it("should return undefined, undefined organization fiscal code, service pot.noneLoading", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.noneLoading
            }
          }
        }
      }
    } as GlobalState;
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toBeUndefined();
  });
  it("should return undefined, undefined organization fiscal code, service pot.someLoading", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.someLoading({})
            }
          }
        }
      }
    } as GlobalState;
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toBeUndefined();
  });
  it("should return loadServiceDetail.request, undefined organization fiscal code, service unmatching", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {}
          }
        }
      }
    } as GlobalState;
    const expectedOutput = loadServiceDetail.request(serviceId);
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toStrictEqual(expectedOutput);
  });
  it("should return loadServiceDetail.request, undefined organization fiscal code, service pot.none", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.none
            }
          }
        }
      }
    } as GlobalState;
    const expectedOutput = loadServiceDetail.request(serviceId);
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toStrictEqual(expectedOutput);
  });
  it("should return loadServiceDetail.request, undefined organization fiscal code, service pot.noneUpdating", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.noneUpdating({})
            }
          }
        }
      }
    } as GlobalState;
    const expectedOutput = loadServiceDetail.request(serviceId);
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toStrictEqual(expectedOutput);
  });
  it("should return loadServiceDetail.request, undefined organization fiscal code, service pot.noneError", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.noneError(new Error())
            }
          }
        }
      }
    } as GlobalState;
    const expectedOutput = loadServiceDetail.request(serviceId);
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toStrictEqual(expectedOutput);
  });
  it("should return loadServiceDetail.request, undefined organization fiscal code, service pot.some", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.some({})
            }
          }
        }
      }
    } as GlobalState;
    const expectedOutput = loadServiceDetail.request(serviceId);
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toStrictEqual(expectedOutput);
  });
  it("should return loadServiceDetail.request, undefined organization fiscal code, service pot.someUpdating", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.someUpdating({}, {})
            }
          }
        }
      }
    } as GlobalState;
    const expectedOutput = loadServiceDetail.request(serviceId);
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toStrictEqual(expectedOutput);
  });
  it("should return loadServiceDetail.request, undefined organization fiscal code, service pot.someError", () => {
    const serviceId = "01HYE2HRFESQ9TN5E1WZ99AW8Z" as ServiceId;
    const globalState = {
      features: {
        services: {
          details: {
            byId: {
              [serviceId]: pot.someError({}, new Error())
            }
          }
        }
      }
    } as GlobalState;
    const expectedOutput = loadServiceDetail.request(serviceId);
    const loadServiceDetailRequestAction = getLoadServiceDetailsActionIfNeeded(
      globalState,
      serviceId,
      undefined
    );
    expect(loadServiceDetailRequestAction).toStrictEqual(expectedOutput);
  });
});

describe("getLoadNextPageMessagesActionIfNeeded", () => {
  const nextValues = [undefined, "01J0KB1T5XVKHERASERQ01CG4J"];
  const generatePots = (nextValue?: string) => [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating({ page: [], next: nextValue }),
    pot.noneError(""),
    pot.some({ page: [], next: nextValue }),
    pot.someLoading({ page: [], next: nextValue }),
    pot.someUpdating(
      { page: [], next: nextValue },
      { page: [], next: nextValue }
    ),
    pot.someError({ page: [], next: nextValue }, "")
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
    messageListDistanceFromBottom: number
  ) => {
    // This method is the human-unreadable logic of the `getLoadNextPageMessagesActionIfAllowed` method
    // Check that one instead to filter out the case where the loadNextPageMessages.request action is returned.
    const allPaginated = state.entities.messages.allPaginated;
    const selectedCollection =
      category === "ARCHIVE" ? allPaginated.archive : allPaginated.inbox;
    const oppositeCollection =
      category === "ARCHIVE" ? allPaginated.inbox : allPaginated.archive;
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
            messageListDistanceFromBottom > 0)));
    return canLoadNextMessages
      ? loadNextPageMessages.request({
          pageSize,
          cursor: selectedCollectionNextValue,
          filter: { getArchived: category === "ARCHIVE" }
        })
      : undefined;
  };
  // eslint-disable-next-line sonarjs/cognitive-complexity
  nextValues.forEach(inboxNextValue =>
    generatePots(inboxNextValue).forEach(inboxData =>
      lastRequestValues.forEach(inboxLastRequestValue =>
        nextValues.forEach(archiveNextValue =>
          generatePots(archiveNextValue).forEach(archiveData =>
            lastRequestValues.forEach(archiveLastRequestValue => {
              const state = {
                entities: {
                  messages: {
                    allPaginated: {
                      inbox: {
                        data: inboxData,
                        lastRequest: inboxLastRequestValue
                      },
                      archive: {
                        data: archiveData,
                        lastRequest: archiveLastRequestValue
                      }
                    }
                  }
                }
              } as GlobalState;
              categories.forEach(category =>
                [0, 1].forEach(messageListDistance => {
                  const expectedOutput =
                    computeExpectedLoadNextPageMessagesValue(
                      state,
                      category,
                      messageListDistance
                    );
                  // eslint-disable-next-line no-underscore-dangle
                  it(`Should return '${
                    expectedOutput
                      ? "loadNextPageMessages.request"
                      : "undefined"
                  }' for '${category}' with state '${
                    category === "ARCHIVE" ? archiveData.kind : inboxData.kind
                  }' where next page index is '${
                    category === "ARCHIVE" ? archiveNextValue : inboxNextValue
                  }' and lastRequest value is '${
                    category === "ARCHIVE"
                      ? O.isSome(archiveLastRequestValue)
                        ? archiveLastRequestValue.value
                        : "None"
                      : O.isSome(inboxLastRequestValue)
                      ? inboxLastRequestValue.value
                      : "None"
                  }' (messageListDistance is ${messageListDistance}), opposite category state '${
                    category === "ARCHIVE" ? inboxData.kind : archiveData.kind
                  }' (opposite 'lastRequest' and 'next page index' values not logged for concision)`, () => {
                    const loadNextPageMessageAction =
                      getLoadNextPageMessagesActionIfAllowed(
                        state,
                        category,
                        messageListDistance
                      );
                    expect(loadNextPageMessageAction).toStrictEqual(
                      expectedOutput
                    );
                  });
                })
              );
            })
          )
        )
      )
    )
  );
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
                filter: { getArchived: category === "ARCHIVE" }
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
                }
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
