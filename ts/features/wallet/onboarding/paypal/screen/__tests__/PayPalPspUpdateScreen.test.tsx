import { NavigationParams } from "react-navigation";
import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import I18n from "../../../../../../i18n";
import { searchPaypalPsp } from "../../store/actions";
import { getNetworkError } from "../../../../../../utils/errors";
import { pspList } from "../__mocks__/psp";
import PayPalPspUpdateScreen from "../PayPalPspUpdateScreen";

describe("PayPalPspUpdateScreen", () => {
  jest.useFakeTimers();
  describe("when the psp list is ready", () => {
    it(`then content should be displayed`, () => {
      const render = renderComponent();
      render.store.dispatch(searchPaypalPsp.success(pspList));
      expect(
        render.component.queryByTestId("PayPalPspUpdateScreen")
      ).not.toBeNull();
    });

    it(`then the footer button should be defined`, () => {
      const render = renderComponent();
      render.store.dispatch(searchPaypalPsp.success(pspList));
      expect(
        render.component.queryByText(I18n.t("global.buttons.cancel"))
      ).not.toBeNull();
    });

    it("then psp items shown should match those one in the store", () => {
      const render = renderComponent();
      render.store.dispatch(searchPaypalPsp.success(pspList));
      pspList.forEach(psp => {
        expect(
          render.component.queryByTestId(`pspItemTestID_${psp.id}`)
        ).not.toBeNull();
      });
    });
  });

  describe("when the psp list is loading", () => {
    it("then a loading should be shown", () => {
      const render = renderComponent();
      render.store.dispatch(searchPaypalPsp.request());
      expect(
        render.component.queryByTestId(`PayPalPpsUpdateScreenLoadingError`)
      ).not.toBeNull();
    });
  });

  describe("when the psp list is in error", () => {
    it("then the error content and retry button should be shown", () => {
      const render = renderComponent();
      render.store.dispatch(
        searchPaypalPsp.failure(getNetworkError(new Error("test")))
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
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      PayPalPspUpdateScreen,
      "N/A",
      {},
      store
    ),
    store
  };
};
