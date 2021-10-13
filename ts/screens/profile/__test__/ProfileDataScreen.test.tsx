import React from "react";
import configureMockStore from "redux-mock-store";
import { NavigationParams } from "react-navigation";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { GlobalState } from "../../../store/reducers/types";
import {
  hasProfileEmailSelector,
  profileEmailSelector,
  profileNameSurnameSelector,
  isProfileEmailValidatedSelector
} from "../../../store/reducers/profile";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import ROUTES from "../../../navigation/routes";
import ProfileDataScreen from "../ProfileDataScreen";
import I18n from "../../../i18n";
import {
  navigateToEmailReadScreen,
  navigateToEmailInsertScreen
} from "../../../store/actions/navigation";

const mockPresentFn = jest.fn();
jest.mock("../../../utils/bottomSheet", () => ({
  __esModule: true,
  useIOBottomSheet: () => ({ present: mockPresentFn })
}));

describe("Test ProfileDataScreen", () => {
  jest.useFakeTimers();
  it("should be not null", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
  });
  it("should render H1 component with title and H4 component with subtitle", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
    expect(component.queryByText(I18n.t("profile.data.title"))).not.toBeNull();
    expect(
      component.queryByText(I18n.t("profile.data.subtitle"))
    ).not.toBeNull();
  });
  it("should render ListItemComponent insert or edit email with the right title and subtitle", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    expect(component.queryByTestId("insert-or-edit-email")).not.toBeNull();
    expect(component.queryByText(I18n.t("profile.data.title"))).not.toBeNull();
    expect(
      component.queryByText(
        profileEmailSelector(store.getState()).getOrElse(
          I18n.t("global.remoteStates.notAvailable")
        )
      )
    ).not.toBeNull();
  });
  it("should render ListItemComponent insert or edit email with titleBadge if email is not validated", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    expect(component.queryByTestId("insert-or-edit-email")).not.toBeNull();
    const isEmailValidated = isProfileEmailValidatedSelector(store.getState());
    if (!isEmailValidated) {
      expect(
        component.queryByText(I18n.t("profile.data.list.need_validate"))
      ).not.toBeNull();
    }
  });
  it("when press ListItemComponent insert or edit email, if user has email should navigate to EmailReadScreen else should navigate to EmailInsertScreen", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const listItemComponent = component.getByTestId("insert-or-edit-email");
    expect(listItemComponent).not.toBeNull();
    fireEvent.press(listItemComponent);
    const hasProfileEmail = hasProfileEmailSelector(store.getState());
    if (hasProfileEmail) {
      store.dispatch(navigateToEmailReadScreen());
    } else {
      store.dispatch(navigateToEmailInsertScreen());
    }
  });
  it("should render ListItemComponent name and surname with the right title and subtitle", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const nameSurname = profileNameSurnameSelector(store.getState());
    const listItemComponent = component.queryByTestId("name-surname");
    if (nameSurname) {
      expect(listItemComponent).not.toBeNull();
      expect(listItemComponent).toHaveTextContent(
        I18n.t("profile.data.list.nameSurname")
      );
      expect(listItemComponent).toHaveTextContent(nameSurname);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      () => <ProfileDataScreen />,
      ROUTES.PROFILE_DATA,
      {},
      store
    ),
    store
  };
};
