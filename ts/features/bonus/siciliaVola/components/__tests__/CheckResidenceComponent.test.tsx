import { fireEvent } from "@testing-library/react-native";
import { NavigationActions, NavigationParams } from "react-navigation";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../../i18n";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import SV_ROUTES from "../../navigation/routes";
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

  describe("when 'I reside in Sicily' is checked", () => {
    it("the continue button should navigate to SelectBeneficiaryCategory screen", () => {
      const spy = jest.spyOn(NavigationService, "dispatchNavigationAction");
      const { component } = renderComponent();
      const itemYes = component.getByText(
        I18n.t("bonus.sv.voucherGeneration.checkResidence.items.inSicily")
      );
      fireEvent(itemYes, "onPress");
      const continueButton = component.getByText(
        I18n.t("global.buttons.continue")
      );
      fireEvent(continueButton, "onPress");

      expect(spy).toHaveBeenCalledWith(
        NavigationActions.navigate({
          routeName: SV_ROUTES.VOUCHER_GENERATION.SELECT_BENEFICIARY_CATEGORY
        })
      );
    });
  });

  describe("when 'I reside in another region' is checked", () => {
    const { component } = renderComponent();
    const spy = jest.spyOn(NavigationService, "dispatchNavigationAction");
    const itemYes = component.getByText(
      I18n.t("bonus.sv.voucherGeneration.checkResidence.items.notInSicily")
    );
    fireEvent(itemYes, "onPress");
    const continueButton = component.getByText(
      I18n.t("global.buttons.continue")
    );
    fireEvent(continueButton, "onPress");
    expect(spy).toHaveBeenCalledWith(
      NavigationActions.navigate({
        routeName: SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_RESIDENCE
      })
    );
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
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      CheckResidenceComponent,
      ROUTES.MAIN,
      {},
      store
    ),
    store
  };
}
