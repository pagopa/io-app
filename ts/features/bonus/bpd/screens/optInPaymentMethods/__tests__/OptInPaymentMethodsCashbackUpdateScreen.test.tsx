import { createStore, Store } from "redux";

import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { EnableableFunctionsEnum } from "../../../../../../../definitions/pagopa/EnableableFunctions";
import I18n from "../../../../../../i18n";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess
} from "../../../../../../store/actions/wallet/wallets";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  RawBancomatPaymentMethod,
  Wallet
} from "../../../../../../types/pagopa";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import * as navigationAction from "../../../navigation/actions";
import * as optInPaymentMethodsActions from "../../../store/actions/optInPaymentMethods";
import OptInPaymentMethodsCashbackUpdateScreen from "../OptInPaymentMethodsCashbackUpdateScreen";

jest.useFakeTimers();
const mockPaymentMethodWithBPD = {
  idWallet: 23216,
  paymentMethod: {
    kind: "Bancomat",
    enableableFunctions: [EnableableFunctionsEnum.BPD],
    info: {}
  } as unknown as RawBancomatPaymentMethod
} as Wallet;
const mockPaymentMethodWithoutBPD = {
  idWallet: 23216,
  paymentMethod: {
    kind: "Bancomat",
    enableableFunctions: [EnableableFunctionsEnum.pagoPA],
    info: {}
  } as unknown as RawBancomatPaymentMethod
} as Wallet;
describe("the OptInPaymentMethodsCashbackUpdateScreen screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("if the payment methods are a pot of kind PotSome, should show the title and the subtitle", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);
    store.dispatch(fetchWalletsSuccess([mockPaymentMethodWithoutBPD]));
    expect(
      component.getByText(
        I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.title")
      )
    ).toBeDefined();
  });

  describe("if the payment methods are a pot of kind PotSome, when the button continue is pressed", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should dispatch the optInPaymentMethodsCompleted action if there isn't at least a payment method with the BPD capability", () => {
      const optInPaymentMethodsCompletedSpy = jest.spyOn(
        optInPaymentMethodsActions,
        "optInPaymentMethodsCompleted"
      );
      const navigateToOptInPaymentMethodsChoiceScreenSpy = jest.spyOn(
        navigationAction,
        "navigateToOptInPaymentMethodsChoiceScreen"
      );
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store);
      const continueButton = component.getByTestId("continueButton");

      fireEvent(continueButton, "onPress");
      expect(optInPaymentMethodsCompletedSpy).toBeCalled();
      expect(navigateToOptInPaymentMethodsChoiceScreenSpy).not.toBeCalled();

      store.dispatch(fetchWalletsSuccess([mockPaymentMethodWithoutBPD]));
      fireEvent(continueButton, "onPress");
      expect(optInPaymentMethodsCompletedSpy).toBeCalled();
      expect(navigateToOptInPaymentMethodsChoiceScreenSpy).not.toBeCalled();
    });
    it("should dispatch the navigateToOptInPaymentMethodsChoiceScreen action if there is at least a payment method with the BPD capability", () => {
      const optInPaymentMethodsCompletedSpy = jest.spyOn(
        optInPaymentMethodsActions,
        "optInPaymentMethodsCompleted"
      );
      const navigateToOptInPaymentMethodsChoiceScreenSpy = jest.spyOn(
        navigationAction,
        "navigateToOptInPaymentMethodsChoiceScreen"
      );
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store);
      store.dispatch(fetchWalletsSuccess([mockPaymentMethodWithBPD]));
      const continueButton = component.getByTestId("continueButton");

      fireEvent(continueButton, "onPress");
      expect(navigateToOptInPaymentMethodsChoiceScreenSpy).toBeCalled();
      expect(optInPaymentMethodsCompletedSpy).not.toBeCalled();
    });
  });

  it("if the payment methods are not a pot of kind PotSome, should dispatch the optInPaymentMethodsFailure action", () => {
    const optInPaymentMethodsFailureSpy = jest.spyOn(
      optInPaymentMethodsActions,
      "optInPaymentMethodsFailure"
    );
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    renderComponent(store);

    // PotNone case
    expect(optInPaymentMethodsFailureSpy).toBeCalled();

    // PotNoneLoading case
    store.dispatch(fetchWalletsRequest());
    expect(optInPaymentMethodsFailureSpy).toBeCalled();

    // PotNoneError case
    store.dispatch(fetchWalletsFailure(new Error("mockedError")));
    expect(optInPaymentMethodsFailureSpy).toBeCalled();

    // PotSomeError case
    store.dispatch(fetchWalletsSuccess([mockPaymentMethodWithBPD]));
    store.dispatch(fetchWalletsFailure(new Error("mockedError")));
    expect(optInPaymentMethodsFailureSpy).toBeCalled();

    // PotSomeLoading case
    store.dispatch(fetchWalletsRequest());
    expect(optInPaymentMethodsFailureSpy).toBeCalled();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    OptInPaymentMethodsCashbackUpdateScreen,
    ROUTES.MAIN,
    {},
    store
  );
}
