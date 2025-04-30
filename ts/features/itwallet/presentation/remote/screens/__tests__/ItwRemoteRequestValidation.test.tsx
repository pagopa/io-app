import { createStore } from "redux";
import { fromPromise } from "xstate";
import { ITW_REMOTE_ROUTES } from "../../navigation/routes.ts";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper.tsx";
import { GlobalState } from "../../../../../../store/reducers/types.ts";
import { ItwRemoteRequestValidationScreen } from "../ItwRemoteRequestValidationScreen.tsx";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application.ts";
import { ItwRemoteRequestPayload } from "../../utils/itwRemoteTypeUtils.ts";
import { ItwRemoteMachineContext } from "../../machine/provider.tsx";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList.ts";
import { ItwRemoteParamsList } from "../../navigation/ItwRemoteParamsList.ts";
import { itwRemoteMachine } from "../../machine/machine.ts";

describe("ItwRemoteRequestValidationScreen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  it("should render the loading screen if payload is valid", () => {
    const validPayload = {
      client_id: "abc123xy",
      request_uri: "https://example.com/callback",
      state: "hyqizm592"
    } as ItwRemoteRequestPayload;

    const { getByTestId } = renderComponent(validPayload);

    expect(getByTestId("loader")).toBeTruthy();
  });

  it("should render failure screen if missing required fields", () => {
    const partialPayload = {
      request_uri: "https://example.com/callback"
    } as ItwRemoteRequestPayload;

    const { getByTestId } = renderComponent(partialPayload);

    expect(getByTestId("failure")).toBeTruthy();
  });

  it("should render failure screen if required fields are empty", () => {
    const partialPayload = {
      client_id: "",
      request_uri: "https://example.com/callback",
      state: "hyqizm592"
    } as ItwRemoteRequestPayload;

    const { getByTestId } = renderComponent(partialPayload);

    expect(getByTestId("failure")).toBeTruthy();
  });

  const renderComponent = (payload: Partial<ItwRemoteRequestPayload> = {}) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const mockNavigation = new Proxy(
      {},
      {
        get: _ => jest.fn()
      }
    ) as unknown as IOStackNavigationProp<
      ItwRemoteParamsList,
      "ITW_REMOTE_REQUEST_VALIDATION"
    >;

    const route = {
      key: "ITW_REMOTE_REQUEST_VALIDATION",
      name: ITW_REMOTE_ROUTES.REQUEST_VALIDATION,
      params: payload
    };

    const logic = itwRemoteMachine.provide({
      guards: {
        isWalletActive: jest.fn().mockReturnValue(true),
        isEidExpired: jest.fn().mockReturnValue(false)
      },
      actions: {
        navigateToClaimsDisclosureScreen: jest.fn()
      },
      actors: {
        evaluateRelyingPartyTrust: fromPromise(jest.fn()),
        getPresentationDetails: fromPromise(jest.fn())
      }
    });

    return renderScreenWithNavigationStoreContext<GlobalState>(
      () => (
        <ItwRemoteMachineContext.Provider logic={logic}>
          <ItwRemoteRequestValidationScreen
            navigation={mockNavigation}
            route={route}
          />
        </ItwRemoteMachineContext.Provider>
      ),
      ITW_REMOTE_ROUTES.REQUEST_VALIDATION,
      payload,
      createStore(appReducer, globalState as any)
    );
  };
});
