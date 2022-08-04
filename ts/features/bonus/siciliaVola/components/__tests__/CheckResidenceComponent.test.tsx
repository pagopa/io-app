import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../../i18n";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import { svGenerateVoucherCancel } from "../../store/actions/voucherGeneration";

import CheckResidenceComponent from "../CheckResidenceComponent";

jest.useFakeTimers();

describe("the CheckResidenceComponent", () => {
  it("should render the title", () => {
    const { component } = renderComponent();
    expect(
      component.getByText(
        I18n.t("bonus.sv.voucherGeneration.checkResidence.title")
      )
    ).toBeDefined();
  });

  it("should render two radio buttons", () => {
    const { component } = renderComponent();
    const itemYes = component.getByText(
      I18n.t("bonus.sv.voucherGeneration.checkResidence.items.inSicily")
    );
    expect(itemYes).toBeDefined();
    const itemNo = component.getByText(
      I18n.t("bonus.sv.voucherGeneration.checkResidence.items.notInSicily")
    );
    expect(itemNo).toBeDefined();
  });

  it("should render the information text", () => {
    const { component } = renderComponent();
    expect(
      component.getByText(
        I18n.t("bonus.sv.voucherGeneration.checkResidence.info")
      )
    ).toBeDefined();
  });

  describe("when the cancel button is pressed", () => {
    it("should dispatch a `svGenerateVoucherCancel` action", () => {
      const { component, store } = renderComponent();
      const cancelButton = component.getByText(I18n.t("global.buttons.cancel"));
      fireEvent(cancelButton, "onPress");
      expect(store.getActions()).toEqual([svGenerateVoucherCancel()]);
    });
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);
  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      CheckResidenceComponent,
      ROUTES.MAIN,
      {},
      store
    ),
    store
  };
}
