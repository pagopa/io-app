import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../definitions/content/Config";
import * as zendeskActions from "../../../../features/zendesk/store/actions";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";

import BaseScreenComponent, { Props } from "../index";
import { MESSAGES_ROUTES } from "../../../../features/messages/navigation/routes";
import { RemoteConfigState } from "../../../../store/reducers/backendStatus/remoteConfig";

jest.useFakeTimers();

const defaultProps: Props = {
  goBack: () => undefined,
  headerTitle: "a title",
  hideBaseHeader: true
};

describe("BaseScreenComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const state = {
    ...globalState,
    remoteConfig: O.some({
      assistanceTool: { tool: ToolEnum.none }
    } as Config) as RemoteConfigState
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
          remoteConfig: O.some({
            assistanceTool: { tool },
            cgn: { enabled: true },
            newPaymentSection: {
              enabled: false,
              min_app_version: {
                android: "0.0.0.0",
                ios: "0.0.0.0"
              }
            },
            fims: { enabled: true },
            itw: {
              enabled: true,
              min_app_version: {
                android: "0.0.0.0",
                ios: "0.0.0.0"
              }
            }
          } as Config) as RemoteConfigState
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
        remoteConfig: O.some({
          assistanceTool: { tool: ToolEnum.zendesk },
          cgn: { enabled: true },
          newPaymentSection: {
            enabled: false,
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            }
          },
          fims: { enabled: true },
          itw: {
            enabled: true,
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            }
          }
        } as Config) as RemoteConfigState
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
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <BaseScreenComponent {...props} ref={undefined} />,
      MESSAGES_ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
}
