import * as pot from "@pagopa/ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import I18n from "../../i18n";

import NewSuccessEmailValidation from "../NewSuccessEmailValidation";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";

const email = "prova.prova@prova.com";

describe("NewSuccessEmailValidation", async () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore();

  // eslint-disable-next-line functional/no-let
  let finalState: ReturnType<typeof mockStore>;

  beforeAll(() => {
    finalState = mockStore({
      ...globalState,
      profile: pot.some({
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
      component.getByText(I18n.t("email.newvalidemail.subtitle", { email }))
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

const renderComponent = (globalStateProp?: any) =>
  renderScreenWithNavigationStoreContext(
    NewSuccessEmailValidation,
    "DUMMY",
    {},
    globalStateProp
  );
