import { Credential } from "@pagopa/io-react-native-wallet";
import { fromPromise } from "xstate";
import * as O from "fp-ts/lib/Option";
import {
  ItwRemoteRequestPayload,
  PresentationDetails,
  RelyingPartyConfiguration
} from "../utils/itwRemoteTypeUtils";
import { useIOStore } from "../../../../../store/hooks";
import { itwCredentialsSelector } from "../../../credentials/store/selectors";
import { assert } from "../../../../../utils/assert";

export type EvaluateRelyingPartyTrustInput = Partial<{ clientId: string }>;
export type EvaluateRelyingPartyTrustOutput = {
  rpConf: RelyingPartyConfiguration;
  rpSubject: string;
};

export type GetPresentationDetailsInput = Partial<{
  rpConf: RelyingPartyConfiguration;
  rpSubject: string;
  qrCodePayload: ItwRemoteRequestPayload;
}>;
export type GetPresentationDetailsOutput = {
  requestObject: Credential.Presentation.RequestObject;
  presentationDetails: PresentationDetails;
};

export const createRemoteActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => {
  const evaluateRelyingPartyTrust = fromPromise<
    EvaluateRelyingPartyTrustOutput,
    EvaluateRelyingPartyTrustInput
  >(async ({ input }) => {
    assert(input.clientId, "Missing required client ID");

    const { rpConf, subject } =
      await Credential.Presentation.evaluateRelyingPartyTrust(input.clientId);

    // TODO: add trust chain validation

    return { rpConf, rpSubject: subject };
  });

  const getPresentationDetails = fromPromise<
    GetPresentationDetailsOutput,
    GetPresentationDetailsInput
  >(async ({ input }) => {
    const { rpConf, rpSubject, qrCodePayload } = input;
    assert(
      rpConf && rpSubject && qrCodePayload,
      "Missing required getPresentationDetails actor params"
    );

    const { requestUri, clientId, state } = qrCodePayload;

    const { requestObjectEncodedJwt } =
      await Credential.Presentation.getRequestObject(requestUri);

    const { requestObject } = await Credential.Presentation.verifyRequestObject(
      requestObjectEncodedJwt,
      {
        rpConf,
        clientId,
        rpSubject,
        state
      }
    );

    const { eid, credentials } = itwCredentialsSelector(store.getState());

    assert(requestObject.dcql_query, "Missing required DCQL query");
    assert(O.isSome(eid), "Missing PID");

    // Prepare credentials to evaluate the Relying Party request
    const credentialsSdJwt: Array<[string, string]> = [
      [eid.value.keyTag, eid.value.credential],
      ...credentials
        .filter(O.isSome)
        .map(c => [c.value.keyTag, c.value.credential] as [string, string])
    ];

    const result = Credential.Presentation.evaluateDcqlQuery(
      credentialsSdJwt,
      requestObject.dcql_query as any // TODO: fix type
    );

    return { requestObject, presentationDetails: result };
  });

  return {
    evaluateRelyingPartyTrust,
    getPresentationDetails
  };
};
