import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { Zendesk } from "../../../../../../definitions/content/Zendesk";
import { ZendeskCategory } from "../../../../../../definitions/content/ZendeskCategory";
import { ZendeskSubCategory } from "../../../../../../definitions/content/ZendeskSubCategory";
import { applicationChangeState } from "../../../../../store/actions/application";
import { toIndexed } from "../../../../../store/helpers/indexer";
import { appReducer } from "../../../../../store/reducers";
import { getTimeoutError } from "../../../../../utils/errors";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../bonus/bpd/model/RemoteValue";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber,
  zendeskSelectedCategory,
  zendeskSelectedSubcategory,
  zendeskSupportStart
} from "../../actions";
import { ZendeskState } from "../index";

const INITIAL_STATE: ZendeskState = {
  zendeskConfig: remoteUndefined,
  ticketNumber: pot.none
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
  it("Initial state should contain zendeskConfig and ticketNumber as remoteUndefined", () => {
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
  it("selectedSubcategory should contain the category if zendeskSelectedSubcategory is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskSelectedSubcategory(mockSubcategory));
    expect(
      store.getState().assistanceTools.zendesk.selectedSubcategory
    ).toStrictEqual(mockSubcategory);
  });
  it("ticketNumber should be pot.noneLoading if zendeskRequestTicketNumber.request is dispatched and the state was pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskRequestTicketNumber.request());
    expect(store.getState().assistanceTools.zendesk.ticketNumber).toStrictEqual(
      pot.noneLoading
    );
  });
  it("ticketNumber should be pot.someLoading if zendeskRequestTicketNumber.request is dispatched and the state was pot.some", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, {
      ...globalState,
      assistanceTools: {
        ...globalState.assistanceTools,
        zendesk: {
          ...globalState.assistanceTools.zendesk,
          ticketNumber: pot.some(3)
        }
      }
    } as any);
    store.dispatch(zendeskRequestTicketNumber.request());
    expect(store.getState().assistanceTools.zendesk.ticketNumber).toStrictEqual(
      pot.someLoading(3)
    );
  });
  it("ticketNumber should be pot.someError if zendeskRequestTicketNumber.failure is dispatched and the state was pot.some", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, {
      ...globalState,
      assistanceTools: {
        ...globalState.assistanceTools,
        zendesk: {
          ...globalState.assistanceTools.zendesk,
          ticketNumber: pot.some(3)
        }
      }
    } as any);
    store.dispatch(zendeskRequestTicketNumber.failure(genericError));
    expect(store.getState().assistanceTools.zendesk.ticketNumber).toStrictEqual(
      pot.someError(3, genericError)
    );
  });
  it("ticketNumber should be pot.noneError if zendeskRequestTicketNumber.failure is dispatched and the state was pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskRequestTicketNumber.failure(genericError));
    expect(store.getState().assistanceTools.zendesk.ticketNumber).toStrictEqual(
      pot.noneError(genericError)
    );
  });
  it("ticketNumber should be pot.some if zendeskRequestTicketNumber.success", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskRequestTicketNumber.success(3));
    expect(store.getState().assistanceTools.zendesk.ticketNumber).toStrictEqual(
      pot.some(3)
    );
  });
  it("zendeskConfig should be remoteUndefined, selectedCategory and selectedSubcategory undefined if zendeskSupportStart is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(zendeskSelectedCategory(mockCategory));
    store.dispatch(
      zendeskSupportStart({
        assistanceForPayment: false,
        assistanceForCard: false,
        startingRoute: "n/a"
      })
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
