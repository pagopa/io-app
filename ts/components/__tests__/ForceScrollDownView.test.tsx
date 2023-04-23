/* eslint-disable functional/immutable-data */
import {
  RenderOptions,
  act,
  fireEvent,
  render as render
} from "@testing-library/react-native";
import React from "react";
import { Text, View } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { ForceScrollDownView } from "../ForceScrollDownView";

describe("ForceScrollDownView", () => {
  jest.useFakeTimers();

  it("renders the content correctly", () => {
    const { getByText } = customRender(
      <ForceScrollDownView>
        <Text>Some content</Text>
      </ForceScrollDownView>
    );

    expect(getByText("Some content")).toBeDefined();
  });

  it("displays the scroll down button when necessary", () => {});

  it("scrolls to the bottom when the button is pressed", async () => {});
});

export const customRender = (
  component: React.ReactNode,
  options?: RenderOptions
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return render(<Provider store={store}>{component}</Provider>, options);
};
