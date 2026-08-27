import {
  assign,
  type DoneActorEvent,
  type ErrorActorEvent,
  fromPromise
} from "xstate";
import { getShortestPaths } from "xstate/graph";

import {
  type CredentialMetadata,
  type RequestObject,
  type WalletInstanceAttestations
} from "../../../../common/utils/itwTypesUtils.ts";
import {
  type EnrichedPresentationDetails,
  type ItwRemoteRequestPayload,
  type RelyingPartyConfiguration
} from "../../utils/itwRemoteTypeUtils.ts";
import {
  type EvaluateRelyingPartyTrustInput,
  type EvaluateRelyingPartyTrustOutput,
  type GetPresentationDetailsInput,
  type GetPresentationDetailsOutput,
  type GetRequestObjectInput,
  type GetRequestObjectOutput,
  type SendAuthorizationResponseInput,
  type SendAuthorizationResponseOutput
} from "../actors.ts";
import { type RemoteEvents } from "../events.ts";
import { itwRemoteMachine } from "../machine.ts";

const MAX_TRAVERSAL_STATES = 128;
const INVOKE_INDEX = 0;
const MODEL_FAILURE = new Error("Model actor failure");
const MODEL_REQUEST_OBJECT_JWT = "model-request-object-jwt";
const MODEL_REDIRECT_URI = "https://relying-party.example/redirect";
const MODEL_PRESENTED_KEY_TAGS = ["model-key-tag"];
const MODEL_WALLET_INSTANCE_ATTESTATION: WalletInstanceAttestations = {
  jwt: "model-wallet-instance-attestation"
};
const MODEL_CREDENTIALS: Record<string, CredentialMetadata> = {};
const MODEL_RELYING_PARTY_CONFIGURATION = {} as RelyingPartyConfiguration;
const MODEL_REQUEST_OBJECT = {} as RequestObject;
const MODEL_PRESENTATION_DETAILS = [] as EnrichedPresentationDetails;
const MODEL_START_PAYLOAD: ItwRemoteRequestPayload = {
  client_id: "https://relying-party.example",
  request_uri: "https://relying-party.example/request",
  request_uri_method: "get",
  state: "model-state"
};

type InvokedState =
  | "EvaluatingRelyingPartyTrust"
  | "GettingPresentationDetails"
  | "GettingRequestObject"
  | "SendingAuthorizationResponse";

const getInvokeId = (state: InvokedState) =>
  `${INVOKE_INDEX}.${itwRemoteMachine.id}.${state}`;

const getDoneActorEvent = (
  state: InvokedState,
  output: unknown
): DoneActorEvent => {
  const actorId = getInvokeId(state);
  return {
    actorId,
    output,
    type: `xstate.done.actor.${actorId}`
  };
};

const getErrorActorEvent = (state: InvokedState): RemoteEvents => {
  const actorId = getInvokeId(state);
  const event: ErrorActorEvent = {
    actorId,
    error: MODEL_FAILURE,
    type: `xstate.error.actor.${actorId}`
  };

  return event as unknown as RemoteEvents;
};

const modelEvents: ReadonlyArray<RemoteEvents> = [
  {
    type: "start",
    flowType: "cross-device",
    payload: MODEL_START_PAYLOAD
  },
  { type: "holder-consent" },
  getDoneActorEvent("EvaluatingRelyingPartyTrust", {
    rpConf: MODEL_RELYING_PARTY_CONFIGURATION
  }),
  getErrorActorEvent("EvaluatingRelyingPartyTrust"),
  getDoneActorEvent("GettingRequestObject", MODEL_REQUEST_OBJECT_JWT),
  getErrorActorEvent("GettingRequestObject"),
  getDoneActorEvent("GettingPresentationDetails", {
    presentationDetails: MODEL_PRESENTATION_DETAILS,
    requestObject: MODEL_REQUEST_OBJECT
  }),
  getErrorActorEvent("GettingPresentationDetails"),
  getDoneActorEvent("SendingAuthorizationResponse", {
    presentedKeyTags: MODEL_PRESENTED_KEY_TAGS,
    redirectUri: MODEL_REDIRECT_URI
  }),
  getErrorActorEvent("SendingAuthorizationResponse")
];

const noOp = () => undefined;

const modelMachine = itwRemoteMachine.provide({
  actions: {
    closePresentation: noOp,
    consumePresentedBatchCredentials: noOp,
    handleSessionExpired: noOp,
    navigateToAuthResponseScreen: noOp,
    navigateToBarcodeScanScreen: noOp,
    navigateToClaimsDisclosureScreen: noOp,
    navigateToDiscoveryScreen: noOp,
    navigateToFailureScreen: noOp,
    navigateToIdentificationModeScreen: noOp,
    onInit: assign({
      credentials: MODEL_CREDENTIALS,
      walletInstanceAttestation: MODEL_WALLET_INSTANCE_ATTESTATION
    }),
    storeWalletInstanceAttestation: noOp,
    trackRemoteDataShare: noOp
  },
  actors: {
    evaluateRelyingPartyTrust: fromPromise<
      EvaluateRelyingPartyTrustOutput,
      EvaluateRelyingPartyTrustInput
    >(async () => ({ rpConf: MODEL_RELYING_PARTY_CONFIGURATION })),
    getPresentationDetails: fromPromise<
      GetPresentationDetailsOutput,
      GetPresentationDetailsInput
    >(async () => ({
      presentationDetails: MODEL_PRESENTATION_DETAILS,
      requestObject: MODEL_REQUEST_OBJECT
    })),
    getRequestObject: fromPromise<
      GetRequestObjectOutput,
      GetRequestObjectInput
    >(async () => MODEL_REQUEST_OBJECT_JWT),
    getWalletAttestation: fromPromise<WalletInstanceAttestations>(
      async () => MODEL_WALLET_INSTANCE_ATTESTATION
    ),
    sendAuthorizationResponse: fromPromise<
      SendAuthorizationResponseOutput,
      SendAuthorizationResponseInput
    >(async () => ({
      presentedKeyTags: MODEL_PRESENTED_KEY_TAGS,
      redirectUri: MODEL_REDIRECT_URI
    }))
  },
  guards: {
    hasValidWalletInstanceAttestation: () => true,
    isItWalletL3Active: () => true,
    isOpenIdFederationClient: () => true,
    isSessionExpired: () => false,
    isX509HashClient: () => false
  }
});

const isModelEvent = (_snapshot: unknown, event: RemoteEvents) =>
  event.type === "start" ||
  event.type === "holder-consent" ||
  event.type.startsWith("xstate.done.actor.") ||
  event.type.startsWith("xstate.error.actor.");

const getPathsTo = (target: "Failure" | "Success") =>
  getShortestPaths(modelMachine, {
    events: modelEvents,
    filterEvents: isModelEvent,
    limit: MAX_TRAVERSAL_STATES,
    toState: snapshot => snapshot.matches(target)
  });

describe("itwRemoteMachine model", () => {
  it("reaches the successful presentation state through the complete flow", () => {
    const [successPath] = getPathsTo("Success");

    expect(successPath).toBeDefined();
    expect(successPath.state.matches("Success")).toBe(true);
    expect(successPath.steps.map(step => step.state.value)).toStrictEqual([
      "Idle",
      "EvaluatingRelyingPartyTrust",
      "GettingRequestObject",
      "GettingPresentationDetails",
      "ClaimsDisclosure",
      "SendingAuthorizationResponse",
      "Success"
    ]);
  });

  it("reaches failure from every remote actor boundary", () => {
    const failureSources = getPathsTo("Failure").map(
      path => path.steps.at(-2)?.state.value
    );

    expect(new Set(failureSources)).toStrictEqual(
      new Set<InvokedState>([
        "EvaluatingRelyingPartyTrust",
        "GettingPresentationDetails",
        "GettingRequestObject",
        "SendingAuthorizationResponse"
      ])
    );
  });
});
