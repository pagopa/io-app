import * as pot from "@pagopa/ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import I18n from "../../i18n";

import NewRemindEmailValidationOverlay from "../NewRemindEmailValidationOverlay";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";

describe("NewRemindEmailValidationOverlay with isEmailValidated as true", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore();

  // eslint-disable-next-line functional/no-let
  let finalState: ReturnType<typeof mockStore>;
  beforeAll(() => {
    finalState = mockStore({
      ...globalState,
      profile: pot.some({
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.AUTO
        },
        is_email_validated: true,
        email: "prova.prova@prova.com"
      })
    });
  });

  it("the components into the page should be render correctly", async () => {
    const component = renderComponent(finalState);
    expect(component).toBeDefined();
    expect(component.getByTestId("container-test")).not.toBeNull();
    expect(component.getByTestId("title-test")).toBeDefined();
    expect(
      component.getByText(I18n.t("email.newvalidemail.title"))
    ).toBeTruthy();
    expect(
      component.getByText(I18n.t("email.newvalidemail.subtitle"))
    ).toBeTruthy();
    const button = component.getByTestId("button-test");
    expect(button).toBeDefined();
    expect(component.getByText(I18n.t("global.buttons.continue"))).toBeTruthy();
    expect(button).not.toBeDisabled();
    if (button) {
      fireEvent.press(button);
    }
  });
});

describe("NewRemindEmailValidationOverlay with isEmailValidated as false", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore();

  // eslint-disable-next-line functional/no-let
  let finalState: ReturnType<typeof mockStore>;

  beforeAll(() => {
    finalState = mockStore({
      ...globalState,
      profile: pot.some({
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.AUTO
        },
        is_email_validated: false,
        email: "prova.prova@prova.com"
      })
    });
  });

  it("the components into the page should be render correctly", async () => {
    const component = renderComponent(finalState);
    expect(component).toBeDefined();
    expect(component.getByTestId("container-test")).not.toBeNull();
    expect(component.getByTestId("title-test")).toBeDefined();
    expect(component.getByText(I18n.t("email.newvalidate.title"))).toBeTruthy();
    expect(
      component.getByText(I18n.t("email.newvalidate.subtitle"))
    ).toBeTruthy();
    expect(component.getByTestId("link-test")).toBeDefined();
    const button = component.getByTestId("button-test");
    expect(button).toBeDefined();
    expect(
      component.getByText(I18n.t("email.newvalidate.buttonlabelsentagain"))
    ).toBeTruthy();
    expect(button).not.toBeDisabled();
    if (button) {
      fireEvent.press(button);
    }

    setTimeout(() => {
      expect(
        component.getByText(I18n.t("email.newvalidate.buttonlabelsentagain"))
      ).not.toBeDisabled();
    }, 10000);
  });
});

const renderComponent = (globalStateProp?: any) =>
  renderScreenWithNavigationStoreContext(
    NewRemindEmailValidationOverlay,
    "DUMMY",
    {},
    globalStateProp
  );
