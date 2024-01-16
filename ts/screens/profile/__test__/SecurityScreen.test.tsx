import React from "react";
import configureMockStore from "redux-mock-store";

import { fireEvent } from "@testing-library/react-native";
import SecurityScreen from "../SecurityScreen";
import I18n from "../../../i18n";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import ROUTES from "../../../navigation/routes";
import { identificationRequest } from "../../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../../config";

describe("Test SecurityScreen", () => {
  jest.useFakeTimers();
  it("should be not null", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
  });
  it("should render H1 component with title and H4 component with subtitle", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
    expect(
      // With the new navbar we have two titles.
      // The second one is the larger one.
      // The first one is the smaller one that is shown when scrolling.
      component.queryAllByText(I18n.t("profile.security.title"))[1]
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("profile.security.subtitle"))
    ).not.toBeNull();
  });
  it("should render ListItemComponent reset unlock code with the right title and subtitle", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
    expect(component.queryByTestId("reset-unlock-code")).not.toBeNull();
    expect(
      // With the new navbar we have two titles.
      // The second one is the larger one.
      // The first one is the smaller one that is shown when scrolling.
      component.queryAllByText(I18n.t("profile.security.title"))[1]
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("profile.security.subtitle"))
    ).not.toBeNull();
  });
  it("when press ListItemComponent reset unlock code, should dispatch identificationRequest", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const listItemComponent = component.getByTestId("reset-unlock-code");
    expect(listItemComponent).not.toBeNull();
    fireEvent.press(listItemComponent);
    store.dispatch(
      identificationRequest(
        true,
        false,
        undefined,
        undefined,
        {
          onSuccess: () => jest.fn()
        },
        shufflePinPadOnPayment
      )
    );
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <SecurityScreen />,
      ROUTES.PROFILE_SECURITY,
      {},
      store
    ),
    store
  };
};
