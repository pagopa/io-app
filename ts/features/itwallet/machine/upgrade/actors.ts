import { fromPromise } from "xstate";
import { ItwVersion } from "@pagopa/io-react-native-wallet";
import {
  CredentialAccessToken,
  IssuerConfiguration,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { Env } from "../../common/utils/environment";
import { EidIssuanceMode } from "../eid/context";
import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { useIOStore } from "../../../../store/hooks";
import { createCommonActorsImplementation } from "../utils/actors";

export type RequestAccessTokenParams = {
  pid: StoredCredential;
  walletInstanceAttestation: string;
  credential: StoredCredential;
  issuanceMode: EidIssuanceMode;
};

export type RequestAccessTokenOutput = {
  accessToken: CredentialAccessToken;
  issuerConf: IssuerConfiguration;
  clientId: string;
};

export type UpgradeCredentialParams = {
  accessToken: CredentialAccessToken;
  credential: StoredCredential;
  issuanceMode: EidIssuanceMode;
  integrityKeyTag: string;
} & RequestAccessTokenOutput;

export type UpgradeCredentialOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.obtainCredential>
> & {
  credentialType: string;
  walletUnitAttestations: Record<string, string>;
};

export const createCredentialUpgradeActorsImplementation = (
  env: Env,
  itwVersion: ItwVersion,
  store: ReturnType<typeof useIOStore>
) => ({
  requestAccessToken: fromPromise<
    RequestAccessTokenOutput,
    RequestAccessTokenParams
  >(async ({ input }) => {
    const { pid, walletInstanceAttestation, credential, issuanceMode } = input;
    const isUpgrade = issuanceMode === "upgrade";

    const { requestedCredential, issuerConf, clientId, codeVerifier } =
      await credentialIssuanceUtils.requestCredential({
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

    const result = await credentialIssuanceUtils.obtainCredential({
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
      credentials: result.credentials,
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
