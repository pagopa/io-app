import React from "react";
import { NavigationParams } from "react-navigation";
import { Text } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../store/actions/application";
// import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../utils/testWrapper";
import ROUTES from "../../navigation/routes";
import { appReducer } from "../../store/reducers";
import ContextualHelpComponent from "../ContextualHelpComponent";
import { ContextualHelpData } from "../ContextualHelpModal";

jest.useFakeTimers();

const options = {
  contextualHelpData: {
    title: "a title",
    content: null
  },
  onClose: jest.fn(),
  isContentLoaded: true,
  onRequestAssistance: jest.fn()
};

describe("ContextualHelpComponent", () => {
  it("should render the title", () => {
    expect(
      renderComponent(options).getByText(options.contextualHelpData.title)
    ).toBeDefined();
  });

  describe("when the title is an empty string", () => {
    const contextualHelpData: ContextualHelpData = {
      ...options.contextualHelpData,
      title: ""
    };
    it("should not render the title", () => {
      expect(
        renderComponent({ ...options, contextualHelpData }).queryByText(
          options.contextualHelpData.title
        )
      ).toBeNull();
    });
  });

  describe("when the content is defined and not null", () => {
    const contextualHelpData: ContextualHelpData = {
      title: "THIS VERY TITLE",
      content: <Text>{"the content"}</Text>
    };

    it("should render the content", () => {
      expect(
        renderComponent({ ...options, contextualHelpData }).getByText(
          "the content"
        )
      ).toBeDefined();
    });

    it("should render the title", () => {
      expect(
        renderComponent({ ...options, contextualHelpData }).getByText(
          contextualHelpData.title
        )
      ).toBeDefined();
    });
  });

  describe("when the content is not defined", () => {
    const contextualHelpData: ContextualHelpData = {
      title: "MUST NEVER SHOW",
      content: undefined
    };

    it("should render the loader", () => {
      expect(
        renderComponent({
          ...options,
          contextualHelpData
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        }).getByTestId("rn-activity-indicator")
      ).toBeDefined();
    });
  });

  describe("when the faqs are defined", () => {
    const contextualHelpData: ContextualHelpData = {
      ...options.contextualHelpData,
      faqs: [{ title: "FAQ", content: "U" }]
    };
    it("should render the FAQs", () => {
      expect(
        renderComponent({
          ...options,
          contextualHelpData
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        }).getByText(contextualHelpData.faqs![0].title)
      ).toBeDefined();
    });
  });
});

function renderComponent(
  props: React.ComponentProps<typeof ContextualHelpComponent>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <ContextualHelpComponent {...props} />,
    ROUTES.WALLET_CHECKOUT_3DS_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
}
