import { act } from "@testing-library/react-native";
import { ReactNode, Suspense, useState } from "react";
import { Action, createStore } from "redux";
import { fromPromise } from "xstate";

import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList.ts";
import { applicationChangeState } from "../../../../../../store/actions/application.ts";
import { startupLoadSuccess } from "../../../../../../store/actions/startup.ts";
import { appReducer } from "../../../../../../store/reducers";
import { StartupStatusEnum } from "../../../../../../store/reducers/startup.ts";
import { GlobalState } from "../../../../../../store/reducers/types.ts";
import { reproduceSequence } from "../../../../../../utils/tests.ts";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper.tsx";
import { identificationSuccess } from "../../../../../identification/store/actions/index.ts";
import { testRemoteDeps } from "../../../../machine/utils/testDeps";
import * as analytics from "../../analytics";
import { itwRemoteMachine } from "../../machine/machine.ts";
import { ItwRemoteMachineContext } from "../../machine/provider.tsx";
import { ItwRemoteParamsList } from "../../navigation/ItwRemoteParamsList.ts";
import { ITW_REMOTE_ROUTES } from "../../navigation/routes.ts";
import {
  ItwRemoteFlowType,
  ItwRemoteRequestPayload
} from "../../utils/itwRemoteTypeUtils.ts";
import { ItwRemoteRequestValidationScreen } from "../ItwRemoteRequestValidationScreen.tsx";

type ActorRef = ReturnType<typeof ItwRemoteMachineContext.useActorRef>;

jest.useFakeTimers();

// Same mechanism `freezeOnBlur` uses (react-freeze): suspend on a promise that never resolves
const neverResolves = new Promise<never>(() => undefined);
const Frozen = ({
  children,
  frozen
}: {
  children: ReactNode;
  frozen: boolean;
}) => {
  if (frozen) {
    throw neverResolves;
  }
  return children;
};

describe("ItwRemoteRequestValidationScreen", () => {
  it("should render the screen correctly", () => {
    const component = renderComponent({}, true, "same-device");
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

    const { getByTestId } = renderComponent(validPayload, true, "same-device");

    act(() => {
      expect(mockSend).toHaveBeenCalledWith({ type: "reset" });
      expect(mockSend).toHaveBeenCalledWith({
        type: "start",
        payload: validPayload,
        flowType: "same-device"
      });
      expect(getByTestId("loader")).toBeTruthy();
    });
  });

  it("should render failure screen if missing required fields", () => {
    const partialPayload = {
      request_uri: "https://example.com/callback"
    } as ItwRemoteRequestPayload;

    const { getByTestId } = renderComponent(
      partialPayload,
      true,
      "same-device"
    );

    expect(getByTestId("failure")).toBeTruthy();
  });

  it("should render failure screen if required fields are empty", () => {
    const partialPayload = {
      client_id: "",
      request_uri: "https://example.com/callback",
      state: "hyqizm592"
    } as ItwRemoteRequestPayload;

    const { getByTestId } = renderComponent(
      partialPayload,
      true,
      "same-device"
    );

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

    const { getByTestId } = renderComponent(validPayload, false, "same-device");

    act(() => {
      expect(mockSend).not.toHaveBeenCalled();
      expect(getByTestId("loader")).toBeTruthy();
    });
  });

  it("should track the remote start once across freezeOnBlur cycles", () => {
    const trackStart = jest.spyOn(analytics, "trackItwRemoteStart");
    const onSetFrozen = jest.fn();
    const FreezeToggle = ({ children }: { children: ReactNode }) => {
      const [frozen, setFrozen] = useState(false);
      onSetFrozen(setFrozen);
      return (
        <Suspense fallback={null}>
          <Frozen frozen={frozen}>{children}</Frozen>
        </Suspense>
      );
    };

    renderComponent({}, true, "same-device", FreezeToggle);
    act(() => {
      onSetFrozen.mock.lastCall[0](true);
    });
    act(() => {
      onSetFrozen.mock.lastCall[0](false);
    });

    expect(trackStart).toHaveBeenCalledTimes(1);
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

    const { getByTestId } = renderComponent(validPayload, true, "same-device");

    expect(getByTestId("loader")).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(getByTestId("timeout-loader")).toBeTruthy();
  });
});

const renderComponent = (
  payload: Partial<ItwRemoteRequestPayload> = {},
  isAuthenticated = true,
  flowType: ItwRemoteFlowType,
  Wrapper: (props: { children: ReactNode }) => ReactNode = ({ children }) =>
    children
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
    params: {
      ...payload,
      flowType
    }
  };

  const logic = itwRemoteMachine.provide({
    guards: {
      isItWalletL3Active: jest.fn().mockReturnValue(true)
    },
    actions: {
      navigateToClaimsDisclosureScreen: jest.fn(),
      onInit: jest.fn()
    },
    actors: {
      evaluateRelyingPartyTrust: fromPromise(jest.fn()),
      getRequestObject: fromPromise(jest.fn()),
      getPresentationDetails: fromPromise(jest.fn())
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwRemoteMachineContext.Provider
        logic={logic}
        options={{ input: { deps: testRemoteDeps() } }}
      >
        <Wrapper>
          <ItwRemoteRequestValidationScreen
            navigation={mockNavigation}
            route={route}
          />
        </Wrapper>
      </ItwRemoteMachineContext.Provider>
    ),
    ITW_REMOTE_ROUTES.REQUEST_VALIDATION,
    {
      ...payload,
      flowType
    },
    createStore(appReducer, globalState as any)
  );
};
