import { NavigationParams } from "react-navigation";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import ROUTES from "../../../../../navigation/routes";
import I18n from "../../../../../i18n";
import { svGenerateVoucherBack } from "../../store/actions/voucherGeneration";
import {
  navigateToSvKoCheckResidenceScreen,
  navigateToSvSelectBeneficiaryCategoryScreen
} from "../../navigation/actions";

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

  describe("when 'I reside in Sicily' is checked", () => {
    it("the continue button should navigate to SelectBeneficiaryCategory screen", () => {
      const { component, store } = renderComponent();
      const itemYes = component.getByText(
        I18n.t("bonus.sv.voucherGeneration.checkResidence.items.inSicily")
      );
      fireEvent(itemYes, "onPress");
      const continueButton = component.getByText(
        I18n.t("global.buttons.continue")
      );
      fireEvent(continueButton, "onPress");
      expect(store.getActions()).toEqual([
        navigateToSvSelectBeneficiaryCategoryScreen()
      ]);
    });
  });

  describe("when 'I reside in another region' is checked", () => {
    const { component, store } = renderComponent();
    const itemYes = component.getByText(
      I18n.t("bonus.sv.voucherGeneration.checkResidence.items.notInSicily")
    );
    fireEvent(itemYes, "onPress");
    const continueButton = component.getByText(
      I18n.t("global.buttons.continue")
    );
    fireEvent(continueButton, "onPress");
    expect(store.getActions()).toEqual([navigateToSvKoCheckResidenceScreen()]);
  });

  describe("when the back button is pressed", () => {
    it("should go back", () => {
      const { component, store } = renderComponent();
      const backButton = component.getByText(I18n.t("global.buttons.back"));
      fireEvent(backButton, "onPress");
      expect(store.getActions()).toEqual([svGenerateVoucherBack()]);
    });
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);
  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      CheckResidenceComponent,
      ROUTES.MAIN,
      {},
      store
    ),
    store
  };
}
