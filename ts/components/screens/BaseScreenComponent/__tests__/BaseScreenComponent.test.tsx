import React from "react";
import { fireEvent } from "@testing-library/react-native";

import configureMockStore from "redux-mock-store";
import { some } from "fp-ts/lib/Option";
import { Store } from "redux";
import * as mixpanel from "../../../../mixpanel";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { applicationChangeState } from "../../../../store/actions/application";
import ROUTES from "../../../../navigation/routes";
import I18n from "../../../../i18n";

import BaseScreenComponent, { Props } from "../index";
import { BackendStatusState } from "../../../../store/reducers/backendStatus";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../definitions/content/Config";

jest.useFakeTimers();

const defaultProps: Props = {
  goBack: () => undefined,
  headerTitle: "a title"
};

describe("BaseScreenComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const state = {
    ...globalState,
    backendStatus: {
      status: some({
        config: { assistanceTool: { tool: ToolEnum.none } } as Config
      } as BackendStatus)
    } as BackendStatusState
  };
  describe("when the assistanceTool is instabug", () => {
    it("and contextualHelp is defined renders the help button", () => {
      const { component } = renderComponent(
        {
          ...defaultProps,
          contextualHelp: { title: "fake help", body: () => null }
        },
        mockStore({
          ...state,
          backendStatus: {
            status: some({
              config: { assistanceTool: { tool: ToolEnum.instabug } } as Config
            } as BackendStatus)
          } as BackendStatusState
        })
      );
      expect(
        component.getByA11yLabel(
          I18n.t("global.accessibility.contextualHelp.open.label")
        )
      ).toBeDefined();
    });

    it("and the contextualHelpMarkdown is defined renders the help button", () => {
      const { component } = renderComponent(
        {
          ...defaultProps,
          contextualHelpMarkdown: {
            title:
              "bonus.bonusVacanze.eligibility.activateBonus.contextualHelp.title",
            body: "bonus.bonusVacanze.eligibility.activateBonus.contextualHelp.body"
          }
        },
        mockStore({
          ...state,
          backendStatus: {
            status: some({
              config: { assistanceTool: { tool: ToolEnum.instabug } } as Config
            } as BackendStatus)
          } as BackendStatusState
        })
      );
      expect(
        component.getByA11yLabel(
          I18n.t("global.accessibility.contextualHelp.open.label")
        )
      ).toBeDefined();
    });
  });

  describe("when the help button is pressed", () => {
    describe("and the assistanceTool is instabug", () => {
      it("should show the contextual help modal", () => {
        const { component } = renderComponent(
          {
            ...defaultProps,
            contextualHelp: { title: "fake help", body: () => null }
          },
          mockStore({
            ...state,
            backendStatus: {
              status: some({
                config: {
                  assistanceTool: { tool: ToolEnum.instabug }
                } as Config
              } as BackendStatus)
            } as BackendStatusState
          })
        );
        const helpButton = component.getByA11yLabel(
          I18n.t("global.accessibility.contextualHelp.open.label")
        );
        fireEvent(helpButton, "onPress");
        expect(component.getByText("fake help")).toBeDefined();
      });

      it("should send the analytics OPEN_CONTEXTUAL_HELP event with the screen name", () => {
        const spy_mixpanelTrack = jest.spyOn(mixpanel, "mixpanelTrack");
        const { component } = renderComponent(
          {
            ...defaultProps,
            contextualHelp: { title: "fake help", body: () => null }
          },
          mockStore({
            ...state,
            backendStatus: {
              status: some({
                config: {
                  assistanceTool: { tool: ToolEnum.instabug }
                } as Config
              } as BackendStatus)
            } as BackendStatusState
          })
        );
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
});

function renderComponent(props = defaultProps, store: Store<GlobalState>) {
  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <BaseScreenComponent {...props} ref={undefined} />,
      ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
}
