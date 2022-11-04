import { createStore } from "redux";
import { PspData } from "../../../../../../../definitions/pagopa/PspData";
import I18n from "../../../../../../i18n";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { pspForPaymentV2 } from "../../../../../../store/actions/wallet/payment";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { getNetworkError } from "../../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import PayPalPspUpdateScreen from "../../../../paypal/screen/PayPalPspUpdateScreen";

const pspList: ReadonlyArray<PspData> = [
  {
    id: 1,
    codiceAbi: "0001",
    defaultPsp: true,
    fee: 100,
    idPsp: "1",
    onboard: true,
    privacyUrl: "https://io.italia.it",
    ragioneSociale: "PayTipper"
  },
  {
    id: 2,
    codiceAbi: "0002",
    defaultPsp: true,
    fee: 120,
    idPsp: "2",
    onboard: true,
    privacyUrl: "https://io.italia.it",
    ragioneSociale: "PayTipper2"
  }
];

describe("PayPalPspUpdateScreen", () => {
  jest.useFakeTimers();
  describe("when the psp list is ready", () => {
    it(`then content should be displayed`, () => {
      const render = renderComponent();
      render.store.dispatch(pspForPaymentV2.success(pspList));
      expect(
        render.component.queryByTestId("PayPalPspUpdateScreen")
      ).not.toBeNull();
    });

    it(`then the footer button should be defined`, () => {
      const render = renderComponent();
      render.store.dispatch(pspForPaymentV2.success(pspList));
      expect(
        render.component.queryByText(I18n.t("global.buttons.cancel"))
      ).not.toBeNull();
    });

    it("then psp items shown should match those one in the store", () => {
      const render = renderComponent();
      render.store.dispatch(pspForPaymentV2.success(pspList));
      pspList.forEach(psp => {
        expect(
          render.component.queryByTestId(`pspItemTestID_${psp.idPsp}`)
        ).not.toBeNull();
      });
    });
  });

  describe("when the psp list is loading", () => {
    it("then a loading should be shown", () => {
      const render = renderComponent();
      render.store.dispatch(
        pspForPaymentV2.request({ idPayment: "x", idWallet: 1 })
      );
      expect(
        render.component.queryByTestId(`PayPalPpsUpdateScreenLoadingError`)
      ).not.toBeNull();
    });
  });

  describe("when the psp list is in error", () => {
    it("then the error content and retry button should be shown", () => {
      const render = renderComponent();
      render.store.dispatch(
        pspForPaymentV2.failure(getNetworkError(new Error("test")))
      );
      expect(
        render.component.queryByTestId(`LoadingErrorComponentError`)
      ).not.toBeNull();
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      PayPalPspUpdateScreen,
      "N/A",
      {},
      store
    ),
    store
  };
};
