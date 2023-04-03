/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";

import { waitFor } from "@testing-library/react-native";
import { createStore, Store } from "redux";
import { StatusEnum } from "../../../../../../definitions/idpay/InitiativeDTO";
import { EnableableFunctionsEnum } from "../../../../../../definitions/pagopa/EnableableFunctions";
import { WalletTypeEnum } from "../../../../../../definitions/pagopa/WalletV2";
import { TypeEnum } from "../../../../../../definitions/pagopa/walletv2/CardInfo";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { fetchWalletsSuccess } from "../../../../../store/actions/wallet/wallets";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { walletsV2_1 } from "../../../../../store/reducers/wallet/__mocks__/wallets";
import {
  CreditCardPaymentMethod,
  PatchedWalletV2ListResponse
} from "../../../../../types/pagopa";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { convertWalletV2toWalletV1 } from "../../../../../utils/walletv2";
import CreditCardDetailScreen from "../CreditCardDetailScreen";

jest.mock("../../../../../store/hooks", () => ({
  ...(jest.requireActual("../../../../../store/hooks") as object),
  useIOSelector: jest.fn().mockReturnValue(false)
}));
const creditCard: CreditCardPaymentMethod = {
  walletType: WalletTypeEnum.Card,
  createDate: "2021-07-08",
  enableableFunctions: [
    EnableableFunctionsEnum.BPD,
    EnableableFunctionsEnum.pagoPA
  ],
  favourite: false,
  idWallet: 23216,
  info: {
    blurredNumber: "0001",
    brand: "Maestro",
    brandLogo:
      "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_maestro.png",
    expireMonth: "11",
    expireYear: "2021",
    hashPan:
      "d48a59cdfbe3da7e4fe25e28cbb47d5747720ecc6fc392c87f1636fe95db22f90004",
    holder: "Maria Rossi",
    htokenList: ["token1", "token2"],
    type: TypeEnum.CRD
  },
  onboardingChannel: "IO",
  pagoPA: true,
  updateDate: "2020-11-20",
  kind: "CreditCard",
  caption: "●●●●0001",
  icon: 37
};

jest.mock("../../../../../config", () => ({
  bpdEnabled: true
}));
const mockInitiative = {
  initiativeId: "idpay",
  initiativeName: "idpay",
  status: StatusEnum.REFUNDABLE
};
const initiativesFromInstrumentMock = jest
  .spyOn(
    require("../../../../idpay/wallet/store/reducers"),
    "idPayEnabledInitiativesFromInstrumentSelector"
  )
  .mockImplementation(() => [mockInitiative]);
const isIDPayEnabledMock = jest.spyOn(
  require("../../../../../store/reducers/backendStatus"),
  "isIdPayEnabledSelector"
);

describe("Test CreditCardDetailScreen", () => {
  jest.useFakeTimers();
  it("When navigate to the screen and no wallet are in the store, should render WorkunitGenericFailure", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const screen = renderDetailScreen(store, creditCard);
    expect(screen.getByTestId("WorkunitGenericFailure")).not.toBeNull();
  });
  it("does not render idpay initiatives when isIdpayEnabled is false, even if there are some ", async () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const paymentMethods = walletsV2_1 as PatchedWalletV2ListResponse;
    const updatedMethods = paymentMethods.data!.map(w =>
      convertWalletV2toWalletV1({ ...w, pagoPA: false })
    );
    isIDPayEnabledMock.mockReturnValue(false);

    store.dispatch(fetchWalletsSuccess(updatedMethods));
    const screen = renderDetailScreen(store, creditCard);
    await waitFor(() => {
      expect(screen.queryByTestId("idPayInitiativesList")).toBeNull();
    });
  });
  it("does not render idpay initiatives when isIdpayEnabled is true, but there are no initiatives", async () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const paymentMethods = walletsV2_1 as PatchedWalletV2ListResponse;
    const updatedMethods = paymentMethods.data!.map(w =>
      convertWalletV2toWalletV1({ ...w, pagoPA: false })
    );
    initiativesFromInstrumentMock.mockImplementation(() => []);
    isIDPayEnabledMock.mockReturnValue(true);

    store.dispatch(fetchWalletsSuccess(updatedMethods));
    const screen = renderDetailScreen(store, creditCard);
    await waitFor(() => {
      expect(screen.queryByTestId("idPayInitiativesList")).toBeNull();
    });
  });
  it("renders idpay initiatives when isIdpayEnabled is true and there are some ", async () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const paymentMethods = walletsV2_1 as PatchedWalletV2ListResponse;
    const updatedMethods = paymentMethods.data!.map(w =>
      convertWalletV2toWalletV1({ ...w, pagoPA: false })
    );
    initiativesFromInstrumentMock.mockImplementation(() => [mockInitiative]);
    isIDPayEnabledMock.mockReturnValue(true);

    store.dispatch(fetchWalletsSuccess(updatedMethods));
    const screen = renderDetailScreen(store, creditCard);
    await waitFor(() => {
      expect(screen.queryByTestId("idPayInitiativesList")).not.toBeNull();
    });
  });
  it(
    "When pagoPA=false the CreditCardDetailScreen should contains" +
      " the CreditCardComponent and PaymentStatusSwitch",
    () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);

      const paymentMethods = walletsV2_1 as PatchedWalletV2ListResponse;
      const updatedMethods = paymentMethods.data!.map(w =>
        convertWalletV2toWalletV1({ ...w, pagoPA: false })
      );
      store.dispatch(fetchWalletsSuccess(updatedMethods));
      const screen = renderDetailScreen(store, creditCard);

      expect(screen.queryByTestId("CreditCardComponent")).not.toBeNull();
      expect(screen.queryByTestId("FavoritePaymentMethodSwitch")).toBeNull();
      expect(screen.queryByTestId("PaymentStatusSwitch")).not.toBeNull();
    }
  );
  it(
    "When pagoPA=true the CreditCardDetailScreen should contains" +
      " CreditCardComponent, FavoritePaymentMethodSwitch and PaymentStatusSwitch",
    () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);

      const paymentMethods = walletsV2_1 as PatchedWalletV2ListResponse;
      const updatedMethods = paymentMethods.data!.map(w =>
        convertWalletV2toWalletV1(w)
      );
      store.dispatch(fetchWalletsSuccess(updatedMethods));
      const screen = renderDetailScreen(store, creditCard);

      expect(screen.queryByTestId("CreditCardComponent")).not.toBeNull();
      expect(
        screen.queryByTestId("FavoritePaymentMethodSwitch")
      ).not.toBeNull();
      expect(screen.queryByTestId("PaymentStatusSwitch")).not.toBeNull();
    }
  );
});

const CreditCardWrapper = (
  props: React.ComponentProps<typeof CreditCardDetailScreen>
) => <CreditCardDetailScreen {...props} />;

const renderDetailScreen = (
  store: Store,
  creditCard: CreditCardPaymentMethod
) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    CreditCardWrapper,
    ROUTES.WALLET_CREDIT_CARD_DETAIL,
    { creditCard },
    store
  );
