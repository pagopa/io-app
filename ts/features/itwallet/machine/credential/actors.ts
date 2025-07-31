import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { assert } from "../../../../utils/assert";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialStatusAttestation } from "../../common/utils/itwCredentialStatusAttestationUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { Env } from "../../common/utils/environment";
import { type Context } from "./context";

export type GetWalletAttestationActorInput = {
  isNewIssuanceFlowEnabled?: boolean;
};

export type GetWalletAttestationActorOutput = Awaited<
  ReturnType<typeof itwAttestationUtils.getAttestation>
>;

export type RequestCredentialActorInput =
  Partial<credentialIssuanceUtils.RequestCredentialParams>;

export type RequestCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.requestCredential>
>;

export type ObtainCredentialActorInput =
  Partial<credentialIssuanceUtils.ObtainCredentialParams>;

export type ObtainCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.obtainCredential>
>;

export type ObtainStatusAttestationActorInput = Pick<Context, "credentials">;

/**
 * Creates the actors for the eid issuance machine
 * @param env - The environment to use for the IT Wallet API calls
 * @param store the IOStore
 * @returns the actors
 */
export const createCredentialIssuanceActorsImplementation = (
  env: Env,
  store: ReturnType<typeof useIOStore>
) => {
  const getWalletAttestation = fromPromise<
    GetWalletAttestationActorOutput,
    GetWalletAttestationActorInput
  >(async ({ input }) => {
    const { isNewIssuanceFlowEnabled } = input;
    const sessionToken = sessionTokenSelector(store.getState());
    const integrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

    assert(sessionToken, "sessionToken is undefined");
    assert(O.isSome(integrityKeyTag), "integriyKeyTag is not present");

    return await itwAttestationUtils.getAttestation(
      env,
      integrityKeyTag.value,
      sessionToken,
      isNewIssuanceFlowEnabled
    );
  });

  const requestCredential = fromPromise<
    RequestCredentialActorOutput,
    RequestCredentialActorInput
  >(async ({ input }) => {
    const {
      credentialType,
      walletInstanceAttestation,
      isNewIssuanceFlowEnabled
    } = input;

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");

    return await credentialIssuanceUtils.requestCredential({
      env,
      credentialType,
      walletInstanceAttestation,
      isNewIssuanceFlowEnabled: !!isNewIssuanceFlowEnabled
    });
  });

  const obtainCredential = fromPromise<
    ObtainCredentialActorOutput,
    ObtainCredentialActorInput
  >(async ({ input }) => {
    const {
      credentialType,
      requestedCredential,
      issuerConf,
      walletInstanceAttestation,
      clientId,
      codeVerifier,
      credentialDefinition,
      isNewIssuanceFlowEnabled,
      operationType
    } = input;

    const eid = itwCredentialsEidSelector(store.getState());

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");
    assert(requestedCredential, "requestedCredential is undefined");
    assert(issuerConf, "issuerConf is undefined");
    assert(clientId, "clientId is undefined");
    assert(codeVerifier, "codeVerifier is undefined");
    // TODO: [SIW-2530] After fully migrating to the new API, the assertion below can be removed.
    assert(
      isNewIssuanceFlowEnabled || credentialDefinition,
      "credentialDefinition must be present in the old credential issuance flow"
    );
    assert(O.isSome(eid), "eID is undefined");

    return await credentialIssuanceUtils.obtainCredential({
      env,
      credentialType,
      walletInstanceAttestation,
      requestedCredential,
      issuerConf,
      clientId,
      codeVerifier,
      credentialDefinition,
      pid: eid.value,
      isNewIssuanceFlowEnabled: !!isNewIssuanceFlowEnabled,
      operationType
    });
  });

  const obtainStatusAttestation = fromPromise<
    Array<StoredCredential>,
    ObtainStatusAttestationActorInput
  >(async ({ input }) => {
    assert(input.credentials, "credentials are undefined");

    return await Promise.all(
      input.credentials.map(async credential => {
        const { statusAttestation, parsedStatusAttestation } =
          await getCredentialStatusAttestation(credential);

        return {
          ...credential,
          storedStatusAttestation: {
            credentialStatus: "valid",
            statusAttestation,
            parsedStatusAttestation: parsedStatusAttestation.payload
          }
        };
      })
    );
  });

  return {
    getWalletAttestation,
    requestCredential,
    obtainCredential,
    obtainStatusAttestation
  };
};
