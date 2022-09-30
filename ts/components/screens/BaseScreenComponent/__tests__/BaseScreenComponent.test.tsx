import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";
import { Config } from "../../../../../definitions/content/Config";
import * as zendeskActions from "../../../../features/zendesk/store/actions";
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
      status: O.some({
        config: {
          assistanceTool: { tool: ToolEnum.none }
        } as Config
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
            status: O.some({
              config: {
                assistanceTool: { tool },
                cgn: { enabled: true },
                fims: { enabled: true }
              } as Config
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
          status: O.some({
            config: {
              assistanceTool: { tool: ToolEnum.zendesk },
              cgn: { enabled: true },
              fims: { enabled: true }
            } as Config
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
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <BaseScreenComponent {...props} ref={undefined} />,
      ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
}
