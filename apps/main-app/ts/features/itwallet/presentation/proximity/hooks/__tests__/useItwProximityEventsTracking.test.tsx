import { renderHook } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { testProximityDeps } from "../../../../machine/utils/testDeps";
import * as analytics from "../../analytics";
import { ProximityFlow } from "../../analytics/types";
import { ProximityFailure, ProximityFailureType } from "../../machine/failure";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import {
  MissingCredentialError,
  TimeoutError,
  UntrustedRpError
} from "../../utils/errors";
import { useItwProximityEventsTracking } from "../useItwProximityEventsTracking";

type EngagementScenario = {
  engagementMode: "nfc" | "qrcode";
  proximityFlow: ProximityFlow;
};

const engagementScenarios: ReadonlyArray<EngagementScenario> = [
  { engagementMode: "qrcode", proximityFlow: "qr_code" },
  { engagementMode: "nfc", proximityFlow: "nfc" }
];

const failureScenarios = [
  {
    name: "MISSING_CREDENTIALS",
    failure: {
      type: ProximityFailureType.MISSING_CREDENTIALS,
      reason: new MissingCredentialError(["org.iso.18013.5.1.mDL"])
    },
    trackFn: "trackItwProximityMandatoryCredentialMissing"
  },
  {
    name: "RELYING_PARTY_GENERIC",
    failure: {
      type: ProximityFailureType.RELYING_PARTY_GENERIC,
      reason: new Error("RP generic error")
    },
    trackFn: "trackItwProximityRPGenericFailure"
  },
  {
    name: "TIMEOUT",
    failure: {
      type: ProximityFailureType.TIMEOUT,
      reason: new TimeoutError("Request timed out")
    },
    trackFn: "trackItwProximityTimeout"
  },
  {
    name: "UNEXPECTED",
    failure: {
      type: ProximityFailureType.UNEXPECTED,
      reason: new Error("Unexpected error")
    },
    trackFn: "trackItwProximityUnexpectedFailure"
  },
  {
    name: "UNTRUSTED_RP",
    failure: {
      type: ProximityFailureType.UNTRUSTED_RP,
      reason: new UntrustedRpError("Untrusted RP")
    },
    trackFn: "trackItwProximityRpNotTrusted"
  }
] as const satisfies ReadonlyArray<{
  failure: ProximityFailure;
  name: string;
  trackFn: keyof typeof analytics;
}>;

const scenarios = failureScenarios.flatMap(failureScenario =>
  engagementScenarios.map(engagementScenario => ({
    ...failureScenario,
    ...engagementScenario
  }))
);

describe("useItwProximityEventsTracking", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each(scenarios)(
    "tracks $name with proximity_flow $proximityFlow",
    ({ failure, trackFn, engagementMode, proximityFlow }) => {
      const track = jest.spyOn(analytics, trackFn).mockImplementation();

      renderTrackingHook(failure, engagementMode);

      expect(track).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({ proximity_flow: proximityFlow })
      );
    }
  );
});

const renderTrackingHook = (
  failure: ProximityFailure,
  engagementMode: EngagementScenario["engagementMode"]
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const initialSnapshot = createActor(itwProximityMachine, {
    input: { deps: testProximityDeps({ store }) }
  }).getSnapshot();

  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: { Failure: "Idle" },
    context: { ...initialSnapshot.context, engagementMode, failure }
  };

  const wrapper = ({ children }: PropsWithChildren) => (
    <ItwProximityMachineContext.Provider options={{ snapshot }}>
      {children}
    </ItwProximityMachineContext.Provider>
  );

  return renderHook(() => useItwProximityEventsTracking({ failure }), {
    wrapper
  });
};
