import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { render } from "@testing-library/react-native";
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
  EnableableFunctionsTypeEnum,
  PatchedWalletV2ListResponse,
  PaymentMethod,
  SatispayPaymentMethod
} from "../../../../types/pagopa";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { convertWalletV2toWalletV1 } from "../../../../utils/walletv2";
import PagoPaPaymentCapability from "../features/PagoPaPaymentCapability";

const renderTestTarget = (paymentMethod: PaymentMethod) =>
  render(
    <BottomSheetModalProvider>
      <PagoPaPaymentCapability paymentMethod={paymentMethod} />
    </BottomSheetModalProvider>
  );

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
      enableableFunctions: [EnableableFunctionsTypeEnum.pagoPA]
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
      () => (
        <BottomSheetModalProvider>
          <PagoPaPaymentCapability paymentMethod={aPaymentMethod} />
        </BottomSheetModalProvider>
      ),
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
      enableableFunctions: [EnableableFunctionsTypeEnum.BPD]
    } as PaymentMethod;

    const component = renderTestTarget(aPaymentMethod);

    expect(component.getByText("Arriving")).toBeTruthy();
  });

  it("should render a badge with the text Arriving if passed a payment method of kind BPay", () => {
    const aBPay = {} as SatispayPaymentMethod;
    const aPaymentMethod = {
      ...aBPay,
      kind: "BPay",
      enableableFunctions: [EnableableFunctionsTypeEnum.BPD]
    } as PaymentMethod;

    const component = renderTestTarget(aPaymentMethod);

    expect(component.getByText("Arriving")).toBeTruthy();
  });

  it("should render a badge with the text Incompatible if passed a payment method of kind Bancomat", () => {
    const aBancomat = {} as BancomatPaymentMethod;
    const aPaymentMethod = {
      ...aBancomat,
      kind: "Bancomat",
      enableableFunctions: [EnableableFunctionsTypeEnum.BPD]
    } as PaymentMethod;

    const component = renderTestTarget(aPaymentMethod);

    expect(component.getByText("Incompatible")).toBeTruthy();
  });

  it("should render a disabled switch if passed a co-badge, payment method of kind CreditCard with issuerAbiCode and doesn't have enableableFunction pagoPA", () => {
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
      enableableFunctions: [EnableableFunctionsTypeEnum.BPD]
    } as PaymentMethod;

    const component = renderTestTarget(aPaymentMethod);
    const disabledSwitch = component.queryByTestId("switchOnboardCard");
    expect(disabledSwitch).not.toBeNull();
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
      enableableFunctions: [EnableableFunctionsTypeEnum.BPD],
      pagoPA: false
    } as PaymentMethod;

    const component = renderTestTarget(aPaymentMethod);
    expect(component.getByText("Incompatible")).toBeTruthy();
  });
});
