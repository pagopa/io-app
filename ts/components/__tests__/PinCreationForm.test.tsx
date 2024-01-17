import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { createStore } from "redux";
import I18n from "../../i18n";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";
import { PinCreationForm, Props } from "../PinCreationForm";

describe("PinCreationForm component", () => {
  it("should make a correct first render", () => {
    const component = renderComponent({
      onSubmit: jest.fn(),
      isOnboarding: false
    });

    component.getByText(I18n.t("onboarding.pin.title"));
    component.getByText(I18n.t("onboarding.pin.subTitle"));
    component.getByText(I18n.t("onboarding.pin.pinLabel"));
    component.getByText(I18n.t("onboarding.pin.pinConfirmationLabel"));
    component.getByText(I18n.t("onboarding.pin.tutorial"));
    component.getByText(I18n.t("global.buttons.continue"));

    // No error should be rendered at first
    const lengthErrors = component.queryAllByText(
      I18n.t("onboarding.pin.errors.invalid")
    );

    const matchErrors = component.queryAllByText(
      I18n.t("onboarding.pin.errors.match")
    );

    expect(lengthErrors).toHaveLength(0);
    expect(matchErrors).toHaveLength(0);
  });

  it("should show the correct error for the first pin field", async () => {
    const component = renderComponent({
      onSubmit: jest.fn(),
      isOnboarding: false
    });
    const targetFieldInput = component.getByTestId("PinFieldInput");

    fireEvent.changeText(targetFieldInput, "123");
    fireEvent(targetFieldInput, "onEndEditing");

    await waitFor(() => {
      expect(
        component.queryByText(I18n.t("onboarding.pin.errors.invalid"))
      ).toBeTruthy();
    });

    fireEvent.changeText(targetFieldInput, "123456");

    // eslint-disable-next-line sonarjs/no-identical-functions
    await waitFor(() => {
      expect(
        component.queryByText(I18n.t("onboarding.pin.errors.invalid"))
      ).toBeTruthy();
    });
  });

  it("should show the correct error for the confirmation pin field", async () => {
    const component = renderComponent({
      onSubmit: jest.fn(),
      isOnboarding: false
    });
    const pinFieldInput = component.getByTestId("PinFieldInput");
    const targetFieldInput = component.getByTestId("PinConfirmationFieldInput");

    fireEvent.changeText(pinFieldInput, "123456");
    fireEvent(pinFieldInput, "onEndEditing");

    fireEvent.changeText(targetFieldInput, "654321");
    fireEvent(targetFieldInput, "onEndEditing");

    await waitFor(() => {
      expect(
        component.queryByText(I18n.t("onboarding.pin.errors.match"))
      ).toBeTruthy();
    });

    fireEvent.changeText(targetFieldInput, "123456");

    await waitFor(() => {
      expect(
        component.queryByText(I18n.t("onboarding.pin.errors.match"))
      ).toBeFalsy();
    });
  });
});

const renderComponent = (props: Props) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <PinCreationForm {...props} />,
    "DUMMY",
    {},
    store
  );
};
