import { NavigationParams } from "react-navigation";
import * as React from "react";
import { Action, createStore, Store } from "redux";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { appReducer } from "../../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import AddPrivativeCardScreen from "../AddPrivativeCardScreen";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../../navigation/routes";
import {
  ExecutionStatusEnum,
  SearchRequestMetadata
} from "../../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import {
  PaymentInstrument,
  PaymentNetworkEnum,
  ProductTypeEnum,
  ValidityStatusEnum
} from "../../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import I18n from "../../../../../../../i18n";
import { getGenericError } from "../../../../../../../utils/errors";
import {
  addPrivativeToWallet,
  PrivativeResponse,
  searchUserPrivative,
  walletAddPrivativeStart
} from "../../../store/actions";

const genericError = getGenericError(new Error("Generic Error"));
const cardTestId = "9876";

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

const withSearchRequestMetadata =
  (metadataList: ReadonlyArray<SearchRequestMetadata>) =>
  (response: PrivativeResponse) => ({
    ...response,
    searchRequestMetadata: [...metadataList]
  });

describe("Test AddPrivativeCardScreen", () => {
  jest.useFakeTimers();
  it("if addingResult is undefined should show the AddPrivativeCardComponent", () => {
    const { testComponent } = getAddPrivativeCardScreen();
    expect(isAddPrivativeScreen(testComponent)).toBe(true);
  });
  it("if addingResult is loading should show the loadAddPrivativeCard", () => {
    const { testComponent } = getAddPrivativeCardScreen();

    const addCardToWalletButton = testComponent.queryByText(
      I18n.t("global.buttons.add")
    );
    expect(addCardToWalletButton).toBeTruthy();

    if (addCardToWalletButton !== null) {
      fireEvent.press(addCardToWalletButton);
      expect(isLoadingScreen(testComponent)).toBe(true);
    }
  });
  it("if addingResult is error should show the loadAddPrivativeCard", () => {
    const { store, testComponent } = getAddPrivativeCardScreen();

    const addCardToWalletButton = testComponent.queryByText(
      I18n.t("global.buttons.add")
    );
    expect(addCardToWalletButton).toBeTruthy();

    if (addCardToWalletButton !== null) {
      fireEvent.press(addCardToWalletButton);

      store.dispatch(addPrivativeToWallet.failure(genericError));
      expect(isLoadingScreen(testComponent)).toBe(true);
    }
  });
});

const getAddPrivativeCardScreen = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  store.dispatch(walletAddPrivativeStart());
  store.dispatch(
    searchUserPrivative.success(
      withSearchRequestMetadata([searchRequestMetaOK])(oneCardResponse)
    )
  );
  const testComponent = renderAddPrivativeCardScreen(store);
  return { store, testComponent };
};

const renderAddPrivativeCardScreen = (store: Store<GlobalState, Action>) =>
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <AddPrivativeCardScreen />,
    WALLET_ONBOARDING_PRIVATIVE_ROUTES.ADD_PRIVATIVE,
    {},
    store
  );

const isLoadingScreen = (component: RenderAPI) =>
  component.queryByTestId("loadErrorAddPrivativeCard") !== null;

const isAddPrivativeScreen = (component: RenderAPI) =>
  component.queryByTestId("AddPrivativeComponent") !== null;
