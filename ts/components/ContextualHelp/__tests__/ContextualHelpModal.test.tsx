import React from "react";
import { NavigationParams } from "react-navigation";
import { Text } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../store/actions/application";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import ROUTES from "../../../navigation/routes";
import { appReducer } from "../../../store/reducers";
import ContextualHelpModal from "../ContextualHelpModal";

jest.useFakeTimers();
jest.mock("../../ui/Markdown");

// const options: React.ComponentProps<typeof ContextualHelpModal> = {
const options = {
  body: () => <Text>{"the body!"}</Text>,
  close: jest.fn(),
  contentLoaded: true,
  faqCategories: undefined,
  isVisible: true,
  modalAnimation: "none" as any,
  onLinkClicked: jest.fn(),
  onRequestAssistance: jest.fn(),
  shouldAskForScreenshotWithInitialValue: undefined,
  title: "contextual help modal"
};

describe("ContextualHelpModal", () => {
  beforeEach(() => {
    options.close.mockReset();
  });

  it("should render the title", () => {
    expect(renderComponent(options).getByText(options.title)).toBeDefined();
  });
});

function renderComponent(
  props: React.ComponentProps<typeof ContextualHelpModal>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <ContextualHelpModal {...props} />,
    ROUTES.WALLET_CHECKOUT_3DS_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
}
