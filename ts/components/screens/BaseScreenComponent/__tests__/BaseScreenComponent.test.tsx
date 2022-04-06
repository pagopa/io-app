import React from "react";
import { NavigationParams } from "react-navigation";
import { fireEvent } from "@testing-library/react-native";

import configureMockStore from "redux-mock-store";
import { some } from "fp-ts/lib/Option";
import { Store } from "redux";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { applicationChangeState } from "../../../../store/actions/application";
import ROUTES from "../../../../navigation/routes";

import BaseScreenComponent, { Props } from "../index";
import { BackendStatusState } from "../../../../store/reducers/backendStatus";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../definitions/content/Config";
import * as zendeskActions from "../../../../features/zendesk/store/actions";

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

  it.each`
    tool
    ${ToolEnum.instabug}
    ${ToolEnum.web}
    ${ToolEnum.none}
  `(
    "when the assistanceTool is $tool the help button should not be rendered",
    ({ tool }) => {
      const { component } = renderComponent(
        defaultProps,
        mockStore({
          ...state,
          backendStatus: {
            status: some({
              config: { assistanceTool: { tool } } as Config
            } as BackendStatus)
          } as BackendStatusState
        })
      );
      expect(component.queryByTestId("helpButton")).toBeNull();
    }
  );

  describe("when the assistanceTool is zendesk", () => {
    const { component } = renderComponent(
      defaultProps,
      mockStore({
        ...state,
        backendStatus: {
          status: some({
            config: { assistanceTool: { tool: ToolEnum.zendesk } } as Config
          } as BackendStatus)
        } as BackendStatusState
      })
    );
    const helpButton = component.queryByTestId("helpButton");
    it("should render the help button", () => {
      expect(helpButton).toBeDefined();
    });
    it("should dispatch the zendeskSupportStart action when the help button is pressed", () => {
      const zendeskSupportStartSpy = jest.spyOn(
        zendeskActions,
        "zendeskSupportStart"
      );
      if (helpButton) {
        fireEvent(helpButton, "onPress");
        expect(zendeskSupportStartSpy).toBeCalled();
      }
    });
  });
});

function renderComponent(props = defaultProps, store: Store<GlobalState>) {
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
