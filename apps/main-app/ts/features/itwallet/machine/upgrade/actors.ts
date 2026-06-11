import { ItwVersion } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { Env } from "../../common/utils/environment";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { getRepresentativeVaultId } from "../../common/utils/itwCredentialUtils";
import {
  CredentialAccessToken,
  CredentialBundle,
  CredentialMetadata,
  IssuerConfiguration,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { CredentialsVault } from "../../credentials/utils/vault";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { EidIssuanceMode } from "../eid/context";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { createCommonActorsImplementation } from "../utils/actors";
import { ensureIntegrityServiceIsStoreReadyOrThrow } from "../../common/utils/itwStoreUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";

export type RequestAccessTokenParams = {
  pid: CredentialBundle | undefined;
  walletInstanceAttestation: string | undefined;
  credential: CredentialMetadata;
  issuanceMode: EidIssuanceMode;
};

export type RequestAccessTokenOutput = {
  accessToken: CredentialAccessToken;
  issuerConf: IssuerConfiguration;
  clientId: string;
};

export type UpgradeCredentialParams = {
  credential: CredentialMetadata;
  integrityKeyTag: string | undefined;
} & Partial<RequestAccessTokenOutput>;

export type UpgradeCredentialOutput = {
  credentialType: string;
  walletUnitAttestations: Record<string, string>;
  credentials: ReadonlyArray<CredentialBundle>;
};

export type LoadContextOutput = {
  pid: CredentialBundle;
  walletInstanceAttestation: WalletInstanceAttestations;
  integrityKeyTag: string;
};

export const createCredentialUpgradeActorsImplementation = (
  env: Env,
  itwVersion: ItwVersion,
  store: ReturnType<typeof useIOStore>
) => ({
  loadContext: fromPromise<LoadContextOutput>(async () => {
    const state = store.getState();
    const walletInstanceAttestation =
      itwWalletInstanceAttestationSelector(state);
    assert(
      walletInstanceAttestation,
      "walletInstanceAttestation is not present in the store"
    );
    const integrityKeyTagOption = itwIntegrityKeyTagSelector(state);
    assert(
      O.isSome(integrityKeyTagOption),
      "Integrity key tag is not present in the store"
    );

    const pidOption = itwCredentialsEidSelector(state);
    assert(O.isSome(pidOption), "PID credential is not present in the store");

    const pid = await CredentialsVault.get(
      getRepresentativeVaultId(pidOption.value)
    );
    assert(pid, "PID credential not found in secure storage");

    return {
      pid: {
        metadata: pidOption.value,
        credential: pid
      },
      walletInstanceAttestation,
      integrityKeyTag: integrityKeyTagOption.value
    };
  }),

  requestAccessToken: fromPromise<
    RequestAccessTokenOutput,
    RequestAccessTokenParams
  >(async ({ input }) => {
    const { pid, walletInstanceAttestation, credential, issuanceMode } = input;
    const isUpgrade = issuanceMode === "upgrade";

    assert(pid, "PID credential is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");

    const {
      requestedCredential,
      issuerConf,
      clientId,
      codeVerifier,
      responseMode
    } = await credentialIssuanceUtils.requestCredential({
      env,
      itwVersion,
      credentialType: credential.credentialType,
      walletInstanceAttestation,
      // TODO [SIW-3091]: Update when the L3 PID reissuance flow is ready
      skipMdocIssuance: !isUpgrade
    });

    const { accessToken } = await credentialIssuanceUtils.completeAuthFlow({
      env,
      itwVersion,
      codeVerifier,
      responseMode,
      issuerConf,
      walletInstanceAttestation,
      requestedCredential,
      pid
    });

    return { accessToken, issuerConf, clientId };
  }),

  /**
   * Handles both upgrading and reissuing credentials depending on issuanceMode.
   * - upgrade → performs credential upgrade (skipMdocIssuance = false)
   * - reissuance → performs credential reissuing (skipMdocIssuance = true)
   *
   * To ensure a smooth experience when the session token expires, it is important to keep this actor
   * retriable: it must fail as early as possible when `generateKeysWithWalletUnitAttestation` is
   * rejected for session expired, so it can be reentered and retried from where it failed.
   */
  upgradeCredential: fromPromise<
    UpgradeCredentialOutput,
    UpgradeCredentialParams
  >(async ({ input }) => {
    const { accessToken, issuerConf, clientId, credential, integrityKeyTag } =
      input;

    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");
    assert(
      issuerConf && clientId && accessToken && integrityKeyTag,
      "Some of the required parameters for credential upgrade are undefined"
    );

    // The Wallet Unit Attestation makes use of the integrity service
    if (getIoWallet(itwVersion).WalletUnitAttestation.isSupported) {
      await ensureIntegrityServiceIsStoreReadyOrThrow(store);
    }

    const authorizedCredentials =
      await credentialIssuanceUtils.generateKeysWithWalletUnitAttestation(
        accessToken,
        {
          env,
          itwVersion,
          hardwareKeyTag: integrityKeyTag,
          sessionToken
        }
      );

    const credentials = await credentialIssuanceUtils.obtainCredential({
      env,
      itwVersion,
      credentialType: credential.credentialType,
      issuerConf,
      clientId,
      accessToken,
      authorizedCredentials
    });

    return {
      credentialType: credential.credentialType,
      credentials,
      walletUnitAttestations: authorizedCredentials.reduce(
        (acc, c) =>
          c.walletUnitAttestationId && c.walletUnitAttestation
            ? { ...acc, [c.walletUnitAttestationId]: c.walletUnitAttestation }
            : acc,
        {} as Record<string, string>
      )
    };
  }),

  ...createCommonActorsImplementation(store)
});
