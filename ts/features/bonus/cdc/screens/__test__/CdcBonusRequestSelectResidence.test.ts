import configureMockStore from "redux-mock-store";
import { NavigationParams } from "react-navigation";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import CdcBonusRequestSelectResidence from "../CdcBonusRequestSelectResidence";
import I18n from "../../../../../i18n";

jest.useFakeTimers();

describe("the CdcBonusRequestSelectResidence screen", () => {
  it("should render the title", () => {
    const { component } = renderComponent();
    expect(component.getByText(I18n.t("bonus.cdc.title"))).toBeDefined();
  });
  it("should render the resident in Italy and resident abroad radio buttons", () => {
    const { component } = renderComponent();
    const itemResidentInItaly = component.getByText(
      I18n.t("bonus.cdc.selectResidence.items.residesInItaly")
    );
    expect(itemResidentInItaly).toBeDefined();

    const itemResidentAbroad = component.getByText(
      I18n.t("bonus.cdc.selectResidence.items.residesAbroad")
    );
    expect(itemResidentAbroad).toBeDefined();
  });

  it("should render the information text", () => {
    const { component } = renderComponent();
    expect(
      component.getByText(I18n.t("bonus.cdc.selectResidence.info"))
    ).toBeDefined();
  });

  describe("when 'I live in Italy' is checked", () => {
    it("the continue button should be enabled", () => {
      const { component } = renderComponent();
      const itemResidentInItaly = component.getByText(
        I18n.t("bonus.cdc.selectResidence.items.residesInItaly")
      );
      fireEvent(itemResidentInItaly, "onPress");
      const continueButton = component.getByText(
        I18n.t("global.buttons.continue")
      );

      expect(continueButton).toBeEnabled();
    });
  });
  describe("when 'I live abroad' is checked", () => {
    it("the continue button should be disabled", () => {
      const { component } = renderComponent();
      const itemResidentAbroad = component.getByText(
        I18n.t("bonus.cdc.selectResidence.items.residesAbroad")
      );
      fireEvent(itemResidentAbroad, "onPress");
      const continueButton = component.getByText(
        I18n.t("global.buttons.continue")
      );

      expect(continueButton).toBeDisabled();
    });
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);
  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      CdcBonusRequestSelectResidence,
      ROUTES.MAIN,
      {},
      store
    ),
    store
  };
}
