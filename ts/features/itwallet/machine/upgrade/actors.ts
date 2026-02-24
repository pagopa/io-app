import { fromPromise } from "xstate";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { Env } from "../../common/utils/environment";
import { EidIssuanceMode } from "../eid/context";
import {
  CredentialBundle,
  CredentialMetadata
} from "../../common/utils/itwTypesUtils";

export type UpgradeCredentialParams = {
  pid: CredentialBundle;
  walletInstanceAttestation: string;
  credential: CredentialMetadata;
  issuanceMode: EidIssuanceMode;
};

export type UpgradeCredentialOutput = {
  credentialType: string;
  credentials: ReadonlyArray<CredentialBundle>;
};

export const createCredentialUpgradeActorsImplementation = (env: Env) => ({
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
        credentialType: credential.credentialType,
        walletInstanceAttestation,
        // TODO [SIW-3091]: Update when the L3 PID reissuance flow is ready
        skipMdocIssuance: !isUpgrade
      });

    const result = await credentialIssuanceUtils.obtainCredential({
      env,
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
      credentials: result
    };
  })
});
