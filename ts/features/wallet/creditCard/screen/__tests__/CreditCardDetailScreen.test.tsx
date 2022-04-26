import * as React from "react";
import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import { TypeEnum } from "../../../../../../definitions/pagopa/walletv2/CardInfo";
import { WalletTypeEnum } from "../../../../../../definitions/pagopa/WalletV2";
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
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import { convertWalletV2toWalletV1 } from "../../../../../utils/walletv2";
import CreditCardDetailScreen from "../CreditCardDetailScreen";
import { EnableableFunctionsEnum } from "../../../../../../definitions/pagopa/EnableableFunctions";
// import I18n from "../../../../../i18n";

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

describe("Test CreditCardDetailScreen", () => {
  jest.useFakeTimers();
  it("When navigate to the screen and no wallet are in the store, should render WorkunitGenericFailure", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const screen = renderDetailScreen(store, creditCard);
    expect(screen.getByTestId("WorkunitGenericFailure")).not.toBeNull();
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

      const paymentMethods = PatchedWalletV2ListResponse.decode(walletsV2_1)
        .value as PatchedWalletV2ListResponse;
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

      const paymentMethods = PatchedWalletV2ListResponse.decode(walletsV2_1)
        .value as PatchedWalletV2ListResponse;
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
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    CreditCardWrapper,
    ROUTES.WALLET_CREDIT_CARD_DETAIL,
    { creditCard },
    store
  );
