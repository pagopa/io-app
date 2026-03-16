import { fromPromise } from "xstate";
import { ItwVersion } from "@pagopa/io-react-native-wallet";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { Env } from "../../common/utils/environment";
import { EidIssuanceMode } from "../eid/context";

export type UpgradeCredentialParams = {
  pid: StoredCredential;
  walletInstanceAttestation: string;
  credential: StoredCredential;
  issuanceMode: EidIssuanceMode;
};

export type UpgradeCredentialOutput = {
  credentialType: string;
  credentials: ReadonlyArray<StoredCredential>;
};

export const createCredentialUpgradeActorsImplementation = (
  env: Env,
  itwVersion: ItwVersion
) => ({
  /**
   * Handles both upgrading and reissuing credentials depending on issuanceMode.
   * - upgrade → performs credential upgrade (skipMdocIssuance = false)
   * - reissuance → performs credential reissuing (skipMdocIssuance = true)
   */
  upgradeCredential: fromPromise<
    UpgradeCredentialOutput,
    UpgradeCredentialParams
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

    const result = await credentialIssuanceUtils.obtainCredential({
      env,
      itwVersion,
      credentialType: credential.credentialType,
      walletInstanceAttestation,
      requestedCredential,
      issuerConf,
      clientId,
      codeVerifier,
      pid
    });

    return {
      credentialType: credential.credentialType,
      credentials: result.credentials
    };
  })
});
