import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwIdentificationModeSelectionScreen } from "../ItwIdentificationModeSelectionScreen";
import { RemoteConfigState } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { Config } from "../../../../../../definitions/content/Config";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwLifecycleState } from "../../../lifecycle/store/reducers";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";

jest.mock("../../../../../config", () => ({
  itwEnabled: true
}));

jest.mock("../../../machine/eid/selectors", () => ({
  isCIEAuthenticationSupportedSelector: () => true
}));

describe("ItwIdentificationModeSelectionScreen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent({});
    expect(component).toBeTruthy();
  });

  it("should show all authentication methods when none are disabled", () => {
    const component = renderComponent({});

    expect(component.queryByTestId("Spid")).not.toBeNull();
    expect(component.queryByTestId("CiePin")).not.toBeNull();
    expect(component.queryByTestId("CieID")).not.toBeNull();
  });

  it("should not show CiePin method when it is disabled", () => {
    const component = renderComponent({
      disabledIdentificationMethods: ["CiePin"]
    });

    expect(component.queryByTestId("Spid")).not.toBeNull();
    expect(component.queryByTestId("CiePin")).toBeNull();
    expect(component.queryByTestId("CieID")).not.toBeNull();
  });

  it("should not show SPID method when it is disabled", () => {
    const component = renderComponent({
      disabledIdentificationMethods: ["SPID"]
    });

    expect(component.queryByTestId("Spid")).toBeNull();
    expect(component.queryByTestId("CiePin")).not.toBeNull();
    expect(component.queryByTestId("CieID")).not.toBeNull();
  });

  it("should not show CieId method when it is disabled", () => {
    const component = renderComponent({
      disabledIdentificationMethods: ["CieID"]
    });

    expect(component.queryByTestId("Spid")).not.toBeNull();
    expect(component.queryByTestId("CiePin")).not.toBeNull();
    expect(component.queryByTestId("CieID")).toBeNull();
  });

  type RenderOptions = {
    isIdPayEnabled?: boolean;
    isItwEnabled?: boolean;
    isItwTestEnabled?: boolean;
    itwLifecycle?: ItwLifecycleState;
    disabledIdentificationMethods?: Array<string>;
    isCieSupported?: pot.Pot<boolean, Error>;
  };

  const renderComponent = ({
    isItwEnabled = true,
    itwLifecycle = ItwLifecycleState.ITW_LIFECYCLE_VALID,
    disabledIdentificationMethods,
    isCieSupported = pot.some(true)
  }: RenderOptions) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(
      _.merge(undefined, globalState, {
        features: {
          itWallet: {
            lifecycle: itwLifecycle,
            ...(itwLifecycle === ItwLifecycleState.ITW_LIFECYCLE_VALID && {
              credentials: { eid: O.some({}) },
              issuance: { integrityKeyTag: O.some("key-tag") },
              identification: {
                isCieSupported
              }
            })
          }
        },
        remoteConfig: O.some({
          itw: {
            enabled: isItwEnabled,
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            },
            disabled_identification_methods: disabledIdentificationMethods
          },
          assistanceTool: { tool: ToolEnum.none },
          cgn: { enabled: true },
          newPaymentSection: {
            enabled: false,
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            }
          }
        } as Config) as RemoteConfigState
      } as GlobalState)
    );

    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn()
      }
    });

    return renderScreenWithNavigationStoreContext<GlobalState>(
      () => (
        <ItwEidIssuanceMachineContext.Provider logic={logic}>
          <ItwIdentificationModeSelectionScreen />
        </ItwEidIssuanceMachineContext.Provider>
      ),
      ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      {},
      store
    );
  };
});
