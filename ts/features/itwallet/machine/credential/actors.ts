import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { Trust } from "@pagopa/io-react-native-wallet";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { assert } from "../../../../utils/assert";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialStatusAssertion } from "../../common/utils/itwCredentialStatusAssertionUtils";
import {
  CredentialBundle,
  CredentialFormat
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { Env } from "../../common/utils/environment";
import { enrichErrorWithMetadata } from "../../common/utils/itwFailureUtils";
import { CredentialsVault } from "../../credentials/utils/vault";
import { type Context } from "./context";

export type GetWalletAttestationActorOutput = Awaited<
  ReturnType<typeof itwAttestationUtils.getAttestation>
>;

export type RequestCredentialActorInput = Partial<
  credentialIssuanceUtils.RequestCredential["arguments"]
> & {
  skipMdocIssuance: boolean;
};

export type RequestCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.requestCredential>
>;

export type ObtainCredentialActorInput = Partial<
  credentialIssuanceUtils.ObtainCredential["arguments"]
>;

export type ObtainCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.obtainCredential>
>;

export type ObtainStatusAssertionActorInput = Pick<Context, "credentials">;

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
  const verifyTrustFederation = fromPromise<void>(async () => {
    // Evaluate the issuer trust
    const trustAnchorEntityConfig =
      await Trust.Build.getTrustAnchorEntityConfiguration(
        env.WALLET_TA_BASE_URL
      );

    // Create the trust chain for the PID provider
    const builtChainJwts = await Trust.Build.buildTrustChain(
      env.WALLET_EAA_PROVIDER_BASE_URL,
      trustAnchorEntityConfig
    );

    // Perform full validation on the built chain
    await Trust.Verify.verifyTrustChain(
      trustAnchorEntityConfig,
      builtChainJwts,
      {
        connectTimeout: 10000,
        readTimeout: 10000,
        requireCrl: true
      }
    );
  });

  const getWalletAttestation = fromPromise<GetWalletAttestationActorOutput>(
    async () => {
      const sessionToken = sessionTokenSelector(store.getState());
      const integrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

      assert(sessionToken, "sessionToken is undefined");
      assert(O.isSome(integrityKeyTag), "integriyKeyTag is not present");

      return await itwAttestationUtils.getAttestation(
        env,
        integrityKeyTag.value,
        sessionToken
      );
    }
  );

  const requestCredential = fromPromise<
    RequestCredentialActorOutput,
    RequestCredentialActorInput
  >(async ({ input }) => {
    const { credentialType, walletInstanceAttestation, skipMdocIssuance } =
      input;

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");

    return await credentialIssuanceUtils.requestCredential({
      env,
      credentialType,
      walletInstanceAttestation,
      skipMdocIssuance
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
      codeVerifier
    } = input;

    const eid = itwCredentialsEidSelector(store.getState());

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");
    assert(requestedCredential, "requestedCredential is undefined");
    assert(issuerConf, "issuerConf is undefined");
    assert(clientId, "clientId is undefined");
    assert(codeVerifier, "codeVerifier is undefined");
    assert(O.isSome(eid), "eID is undefined");

    // Retrieve the PID credential from the vault
    const pidCredential = await CredentialsVault.get(eid.value.credentialId);
    if (!pidCredential) {
      throw new Error("PID credential not found in secure storage");
    }

    return await credentialIssuanceUtils.obtainCredential({
      env,
      credentialType,
      walletInstanceAttestation,
      requestedCredential,
      issuerConf,
      clientId,
      codeVerifier,
      pid: eid.value
    });
  });

  const obtainStatusAssertion = fromPromise<
    Array<CredentialBundle>,
    ObtainStatusAssertionActorInput
  >(async ({ input }) => {
    assert(input.credentials, "credentials are undefined");

    const requestStatusAssertionOrSkip = async (
      credential: CredentialBundle
    ): Promise<CredentialBundle> => {
      // Status assertions for mDoc credentials are not supported yet
      if (credential.metadata.format === CredentialFormat.MDOC) {
        return credential;
      }

      const { statusAssertion, parsedStatusAssertion } =
        await getCredentialStatusAssertion(credential, env).catch(
          enrichErrorWithMetadata({
            credentialId: credential.metadata.credentialId
          })
        );

      return {
        ...credential,
        metadata: {
          ...credential.metadata,
          storedStatusAssertion: {
            credentialStatus: "valid",
            statusAssertion,
            parsedStatusAssertion: parsedStatusAssertion.payload
          }
        }
      };
    };

    return await Promise.all(
      input.credentials.map(requestStatusAssertionOrSkip)
    );
  });

  return {
    verifyTrustFederation,
    getWalletAttestation,
    requestCredential,
    obtainCredential,
    obtainStatusAssertion
  };
};
