import type { ItwVersion } from "@pagopa/io-react-native-wallet";

import * as O from "fp-ts/Option";
import { fromPromise } from "xstate";

import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { Env } from "../../common/utils/environment";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialStatusFromStatusList } from "../../common/utils/itwCredentialStatusListUtils";
import { getRepresentativeVaultId } from "../../common/utils/itwCredentialUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { ensureIntegrityServiceIsStoreReadyOrThrow } from "../../common/utils/itwStoreUtils";
import {
  CredentialAccessToken,
  CredentialBundle,
  CredentialFormat,
  CredentialMetadata,
  IssuerConfiguration,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { CredentialsVault } from "../../credentials/utils/vault";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { EidIssuanceMode } from "../eid/context";
import { createCommonActorsImplementation } from "../utils/actors";

export type LoadContextOutput = {
  integrityKeyTag: string;
  pid: CredentialBundle;
  walletInstanceAttestation: WalletInstanceAttestations;
};

export type RequestAccessTokenOutput = {
  accessToken: CredentialAccessToken;
  clientId: string;
  issuerConf: IssuerConfiguration;
};

export type RequestAccessTokenParams = WithItwVersion<{
  credential: CredentialMetadata;
  issuanceMode: EidIssuanceMode;
  pid: CredentialBundle | undefined;
  walletInstanceAttestation: string | undefined;
}>;

export type UpgradeCredentialOutput = {
  credentials: ReadonlyArray<CredentialBundle>;
  credentialType: string;
  walletUnitAttestations: Record<string, string>;
};

export type UpgradeCredentialParams = WithItwVersion<
  Partial<RequestAccessTokenOutput> & {
    credential: CredentialMetadata;
    integrityKeyTag: string | undefined;
  }
>;

export type WithItwVersion<T = { [K: string]: any }> = T & {
  itwVersion: ItwVersion;
};

export const createCredentialUpgradeActorsImplementation = (
  env: Env,
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
      evaluatedDcqlQuery,
      responseMode
    } = await credentialIssuanceUtils.requestCredential({
      env,
      itwVersion: input.itwVersion,
      credentialType: credential.credentialType,
      walletInstanceAttestation,
      // TODO [SIW-3091]: Update when the L3 PID reissuance flow is ready
      skipMdocIssuance: !isUpgrade,
      pid
    });

    const { accessToken } = await credentialIssuanceUtils.completeAuthFlow({
      env,
      itwVersion: input.itwVersion,
      codeVerifier,
      responseMode,
      issuerConf,
      walletInstanceAttestation,
      requestedCredential,
      evaluatedDcqlQuery
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
    const {
      accessToken,
      issuerConf,
      clientId,
      credential,
      integrityKeyTag,
      itwVersion
    } = input;

    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");
    assert(
      issuerConf && clientId && accessToken && integrityKeyTag,
      "Some of the required parameters for credential upgrade are undefined"
    );

    const ioWallet = getIoWallet(itwVersion);

    // The Wallet Unit Attestation makes use of the integrity service
    if (ioWallet.WalletUnitAttestation.isSupported) {
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

    const bundles = await enrichBundlesWithStatusList(
      itwVersion,
      issuerConf,
      credentials
    );

    return {
      credentialType: credential.credentialType,
      credentials: bundles,
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

/**
 * For each credential bundle fetch and validate its status list, then enrich it with the
 * extracted status in `metadata.validity` and the status list content for subsequent storage.
 * @param itwVersion The current IT-Wallet specs version
 * @param issuerConf The Issuer Configuration to get the keys for verification
 * @param bundles The credential bundles to enrich
 * @returns The enriched credential bundles
 */
const enrichBundlesWithStatusList = async (
  itwVersion: ItwVersion,
  issuerConf: IssuerConfiguration,
  bundles: ReadonlyArray<CredentialBundle>
): Promise<ReadonlyArray<CredentialBundle>> => {
  if (!getIoWallet(itwVersion).CredentialStatus.statusList.isSupported) {
    return bundles;
  }

  return Promise.all(
    bundles.map(async bundle => {
      if (bundle.metadata.format === CredentialFormat.MDOC) {
        return bundle;
      }

      const { status, rawStatus, uri, idx, parsedStatusList } =
        await getCredentialStatusFromStatusList(
          bundle,
          itwVersion,
          issuerConf.keys
        );

      return {
        credential: bundle.credential,
        metadata: {
          ...bundle.metadata,
          validity: {
            type: "status_list",
            status,
            rawStatus,
            statusList: { uri, idx }
          }
        },
        statusList: { uri, payload: parsedStatusList }
      };
    })
  );
};
