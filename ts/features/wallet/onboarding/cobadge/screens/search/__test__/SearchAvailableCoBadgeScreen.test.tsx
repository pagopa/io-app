import { fireEvent, RenderAPI } from "@testing-library/react-native";
import * as React from "react";
import { NavigationParams } from "react-navigation";
import { Action, createStore, Store } from "redux";
import { CobadgeResponse } from "../../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import {
  ExecutionStatusEnum,
  SearchRequestMetadata
} from "../../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import I18n from "../../../../../../../i18n";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import {
  getGenericError,
  getTimeoutError
} from "../../../../../../../utils/errors";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../../../navigation/routes";
import {
  searchUserCoBadge,
  walletAddCoBadgeStart
} from "../../../store/actions";
import SearchAvailableCoBadgeScreen from "../SearchAvailableCoBadgeScreen";

const abiTestId = "9876";
const timeoutError = getTimeoutError();
const genericError = getGenericError(new Error("Generic Error"));
const malformedData: CobadgeResponse = {};
const noCardResponse: CobadgeResponse = {
  payload: { paymentInstruments: [], searchRequestMetadata: [] }
};

const searchRequestMetaPending: SearchRequestMetadata = {
  executionStatus: ExecutionStatusEnum.PENDING,
  retrievedInstrumentsCount: 0,
  serviceProviderName: "ServiceNameHere"
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

const withSearchRequestMetadata = (
  metadataList: ReadonlyArray<SearchRequestMetadata>
) => (response: CobadgeResponse) => ({
  ...response,
  payload: { ...response.payload, searchRequestMetadata: [...metadataList] }
});

describe("Test behaviour of the SearchAvailableCoBadgeScreen", () => {
  jest.useFakeTimers();
  it("With default state and searchUserCobadge.request should render LoadCoBadgeSearch", () => {
    const { store, testComponent } = getSearchAvailableCoBadgeScreen();
    expect(isLoadingScreen(testComponent)).toBe(true);
    store.dispatch(searchUserCoBadge.request(undefined));
    expect(isLoadingScreen(testComponent)).toBe(true);
    store.dispatch(searchUserCoBadge.request(abiTestId));
    expect(isLoadingScreen(testComponent)).toBe(true);
  });
  it("With timeout error should render CoBadgeKoTimeout and pressing on retry should request a reload", () => {
    const { store, testComponent } = getSearchAvailableCoBadgeScreen();
    store.dispatch(searchUserCoBadge.request(undefined));
    store.dispatch(searchUserCoBadge.failure(timeoutError));
    expect(isTimeoutScreen(testComponent)).toBe(true);

    const retryButton = testComponent.queryByText(
      I18n.t("global.buttons.retry")
    );
    expect(retryButton).toBeTruthy();

    if (retryButton !== null) {
      fireEvent.press(retryButton);
      expect(isLoadingScreen(testComponent)).toBe(true);
    }
  });
  it("With generic error should render LoadCoBadgeSearch with error state", () => {
    const { store, testComponent } = getSearchAvailableCoBadgeScreen();
    store.dispatch(searchUserCoBadge.request(undefined));
    store.dispatch(searchUserCoBadge.failure(genericError));
    expect(isLoadingScreen(testComponent)).toBe(true);
    expect(
      testComponent.queryByTestId("LoadingErrorComponentError")
    ).toBeTruthy();
  });
  it("With malformed data should render CoBadgeKoTimeout", () => {
    const { store, testComponent } = getSearchAvailableCoBadgeScreen();
    store.dispatch(searchUserCoBadge.request(undefined));
    store.dispatch(searchUserCoBadge.success(malformedData));
    expect(isTimeoutScreen(testComponent)).toBe(true);
  });
  it("With no card found, single abi, should render CoBadgeKoSingleBankNotFound", () => {
    const { store, testComponent } = getSearchAvailableCoBadgeScreen();
    store.dispatch(searchUserCoBadge.request(abiTestId));
    store.dispatch(searchUserCoBadge.success(noCardResponse));
    expect(isCoBadgeKoSingleBankNotFoundScreen(testComponent)).toBe(true);

    const searchAllBankButton = testComponent.queryByText(
      I18n.t("global.buttons.continue")
    );
    expect(searchAllBankButton).toBeTruthy();

    if (searchAllBankButton !== null) {
      fireEvent.press(searchAllBankButton);
      // After press the continue button, start the search for all abi
      expect(isLoadingScreen(testComponent)).toBe(true);
      // Simulate the response with no card
      store.dispatch(searchUserCoBadge.success(noCardResponse));
      // The user will see the Ko screen not found for all abi search
      expect(isCoBadgeKoNotFoundScreen(testComponent)).toBe(true);
    }
  });
  it("With no card found, all abi, should render CoBadgeKoNotFound", () => {
    const { store, testComponent } = getSearchAvailableCoBadgeScreen();
    store.dispatch(searchUserCoBadge.request(undefined));
    store.dispatch(searchUserCoBadge.success(noCardResponse));
    expect(isCoBadgeKoNotFoundScreen(testComponent)).toBe(true);
  });
  it("With at least one pending request, single abi, should render CoBadgeKoTimeout", () => {
    const { store, testComponent } = getSearchAvailableCoBadgeScreen();
    store.dispatch(searchUserCoBadge.request(abiTestId));
    store.dispatch(
      searchUserCoBadge.success(
        withSearchRequestMetadata([searchRequestMetaPending])(noCardResponse)
      )
    );
    expect(isTimeoutScreen(testComponent)).toBe(true);
    store.dispatch(
      searchUserCoBadge.success(
        withSearchRequestMetadata([
          searchRequestMetaPending,
          searchRequestMetaOK
        ])(noCardResponse)
      )
    );
    expect(isTimeoutScreen(testComponent)).toBe(true);
    store.dispatch(
      searchUserCoBadge.success(
        withSearchRequestMetadata([
          searchRequestMetaPending,
          searchRequestMetaKO
        ])(noCardResponse)
      )
    );
    expect(isTimeoutScreen(testComponent)).toBe(false);
  });
  it("With at least one pending request, all abi, should render CoBadgeKoTimeout", () => {
    const { store, testComponent } = getSearchAvailableCoBadgeScreen();
    store.dispatch(searchUserCoBadge.request(undefined));
    store.dispatch(
      searchUserCoBadge.success(
        withSearchRequestMetadata([searchRequestMetaPending])(noCardResponse)
      )
    );
    expect(isTimeoutScreen(testComponent)).toBe(true);
    store.dispatch(
      searchUserCoBadge.success(
        withSearchRequestMetadata([
          searchRequestMetaPending,
          searchRequestMetaOK
        ])(noCardResponse)
      )
    );
    expect(isTimeoutScreen(testComponent)).toBe(true);
    store.dispatch(
      searchUserCoBadge.success(
        withSearchRequestMetadata([
          searchRequestMetaPending,
          searchRequestMetaKO
        ])(noCardResponse)
      )
    );
    expect(isTimeoutScreen(testComponent)).toBe(false);
  });
});

const getSearchAvailableCoBadgeScreen = (abi?: string) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  store.dispatch(walletAddCoBadgeStart(abi));
  const testComponent = renderSearchAvailableCoBadgeScreen(store);
  return { store, testComponent };
};

const renderSearchAvailableCoBadgeScreen = (
  store: Store<GlobalState, Action>
) =>
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <SearchAvailableCoBadgeScreen />,
    WALLET_ONBOARDING_COBADGE_ROUTES.SEARCH_AVAILABLE,
    {},
    store
  );

const isLoadingScreen = (component: RenderAPI) =>
  component.queryByTestId("LoadCoBadgeSearch") !== null;

const isTimeoutScreen = (component: RenderAPI) =>
  component.queryByTestId("CoBadgeKoTimeout") !== null &&
  component.queryByText(
    I18n.t("wallet.onboarding.coBadge.search.koTimeout.body")
  ) !== null;

const isCoBadgeKoSingleBankNotFoundScreen = (component: RenderAPI) =>
  component.queryByTestId("CoBadgeKoSingleBankNotFound") !== null &&
  component.queryByText(
    I18n.t("wallet.onboarding.coBadge.search.koSingleBankNotFound.body")
  ) !== null;

const isCoBadgeKoNotFoundScreen = (component: RenderAPI) =>
  component.queryByTestId("CoBadgeKoNotFound") !== null &&
  component.queryByText(
    I18n.t("wallet.onboarding.coBadge.search.koNotFound.body")
  ) !== null;
