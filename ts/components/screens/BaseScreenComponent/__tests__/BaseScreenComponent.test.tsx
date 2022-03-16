import { fireEvent } from "@testing-library/react-native";
import { some } from "fp-ts/lib/Option";
import React from "react";
import { Store } from "redux";

import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";
import { Config } from "../../../../../definitions/content/Config";
import I18n from "../../../../i18n";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { BackendStatusState } from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";

import BaseScreenComponent, { Props } from "../index";

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
      /* We cannot test this case because we can't wait for the navigator to be initialized
      TODO: can be reactivated?
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
      */
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
