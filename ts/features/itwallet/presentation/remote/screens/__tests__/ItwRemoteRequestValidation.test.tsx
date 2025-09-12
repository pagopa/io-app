import { createStore, Action } from "redux";
import { fromPromise } from "xstate";
import { act } from "@testing-library/react-native";
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
import { identificationSuccess } from "../../../../../identification/store/actions/index.ts";
import { startupLoadSuccess } from "../../../../../../store/actions/startup.ts";
import { StartupStatusEnum } from "../../../../../../store/reducers/startup.ts";
import { reproduceSequence } from "../../../../../../utils/tests.ts";

type ActorRef = ReturnType<typeof ItwRemoteMachineContext.useActorRef>;

jest.useFakeTimers();

describe("ItwRemoteRequestValidationScreen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  it("should render the loading screen and start the machine if payload is valid", () => {
    const validPayload: ItwRemoteRequestPayload = {
      client_id: "abc123xy",
      request_uri: "https://example.com/callback",
      state: "hyqizm592",
      request_uri_method: "get"
    };

    const mockSend = jest.fn();

    jest
      .spyOn(ItwRemoteMachineContext, "useActorRef")
      .mockReturnValue({ send: mockSend } as unknown as ActorRef);

    const { getByTestId } = renderComponent(validPayload);

    act(() => {
      expect(mockSend).toHaveBeenCalledWith({ type: "reset" });
      expect(mockSend).toHaveBeenCalledWith({
        type: "start",
        payload: validPayload
      });
      expect(getByTestId("loader")).toBeTruthy();
    });
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

  it("should render the loading screen and not start the machine if the user is not authenticated", () => {
    const validPayload = {
      client_id: "abc123xy",
      request_uri: "https://example.com/callback",
      state: "hyqizm592"
    } as ItwRemoteRequestPayload;

    const mockSend = jest.fn();
    jest
      .spyOn(ItwRemoteMachineContext, "useActorRef")
      .mockReturnValue({ send: mockSend } as unknown as ActorRef);

    const { getByTestId } = renderComponent(validPayload, false);

    act(() => {
      expect(mockSend).not.toHaveBeenCalled();
      expect(getByTestId("loader")).toBeTruthy();
    });
  });

  it("should change the loading text after timeout", async () => {
    const validPayload: ItwRemoteRequestPayload = {
      client_id: "abc123xy",
      request_uri: "https://example.com/callback",
      state: "hyqizm592",
      request_uri_method: "get"
    };

    const mockSend = jest.fn();

    jest
      .spyOn(ItwRemoteMachineContext, "useActorRef")
      .mockReturnValue({ send: mockSend } as unknown as ActorRef);

    const { getByTestId } = renderComponent(validPayload);

    expect(getByTestId("loader")).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(getByTestId("timeout-loader")).toBeTruthy();
  });
});

const renderComponent = (
  payload: Partial<ItwRemoteRequestPayload> = {},
  isAuthenticated = true
) => {
  const sequenceOfActions: ReadonlyArray<Action> = [
    applicationChangeState("active"),
    ...(isAuthenticated
      ? [
          startupLoadSuccess(StartupStatusEnum.AUTHENTICATED),
          identificationSuccess({ isBiometric: true })
        ]
      : [])
  ];

  const globalState = reproduceSequence(
    {} as GlobalState,
    appReducer,
    sequenceOfActions
  );

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
      isItWalletL3Active: jest.fn().mockReturnValue(true),
      isEidExpired: jest.fn().mockReturnValue(false)
    },
    actions: {
      navigateToClaimsDisclosureScreen: jest.fn()
    },
    actors: {
      evaluateRelyingPartyTrust: fromPromise(jest.fn()),
      getRequestObject: fromPromise(jest.fn()),
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
