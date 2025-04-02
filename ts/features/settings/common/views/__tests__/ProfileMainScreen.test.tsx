import { PreloadedState, createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import { appReducer } from "../../../../../store/reducers";
import ProfileMainScreen from "../ProfileMainScreen";
import { applicationChangeState } from "../../../../../store/actions/application";
import ROUTES from "../../../../../navigation/routes";
import I18n from "../../../../../i18n";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";

jest.spyOn(Alert, "alert");

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ProfileMainScreen,
      ROUTES.SETTINGS_MAIN,
      {},
      store
    ),
    store
  };
};

describe(ProfileMainScreen, () => {
  it("Should display the alert on logout press", () => {
    const { component } = renderComponent();
    const logoutButton = component.getByTestId(/logoutButton/);

    fireEvent.press(logoutButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("profile.logout.alertTitle"),
      I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel")
        },
        {
          text: I18n.t("profile.logout.exit"),
          onPress: expect.any(Function)
        }
      ],
      { cancelable: true }
    );
  });
});
