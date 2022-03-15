import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../bonus/bpd/model/RemoteValue";
import { ZendeskState } from "../index";
import {
  getZendeskConfig,
  zendeskGetTotalNewResponses,
  zendeskRequestTicketNumber,
  zendeskSelectedCategory,
  zendeskSelectedSubcategory,
  zendeskSupportStart
} from "../../actions";
import { ZendeskCategory } from "../../../../../../definitions/content/ZendeskCategory";
import { getTimeoutError } from "../../../../../utils/errors";
import { Zendesk } from "../../../../../../definitions/content/Zendesk";
import { toIndexed } from "../../../../../store/helpers/indexer";
import { ZendeskSubCategory } from "../../../../../../definitions/content/ZendeskSubCategory";

const INITIAL_STATE: ZendeskState = {
  zendeskConfig: remoteUndefined,
  ticketNumber: remoteUndefined,
  totalNewResponses: remoteUndefined
};

const mockCategory: ZendeskCategory = {
  value: "mock_value",
  description: {
    "it-IT": "mock_description",
    "en-EN": "mock_description"
  }
};
const mockSubcategory: ZendeskSubCategory = {
  value: "mock_value",
  description: {
    "it-IT": "mock_description",
    "en-EN": "mock_description"
  }
};

const mockZendeskConfig: Zendesk = {
  panicMode: false
};
const mockZendeskConfigWithCategories: Zendesk = {
  panicMode: false,
  zendeskCategories: {
    id: "12323",
    categories: [mockCategory]
  }
};

const genericError = new Error("generic error");
const networkError = getTimeoutError();

describe("Zendesk reducer", () => {
  it("Initial state should contain zendeskConfig, ticketNumber and totalNewResponses as remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.assistanceTools.zendesk).toStrictEqual(INITIAL_STATE);
  });
  it("selectedCategory should contain the category if zendeskSelectedCategory is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskSelectedCategory(mockCategory));
    expect(
      store.getState().assistanceTools.zendesk.selectedCategory
    ).toStrictEqual(mockCategory);
  });
  it("selectedSubcategory should contain the subcategory if zendeskSelectedSubcategory is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskSelectedSubcategory(mockSubcategory));
    expect(
      store.getState().assistanceTools.zendesk.selectedSubcategory
    ).toStrictEqual(mockSubcategory);
  });
  it("ticketNumber should be remoteLoading if zendeskRequestTicketNumber.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskRequestTicketNumber.request());
    expect(store.getState().assistanceTools.zendesk.ticketNumber).toStrictEqual(
      remoteLoading
    );
  });
  it("ticketNumber should be remoteError if zendeskRequestTicketNumber.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskRequestTicketNumber.failure(genericError));
    expect(store.getState().assistanceTools.zendesk.ticketNumber).toStrictEqual(
      remoteError(genericError)
    );
  });
  it("ticketNumber should be remoteReady if zendeskRequestTicketNumber.success is dispatched", () => {
    const mockTicketNumber = 1;
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskRequestTicketNumber.success(mockTicketNumber));
    expect(store.getState().assistanceTools.zendesk.ticketNumber).toStrictEqual(
      remoteReady(mockTicketNumber)
    );
  });
  it("totalNewResponses should be remoteLoading if zendeskGetTotalNewResponses.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskGetTotalNewResponses.request());
    expect(
      store.getState().assistanceTools.zendesk.totalNewResponses
    ).toStrictEqual(remoteLoading);
  });
  it("totalNewResponses should be remoteError if zendeskGetTotalNewResponses.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskGetTotalNewResponses.failure(genericError));
    expect(
      store.getState().assistanceTools.zendesk.totalNewResponses
    ).toStrictEqual(remoteError(genericError));
  });
  it("ticketNumber should be remoteReady if zendeskGetTotalNewResponses.success is dispatched", () => {
    const mockTotalNewResponses = 1;
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskGetTotalNewResponses.success(mockTotalNewResponses));
    expect(
      store.getState().assistanceTools.zendesk.totalNewResponses
    ).toStrictEqual(remoteReady(mockTotalNewResponses));
  });
  it("zendeskConfig should be remoteUndefined, selectedCategory and selectedSubcategory undefined if zendeskSupportStart is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskSelectedCategory(mockCategory));
    store.dispatch(
      zendeskSupportStart({ assistanceForPayment: false, startingRoute: "n/a" })
    );
    expect(
      store.getState().assistanceTools.zendesk.zendeskConfig
    ).toStrictEqual(remoteUndefined);
    expect(
      store.getState().assistanceTools.zendesk.selectedCategory
    ).toStrictEqual(undefined);
    expect(
      store.getState().assistanceTools.zendesk.selectedSubcategory
    ).toStrictEqual(undefined);
  });
  it("zendeskConfig should be remoteLoading if getZendeskConfig.loading is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(getZendeskConfig.request());
    expect(
      store.getState().assistanceTools.zendesk.zendeskConfig
    ).toStrictEqual(remoteLoading);
  });
  it("zendeskConfig should be remoteError if getZendeskConfig.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(getZendeskConfig.failure(networkError));
    expect(
      store.getState().assistanceTools.zendesk.zendeskConfig
    ).toStrictEqual(remoteError(networkError));
  });
  it("zendeskConfig should be remoteReady if getZendeskConfig.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(getZendeskConfig.success(mockZendeskConfig));
    expect(
      store.getState().assistanceTools.zendesk.zendeskConfig
    ).toStrictEqual(
      remoteReady({ ...mockZendeskConfig, zendeskCategories: undefined })
    );
    store.dispatch(getZendeskConfig.success(mockZendeskConfigWithCategories));
    expect(
      store.getState().assistanceTools.zendesk.zendeskConfig
    ).toStrictEqual(
      remoteReady({
        ...mockZendeskConfigWithCategories,
        zendeskCategories: {
          id: mockZendeskConfigWithCategories.zendeskCategories?.id,
          categories: toIndexed(
            mockZendeskConfigWithCategories.zendeskCategories?.categories ?? [],
            c => c.value
          )
        }
      })
    );
  });
});
