import * as React from "react";
import { NavigationParams } from "react-navigation";
import { createStore } from "redux";
import { TypeEnum } from "../../../../../definitions/pagopa/walletv2/CardInfo";
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
import { EnableableFunctionsEnum } from "../../../../../definitions/pagopa/EnableableFunctions";

jest.mock("../../../../config", () => ({ pmActivatePaymentEnabled: true }));

describe("PagoPaPaymentCapability", () => {
  jest.useFakeTimers();
  it("should render a toggle with kind=CreditCard and without issuerAbiCode and enableableFunction contains pagoPA", () => {
    const aNonMaestroCreditCard = {
      info: {
        brand: CreditCardType.decode("VISA").value
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aNonMaestroCreditCard,
      kind: "CreditCard",
      pagoPA: true,
      idWallet: 23216,
      enableableFunctions: [EnableableFunctionsEnum.pagoPA]
    } as PaymentMethod;

    const paymentMethods = PatchedWalletV2ListResponse.decode(walletsV2_1)
      .value as PatchedWalletV2ListResponse;
    const updatedMethods = paymentMethods.data!.map(w =>
      convertWalletV2toWalletV1({ ...w, pagoPA: false })
    );

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fetchWalletsSuccess(updatedMethods));

    const testComponent = renderScreenFakeNavRedux<
      GlobalState,
      NavigationParams
    >(
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

    const component = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      () => <PagoPaPaymentCapability paymentMethod={aPaymentMethod} />,
      ROUTES.WALLET_HOME,
      {},
      store
    );
    expect(component.getByText("Arriving")).toBeTruthy();
  });

  it("should render a badge with the text Arriving if passed a payment method of kind BPay", () => {
    const aBPay = {} as SatispayPaymentMethod;
    const aPaymentMethod = {
      ...aBPay,
      kind: "BPay",
      enableableFunctions: [EnableableFunctionsEnum.BPD]
    } as PaymentMethod;

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const component = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
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

    const component = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
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
        brand: CreditCardType.decode("VISA").value,
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

    const component = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      () => <PagoPaPaymentCapability paymentMethod={aPaymentMethod} />,
      ROUTES.WALLET_HOME,
      {},
      store
    );
    expect(component.getByText("Incompatible")).not.toBeNull();
  });
  it('should render a badge with test "Incompatible" if passed a privative card, payment method of kind CreditCard with issuerAbiCode and type = PRV', () => {
    const aNonMaestroCreditCard = {
      info: {
        brand: CreditCardType.decode("VISA").value,
        issuerAbiCode: "123",
        type: TypeEnum.PRV
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aNonMaestroCreditCard,
      kind: "CreditCard",
      enableableFunctions: [EnableableFunctionsEnum.BPD],
      pagoPA: false
    } as PaymentMethod;

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const component = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      () => <PagoPaPaymentCapability paymentMethod={aPaymentMethod} />,
      ROUTES.WALLET_HOME,
      {},
      store
    );
    expect(component.getByText("Incompatible")).toBeTruthy();
  });
});
