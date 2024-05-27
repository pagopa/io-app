import { render, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { PreloadedState, createStore } from "redux";
import { Alert } from "react-native";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import I18n from "../../../i18n";
import { PinCreation } from "../PinCreation/PinCreation";

jest.spyOn(Alert, "alert");
const mockedGoBack = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      ...actualNav.useNavigation(),
      goBack: mockedGoBack
    })
  };
});

describe(PinCreation, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
});

function renderComponent(isOnboarding?: boolean) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  return (
    <Provider store={store}>
      <PinCreation isOnboarding={isOnboarding} />
    </Provider>
  );
}
