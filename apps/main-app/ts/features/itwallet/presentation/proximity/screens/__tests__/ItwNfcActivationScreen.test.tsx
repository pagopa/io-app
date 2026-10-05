import { act, fireEventAsync } from "@testing-library/react-native";
import I18n from "i18next";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { createStore } from "redux";
import { ActorRefFrom, createActor, fromCallback, fromPromise } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContextAsync } from "../../../../../../utils/testWrapper";
import { testProximityDeps } from "../../../../machine/utils/testDeps";
import {
  trackItwProximityNfcActivationClose,
  trackItwProximityNfcGoToSettings
} from "../../analytics";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import { checkNfcActivation, openNfcPreferences } from "../../utils/nfc";
import { ItwNfcActivationScreen } from "../ItwNfcActivationScreen";

jest.mock("../../utils/nfc", () => ({
  checkNfcActivation: jest.fn(),
  openNfcPreferences: jest.fn()
}));

jest.mock("../../analytics", () => ({
  trackItwProximityNfcActivation: jest.fn(),
  trackItwProximityNfcActivationClose: jest.fn(),
  trackItwProximityNfcGoToSettings: jest.fn()
}));

const startEngagement = jest.fn();
const navigateToNfcPresentmentScreen = jest.fn();
const navigateToNfcActivationScreen = jest.fn();
const observeMachine = jest.fn<
  void,
  [ActorRefFrom<typeof itwProximityMachine>]
>();
const mockedMachine = itwProximityMachine.provide({
  actions: {
    onInit: () => undefined,
    navigateToNfcPresentmentScreen,
    navigateToNfcActivationScreen
  },
  actors: {
    startEngagement: fromPromise(startEngagement),
    proximityCommunicationLogic: fromCallback(() => () => undefined)
  }
});

const ObservedScreen = () => {
  const actor = ItwProximityMachineContext.useActorRef();
  useEffect(() => observeMachine(actor), [actor]);
  return <ItwNfcActivationScreen />;
};

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    (state: typeof initialState = initialState, action) =>
      appReducer(state, action)
  );
  const input = { deps: testProximityDeps({ store }) };
  const initialSnapshot = createActor(mockedMachine, { input }).getSnapshot();
  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: { Nfc: "RequireActivation" }
  };

  return renderScreenWithNavigationStoreContextAsync(
    () => (
      <ItwProximityMachineContext.Provider
        logic={mockedMachine}
        options={{ input, snapshot }}
      >
        <ObservedScreen />
      </ItwProximityMachineContext.Provider>
    ),
    ITW_PROXIMITY_ROUTES.NFC_ACTIVATION,
    {},
    store
  );
};

const continueLabel = I18n.t(
  "features.itWallet.presentation.proximity.nfc.activation.actions.secondary"
);

describe("ItwNfcActivationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(Platform, "OS", "ios");
    jest.mocked(checkNfcActivation).mockResolvedValue(true);
    startEngagement.mockResolvedValue(undefined);
    jest.spyOn(Alert, "alert").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    { name: "reader availability is true", available: true },
    { name: "reader availability is false", available: false }
  ])("iOS waits for native startup when $name", async ({ available }) => {
    jest.mocked(checkNfcActivation).mockResolvedValue(available);
    const component = await renderComponent();
    expect(Alert.alert).not.toHaveBeenCalled();

    await fireEventAsync.press(component.getByText(continueLabel));

    expect(checkNfcActivation).not.toHaveBeenCalled();
    expect(startEngagement).toHaveBeenCalledTimes(1);
    expect(navigateToNfcPresentmentScreen).not.toHaveBeenCalled();
    expect(component.getByText(continueLabel)).toBeDisabled();
    expect(Alert.alert).not.toHaveBeenCalled();
    await fireEventAsync.press(component.getByText(continueLabel));
    expect(startEngagement).toHaveBeenCalledTimes(1);

    const actor = observeMachine.mock.calls[0][0];
    await act(async () => actor.send({ type: "nfc-started" }));

    expect(navigateToNfcPresentmentScreen).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test.each([
    {
      name: "denied",
      event: {
        type: "device-error",
        error: new Error("NFC HCE Failed to start")
      }
    },
    { name: "stopped", event: { type: "nfc-stopped" } }
  ] as const)(
    "iOS shows the native activation alert when startup is $name",
    async ({ event }) => {
      const component = await renderComponent();
      await fireEventAsync.press(component.getByText(continueLabel));
      const actor = observeMachine.mock.calls[0][0];

      await act(async () => actor.send(event));

      expect(navigateToNfcPresentmentScreen).not.toHaveBeenCalled();
      expect(navigateToNfcActivationScreen).toHaveBeenCalledTimes(1);
      expect(component.getByText(continueLabel)).toBeEnabled();
      expect(Alert.alert).toHaveBeenCalledWith(
        I18n.t(
          "features.itWallet.presentation.proximity.nfc.activation.alert.title"
        ),
        I18n.t(
          "features.itWallet.presentation.proximity.nfc.activation.alert.message"
        ),
        expect.any(Array)
      );
      await act(async () => actor.send(event));
      expect(Alert.alert).toHaveBeenCalledTimes(1);

      const buttons = jest.mocked(Alert.alert).mock.calls[0][2];
      await act(async () => buttons?.[0].onPress?.());
      expect(openNfcPreferences).toHaveBeenCalledTimes(1);
      expect(trackItwProximityNfcGoToSettings).toHaveBeenCalledTimes(1);

      await act(async () => buttons?.[1].onPress?.());
      expect(trackItwProximityNfcActivationClose).toHaveBeenCalledTimes(1);
      expect(actor.getSnapshot().context.engagementMode).toBe("qrcode");
    }
  );

  it("iOS shows the alert even when the startup promise rejects immediately", async () => {
    startEngagement.mockRejectedValueOnce(new Error("NFC startup failed"));
    const component = await renderComponent();

    await fireEventAsync.press(component.getByText(continueLabel));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(navigateToNfcPresentmentScreen).not.toHaveBeenCalled();
    expect(component.getByText(continueLabel)).toBeEnabled();
  });

  it("does not show an activation alert after a successful Continue attempt", async () => {
    const component = await renderComponent();
    await fireEventAsync.press(component.getByText(continueLabel));
    const actor = observeMachine.mock.calls[0][0];
    await act(async () => actor.send({ type: "nfc-started" }));

    await act(async () => actor.send({ type: "start-nfc-presentment" }));
    await act(async () =>
      actor.send({
        type: "device-error",
        error: new Error("A later NFC startup failed")
      })
    );

    expect(navigateToNfcActivationScreen).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test.each([
    { name: "enabled", available: true },
    { name: "disabled", available: false }
  ])("Android still checks whether NFC is $name", async ({ available }) => {
    jest.replaceProperty(Platform, "OS", "android");
    jest.mocked(checkNfcActivation).mockResolvedValue(available);
    const component = await renderComponent();

    await fireEventAsync.press(component.getByText(continueLabel));

    expect(checkNfcActivation).toHaveBeenCalledTimes(1);
    expect(startEngagement).toHaveBeenCalledTimes(available ? 1 : 0);
    expect(Alert.alert).toHaveBeenCalledTimes(available ? 0 : 1);
  });
});
