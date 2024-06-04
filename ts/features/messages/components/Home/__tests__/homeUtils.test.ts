import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActionType } from "typesafe-actions";
import { GlobalState } from "../../../../../store/reducers/types";
import { MessageListCategory } from "../../../types/messageListCategory";
import {
  MessagePage,
  MessagePagePot
} from "../../../store/reducers/allPaginated";
import {
  accessibilityLabelForMessageItem,
  getInitialReloadAllMessagesActionIfNeeded,
  getLoadServiceDetailsActionIfNeeded,
  getMessagesViewPagerInitialPageIndex,
  messageListCategoryToViewPageIndex,
  messageListItemHeight,
  messageViewPageIndexToListCategory
} from "../homeUtils";
import { pageSize } from "../../../../../config";
import { Action } from "../../../../../store/actions/types";
import { reloadAllMessages } from "../../../store/actions";
import { UIMessage } from "../../../types";
import { format } from "../../../../../utils/dates";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";

const createGlobalState = (
  archiveData: MessagePagePot,
  inboxData: MessagePagePot,
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
      pot.some({} as MessagePage),
      pot.none,
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    checkReturnedAction(reloadAllMessagesRequest);
  });
  it("should return undefined when showing inbox with pot.noneLoading inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.noneLoading,
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.noneUpdating inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.noneUpdating({} as MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.noneError inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.noneError(""),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.some inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.some({} as MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someLoading inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.someLoading({} as MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someUpdating inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.someUpdating({} as MessagePage, {} as MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someError inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.someError({} as MessagePage, ""),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });

  it("should return reloadAllMessages.request when showing archive with pot.none archive", () => {
    const globalState = createGlobalState(
      pot.none,
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    checkReturnedAction(reloadAllMessagesRequest, true);
  });
  it("should return undefined when showing archive with pot.noneLoading archive", () => {
    const globalState = createGlobalState(
      pot.noneLoading,
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.noneUpdating archive", () => {
    const globalState = createGlobalState(
      pot.noneUpdating({} as MessagePage),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.noneError archive", () => {
    const globalState = createGlobalState(
      pot.noneError(""),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.some archive", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someLoading archive", () => {
    const globalState = createGlobalState(
      pot.someLoading({} as MessagePage),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someUpdating archive", () => {
    const globalState = createGlobalState(
      pot.someUpdating({} as MessagePage, {} as MessagePage),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someError archive", () => {
    const globalState = createGlobalState(
      pot.someError({} as MessagePage, ""),
      pot.some({} as MessagePage),
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.none
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.noneLoading
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.someLoading({})
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
      entities: {
        services: {
          byId: {}
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.none
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.noneUpdating({})
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.noneError(new Error())
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.some({})
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.someUpdating({}, {})
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
      entities: {
        services: {
          byId: {
            [serviceId]: pot.someError({}, new Error())
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
