import * as React from "react";

import { createStore } from "redux";
import { EnableableFunctionsEnum } from "../../../../../definitions/pagopa/EnableableFunctions";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { fetchWalletsSuccess } from "../../../../store/actions/wallet/wallets";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { walletsV2_1 } from "../../../../store/reducers/wallet/__mocks__/wallets";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  CreditCardType,
  PatchedWalletV2ListResponse,
  PaymentMethod,
  SatispayPaymentMethod
} from "../../../../types/pagopa";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { convertWalletV2toWalletV1 } from "../../../../utils/walletv2";
import PagoPaPaymentCapability from "../features/PagoPaPaymentCapability";

jest.mock("../../../../config", () => ({ pmActivatePaymentEnabled: true }));

describe("PagoPaPaymentCapability", () => {
  jest.useFakeTimers();
  it("should render a toggle with kind=CreditCard and without issuerAbiCode and enableableFunction contains pagoPA", () => {
    const aNonMaestroCreditCard = {
      info: {
        brand: "VISA" as CreditCardType
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aNonMaestroCreditCard,
      kind: "CreditCard",
      pagoPA: true,
      idWallet: 23216,
      enableableFunctions: [EnableableFunctionsEnum.pagoPA]
    } as PaymentMethod;

    const paymentMethods = walletsV2_1 as PatchedWalletV2ListResponse;
    const updatedMethods = paymentMethods.data!.map(w =>
      convertWalletV2toWalletV1({ ...w, pagoPA: false })
    );

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fetchWalletsSuccess(updatedMethods));

    const testComponent = renderScreenFakeNavRedux<GlobalState>(
      () => <PagoPaPaymentCapability paymentMethod={aPaymentMethod} />,
      ROUTES.WALLET_HOME,
      {},
      store
    );

    expect(testComponent.getByTestId("PaymentStatusSwitch")).toBeTruthy();
  });

  it("should render a badge with the text Arriving if passed a payment method of kind Satispay", () => {
    const aSatispay = {} as SatispayPaymentMethod;
    const aPaymentMethod = {
      ...aSatispay,
      kind: "Satispay",
      enableableFunctions: [EnableableFunctionsEnum.BPD]
    } as PaymentMethod;

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <PagoPaPaymentCapability paymentMethod={aPaymentMethod} />,
      ROUTES.WALLET_HOME,
      {},
      store
    );
    expect(component.getByText("Arriving")).toBeTruthy();
  });

  it("should render a badge with the text Incompatible if passed a payment method of kind Bancomat", () => {
    const aBancomat = {} as BancomatPaymentMethod;
    const aPaymentMethod = {
      ...aBancomat,
      kind: "Bancomat",
      enableableFunctions: [EnableableFunctionsEnum.BPD]
    } as PaymentMethod;

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <PagoPaPaymentCapability paymentMethod={aPaymentMethod} />,
      ROUTES.WALLET_HOME,
      {},
      store
    );

    expect(component.getByText("Incompatible")).toBeTruthy();
  });

  it("should render a badge with the text Incompatible if passed a co-badge, payment method of kind CreditCard with issuerAbiCode and doesn't have enableableFunction pagoPA", () => {
    const aNonMaestroCreditCard = {
      info: {
        brand: "VISA" as CreditCardType,
        issuerAbiCode: "123"
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aNonMaestroCreditCard,
      kind: "CreditCard",
      pagoPA: false,
      enableableFunctions: [EnableableFunctionsEnum.BPD]
    } as PaymentMethod;

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <PagoPaPaymentCapability paymentMethod={aPaymentMethod} />,
      ROUTES.WALLET_HOME,
      {},
      store
    );
    expect(component.getByText("Incompatible")).not.toBeNull();
  });
});
