import { fireEvent, RenderAPI } from "@testing-library/react-native";
import * as React from "react";
import { NavigationParams } from "react-navigation";
import { Action, createStore, Store } from "redux";
import configureMockStore from "redux-mock-store";
import {
  PaymentInstrument,
  PaymentNetworkEnum,
  ProductTypeEnum,
  ValidityStatusEnum
} from "../../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import {
  ExecutionStatusEnum,
  SearchRequestMetadata
} from "../../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import I18n from "../../../../../../../i18n";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { getTimeoutError } from "../../../../../../../utils/errors";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../../navigation/routes";
import {
  PrivativeResponse,
  searchUserPrivative,
  walletAddPrivativeChooseIssuer,
  walletAddPrivativeFailure,
  walletAddPrivativeInsertCardNumber,
  walletAddPrivativeStart
} from "../../../store/actions";
import { PrivativeIssuerId } from "../../../store/reducers/searchedPrivative";
import SearchPrivativeCardScreen from "../SearchPrivativeCardScreen";

const cardTestId = "9876";
const timeoutError = getTimeoutError();

const noCardResponse: PrivativeResponse = {
  paymentInstrument: null,
  searchRequestId: "aSearchRequestId",
  searchRequestMetadata: []
};
const paymentInstrument: PaymentInstrument = {
  validityStatus: ValidityStatusEnum.VALID,
  paymentNetwork: PaymentNetworkEnum.MAESTRO,
  expiringDate: new Date("2025-11-09"),
  abiCode: cardTestId,
  productType: ProductTypeEnum.CREDIT,
  hpan: "hpan",
  panCode: "panCode",
  panPartialNumber: "panPartialNumber",
  tokenMac: "tokenMac"
};

const oneCardResponse: PrivativeResponse = {
  paymentInstrument,
  searchRequestId: "aSearchRequestId",
  searchRequestMetadata: []
};

const searchRequestMetaOK: SearchRequestMetadata = {
  executionStatus: ExecutionStatusEnum.OK,
  retrievedInstrumentsCount: 0,
  serviceProviderName: "ServiceNameHere"
};

const searchRequestMetaKO: SearchRequestMetadata = {
  executionStatus: ExecutionStatusEnum.KO,
  retrievedInstrumentsCount: 0,
  serviceProviderName: "ServiceNameHere"
};

const searchRequestMetaPending: SearchRequestMetadata = {
  executionStatus: ExecutionStatusEnum.PENDING,
  retrievedInstrumentsCount: 0,
  serviceProviderName: "ServiceNameHere"
};
const withSearchRequestMetadata =
  (metadataList: ReadonlyArray<SearchRequestMetadata>) =>
  (response: PrivativeResponse) => ({
    ...response,
    searchRequestMetadata: [...metadataList]
  });
describe("SearchPrivativeCardScreen", () => {
  jest.useFakeTimers();
  it("if privativeQuery is undefined a failure action is dispatched and a toast is shown", () => {
    const mockStore = configureMockStore<GlobalState>();
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = mockStore(globalState);
    renderSearchPrivativeCardScreen(store);

    expect(store.getActions()).toEqual([
      walletAddPrivativeFailure(
        "privativeSelected is undefined in SearchPrivativeCardScreen"
      )
    ]);
  });
  it("With timeout error should render PrivativeKoTimeout and pressing on retry should request a reload", () => {
    const { store, testComponent } = getSearchPrivativeCardScreen();

    expect(isLoadingScreen(testComponent)).toBe(true);

    store.dispatch(searchUserPrivative.failure(timeoutError));
    expect(isPrivativeKoTimeoutScreen(testComponent)).toBe(true);

    const retryButton = testComponent.queryByText(
      I18n.t("global.buttons.retry")
    );
    expect(retryButton).toBeTruthy();

    if (retryButton !== null) {
      fireEvent.press(retryButton);
      expect(isLoadingScreen(testComponent)).toBe(true);
    }
  });
  it("With no card found, single abi, should render PrivativeKoNotFound", () => {
    const { store, testComponent } = getSearchPrivativeCardScreen();
    store.dispatch(searchUserPrivative.success(noCardResponse));
    expect(isPrivativeKoNotFoundScreen(testComponent)).toBe(true);
  });

  describe("Search request metadata error behaviour", () => {
    it(`With at least one error in search metadata request, , should render CoBadgeKoServiceError`, () => {
      const { store, testComponent } = getSearchPrivativeCardScreen();
      store.dispatch(
        searchUserPrivative.success(
          withSearchRequestMetadata([searchRequestMetaKO])(noCardResponse)
        )
      );
      expect(isPrivativeKoServiceErrorScreen(testComponent)).toBe(true);
      store.dispatch(
        searchUserPrivative.success(
          withSearchRequestMetadata([searchRequestMetaPending])(noCardResponse)
        )
      );
      expect(isPrivativeKoTimeoutScreen(testComponent)).toBe(true);
      store.dispatch(
        searchUserPrivative.success(
          withSearchRequestMetadata([searchRequestMetaOK, searchRequestMetaKO])(
            noCardResponse
          )
        )
      );
      expect(isPrivativeKoServiceErrorScreen(testComponent)).toBe(true);
    });
  });
  describe("Payment methods found", () => {
    it(`With at least one payment method found and all search metadata request ok, should render AddCoBadgeScreen`, () => {
      const { store, testComponent } = getSearchPrivativeCardScreen();
      store.dispatch(
        searchUserPrivative.success(
          withSearchRequestMetadata([searchRequestMetaOK])(oneCardResponse)
        )
      );
      expect(isAddPrivativeScreen(testComponent)).toBe(true);
    });
  });
});

const getSearchPrivativeCardScreen = () => {
  const anIssuerId = "1" as PrivativeIssuerId;
  const aCardNumber = "123456789";
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  store.dispatch(walletAddPrivativeStart());
  store.dispatch(walletAddPrivativeChooseIssuer(anIssuerId));
  store.dispatch(walletAddPrivativeInsertCardNumber(aCardNumber));
  const testComponent = renderSearchPrivativeCardScreen(store);
  return { store, testComponent };
};

const renderSearchPrivativeCardScreen = (store: Store<GlobalState, Action>) =>
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <SearchPrivativeCardScreen />,
    WALLET_ONBOARDING_PRIVATIVE_ROUTES.SEARCH_AVAILABLE,
    {},
    store
  );

const isLoadingScreen = (component: RenderAPI) =>
  component.queryByTestId("LoadPrivativeSearch") !== null;

const isPrivativeKoTimeoutScreen = (component: RenderAPI) =>
  component.queryByTestId("PrivativeKoTimeout") !== null &&
  component.queryByText(
    I18n.t("wallet.onboarding.privative.search.koTimeout.body")
  ) !== null;

const isPrivativeKoNotFoundScreen = (component: RenderAPI) =>
  component.queryByTestId("PrivativeKoNotFound") !== null &&
  component.queryByText(
    I18n.t("wallet.onboarding.privative.search.koNotFound.body")
  ) !== null;

const isPrivativeKoServiceErrorScreen = (component: RenderAPI) =>
  component.queryByTestId("PrivativeKoServiceError") !== null &&
  component.queryByText(
    I18n.t("wallet.onboarding.privative.search.koServiceError.body")
  ) !== null;

const isAddPrivativeScreen = (component: RenderAPI) =>
  component.queryByTestId("AddPrivativeComponent") !== null;
