import { createStore, Store } from "redux";
import { NavigationParams } from "react-navigation";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import ROUTES from "../../../../../../navigation/routes";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import I18n from "../../../../../../i18n";
import OptInPaymentMethodsCashbackUpdateScreen from "../OptInPaymentMethodsCashbackUpdateScreen";
import * as optInPaymentMethodsActions from "../../../store/actions/optInPaymentMethods";
import * as navigationAction from "../../../navigation/actions";
import { fetchWalletsSuccess } from "../../../../../../store/actions/wallet/wallets";
import { EnableableFunctionsEnum } from "../../../../../../../definitions/pagopa/EnableableFunctions";
import {
  RawBancomatPaymentMethod,
  Wallet
} from "../../../../../../types/pagopa";

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
  it("should show the title and the subtitle", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);
    expect(
      component.getByText(
        I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.title")
      )
    ).toBeDefined();
    expect(
      component.getByText(
        I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.subtitle")
      )
    ).toBeDefined();
  });

  describe("when the button continue is pressed", () => {
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
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    OptInPaymentMethodsCashbackUpdateScreen,
    ROUTES.MAIN,
    {},
    store
  );
}
