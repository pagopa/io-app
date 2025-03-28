import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../identification/common/store/selectors";
import { assert } from "../../../../utils/assert";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialStatusAttestation } from "../../common/utils/itwCredentialStatusAttestationUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { type Context } from "./context";

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

export type ObtainStatusAttestationActorInput = Pick<Context, "credential">;

export default (store: ReturnType<typeof useIOStore>) => {
  const getWalletAttestation = fromPromise<GetWalletAttestationActorOutput>(
    async () => {
      const sessionToken = sessionTokenSelector(store.getState());
      const integrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

      assert(sessionToken, "sessionToken is undefined");
      assert(O.isSome(integrityKeyTag), "integriyKeyTag is not present");

      return await itwAttestationUtils.getAttestation(
        integrityKeyTag.value,
        sessionToken
      );
    }
  );

  const requestCredential = fromPromise<
    RequestCredentialActorOutput,
    RequestCredentialActorInput
  >(async ({ input }) => {
    const { credentialType, walletInstanceAttestation } = input;

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");

    return await credentialIssuanceUtils.requestCredential({
      credentialType,
      walletInstanceAttestation
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
      credentialDefinition
    } = input;

    const eid = itwCredentialsEidSelector(store.getState());

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");
    assert(requestedCredential, "requestedCredential is undefined");
    assert(issuerConf, "issuerConf is undefined");
    assert(clientId, "clientId is undefined");
    assert(codeVerifier, "codeVerifier is undefined");
    assert(credentialDefinition, "codeVerifier is undefined");
    assert(O.isSome(eid), "eID is undefined");

    return await credentialIssuanceUtils.obtainCredential({
      credentialType,
      walletInstanceAttestation,
      requestedCredential,
      issuerConf,
      clientId,
      codeVerifier,
      credentialDefinition,
      pid: eid.value
    });
  });

  const obtainStatusAttestation = fromPromise<
    StoredCredential,
    ObtainStatusAttestationActorInput
  >(async ({ input }) => {
    assert(input.credential, "credential is undefined");

    const { statusAttestation, parsedStatusAttestation } =
      await getCredentialStatusAttestation(input.credential);

    return {
      ...input.credential,
      storedStatusAttestation: {
        credentialStatus: "valid",
        statusAttestation,
        parsedStatusAttestation: parsedStatusAttestation.payload
      }
    };
  });

  return {
    getWalletAttestation,
    requestCredential,
    obtainCredential,
    obtainStatusAttestation
  };
};
