import { CryptoContext } from "@pagopa/io-react-native-jwt";
import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate5";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import {
  itwIntegrityKeyTagSelector,
  itwPidSelector
} from "../../issuance/store/selectors";

export type InitializeWalletActorOutput = {
  wiaCryptoContext: CryptoContext;
  walletInstanceAttestation: string;
};

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

export default (store: ReturnType<typeof useIOStore>) => {
  const initializeWallet = fromPromise<InitializeWalletActorOutput>(
    async () => {
      const integrityKeyTag = itwIntegrityKeyTagSelector(store.getState());
      assert(O.isSome(integrityKeyTag), "integriyKeyTag is not present");

      return await credentialIssuanceUtils.initializeWallet({
        integrityKeyTag: integrityKeyTag.value
      });
    }
  );

  const requestCredential = fromPromise<
    RequestCredentialActorOutput,
    RequestCredentialActorInput
  >(async ({ input }) => {
    const { credentialType, walletInstanceAttestation, wiaCryptoContext } =
      input;

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");
    assert(wiaCryptoContext, "wiaCryptoContext is undefined");

    return await credentialIssuanceUtils.requestCredential({
      credentialType,
      walletInstanceAttestation,
      wiaCryptoContext
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
      wiaCryptoContext,
      walletInstanceAttestation,
      clientId,
      codeVerifier,
      credentialDefinition
    } = input;

    const pid = itwPidSelector(store.getState());

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");
    assert(wiaCryptoContext, "wiaCryptoContext is undefined");
    assert(requestedCredential, "requestedCredential is undefined");
    assert(issuerConf, "issuerConf is undefined");
    assert(clientId, "clientId is undefined");
    assert(codeVerifier, "codeVerifier is undefined");
    assert(credentialDefinition, "codeVerifier is undefined");
    assert(O.isSome(pid), "pid is undefined");

    return await credentialIssuanceUtils.obtainCredential({
      credentialType,
      walletInstanceAttestation,
      wiaCryptoContext,
      requestedCredential,
      issuerConf,
      clientId,
      codeVerifier,
      credentialDefinition,
      pid: pid.value
    });
  });

  return {
    initializeWallet,
    requestCredential,
    obtainCredential
  };
};
