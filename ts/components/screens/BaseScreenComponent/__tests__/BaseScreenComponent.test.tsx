import React from "react";
import { NavigationParams } from "react-navigation";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";

import * as mixpanel from "../../../../mixpanel";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { applicationChangeState } from "../../../../store/actions/application";
import ROUTES from "../../../../navigation/routes";
import I18n from "../../../../i18n";

import BaseScreenComponent, { Props } from "../index";

jest.useFakeTimers();

const defaultProps: Props = {
  goBack: () => undefined,
  headerTitle: "a title"
};

describe("BaseScreenComponent", () => {
  it("renders the help button when contextualHelp is defined", () => {
    const { component } = renderComponent({
      ...defaultProps,
      contextualHelp: { title: "fake help", body: () => null }
    });
    expect(
      component.getByA11yLabel(
        I18n.t("global.accessibility.contextualHelp.open.label")
      )
    ).toBeDefined();
  });

  it("renders the help button when contextualHelpMarkdown is defined", () => {
    const { component } = renderComponent({
      ...defaultProps,
      contextualHelpMarkdown: {
        title:
          "bonus.bonusVacanze.eligibility.activateBonus.contextualHelp.title",
        body: "bonus.bonusVacanze.eligibility.activateBonus.contextualHelp.body"
      }
    });
    expect(
      component.getByA11yLabel(
        I18n.t("global.accessibility.contextualHelp.open.label")
      )
    ).toBeDefined();
  });

  describe("when the help button is pressed", () => {
    it("should show the contextual help modal", () => {
      const { component } = renderComponent({
        ...defaultProps,
        contextualHelp: { title: "fake help", body: () => null }
      });
      const helpButton = component.getByA11yLabel(
        I18n.t("global.accessibility.contextualHelp.open.label")
      );
      fireEvent(helpButton, "onPress");
      expect(component.getByText("fake help")).toBeDefined();
    });

    it("should send the analytics OPEN_CONTEXTUAL_HELP event with the screen name", () => {
      const spy_mixpanelTrack = jest.spyOn(mixpanel, "mixpanelTrack");
      const { component } = renderComponent({
        ...defaultProps,
        contextualHelp: { title: "fake help", body: () => null }
      });
      const helpButton = component.getByA11yLabel(
        I18n.t("global.accessibility.contextualHelp.open.label")
      );
      fireEvent(helpButton, "onPress");
      expect(spy_mixpanelTrack).toHaveBeenCalledWith("OPEN_CONTEXTUAL_HELP", {
        SCREEN_NAME: ROUTES.MESSAGES_HOME
      });
    });
  });
});

function renderComponent(props = defaultProps) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      () => <BaseScreenComponent {...props} ref={undefined} />,
      ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
}
