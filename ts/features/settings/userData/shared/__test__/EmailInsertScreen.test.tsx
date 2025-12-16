import { fireEvent, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Alert } from "react-native";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import EmailInsertScreen from "../screens/EmailInsertScreen";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

jest.spyOn(Alert, "alert");

const renderComponent = (emailValue?: string) => {
  // eslint-disable-next-line functional/no-let
  let globalState = appReducer(
    undefined,
    applicationChangeState("active")
  ) as any;

  globalState = {
    ...globalState,
    userData: {
      ...globalState.userData,
      profile: pot.some({
        email: emailValue ?? ""
      })
    }
  };

  const updatedPersistedPreferences = {
    ...globalState.persistedPreferences,
    isProfileFirstOnBoarding: false
  };

  globalState = {
    ...globalState,
    persistedPreferences: updatedPersistedPreferences
  };

  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    EmailInsertScreen,
    SETTINGS_ROUTES.INSERT_EMAIL_SCREEN,
    {
      isOnboarding: false,
      isFciEditEmailFlow: false,
      isEditingPreviouslyInsertedEmailMode: false
    },
    store
  );
};

describe("EmailInsertScreen", () => {
  it("should render base screen", () => {
    const screen = renderComponent();
    expect(screen.getByTestId("container-test")).toBeDefined();
    expect(screen.getByTestId("title-test")).toHaveTextContent(
      I18n.t("email.edit.title")
    );
    expect(screen.getByTestId("email-input")).toBeDefined();
    expect(screen.getByText(I18n.t("global.buttons.continue"))).toBeDefined();
  });

  it("should show error if email is empty", async () => {
    const screen = renderComponent();
    fireEvent.press(screen.getByText(I18n.t("global.buttons.continue")));
    await waitFor(() => {
      expect(
        screen.queryByText(I18n.t("email.newinsert.alert.invalidemail"))
      ).toBeDefined();
    });
  });

  it("should show error if email is invalid", async () => {
    const screen = renderComponent();
    fireEvent.changeText(screen.getByTestId("email-input"), "not-an-email");
    fireEvent.press(screen.getByText(I18n.t("global.buttons.continue")));
    // eslint-disable-next-line sonarjs/no-identical-functions
    await waitFor(() => {
      expect(
        screen.queryByText(I18n.t("email.newinsert.alert.invalidemail"))
      ).toBeDefined();
    });
  });

  it("should allow valid email", () => {
    const screen = renderComponent();
    fireEvent.changeText(screen.getByTestId("email-input"), "a@b.com");
    fireEvent.press(screen.getByText(I18n.t("global.buttons.continue")));
    expect(
      screen.queryByText(I18n.t("email.newinsert.alert.invalidemail"))
    ).toBeNull();
  });

  it("should detect same email and show duplication error", async () => {
    const screen = renderComponent("a@b.com"); // email già salvata
    fireEvent.changeText(screen.getByTestId("email-input"), "a@b.com");
    fireEvent.press(screen.getByText(I18n.t("global.buttons.continue")));
    await waitFor(() => {
      expect(
        screen.queryByText(I18n.t("email.newinsert.alert.description3"))
      ).toBeDefined();
    });
  });

  it("should detect different email and show duplication error", async () => {
    const screen = renderComponent();
    fireEvent.changeText(screen.getByTestId("email-input"), "");
    fireEvent.press(screen.getByText(I18n.t("global.buttons.continue")));
    // eslint-disable-next-line sonarjs/no-identical-functions
    await waitFor(() => {
      expect(
        screen.queryByText(I18n.t("email.newinsert.alert.description3"))
      ).toBeDefined();
    });
  });
});
