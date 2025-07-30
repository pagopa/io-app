import { fromPromise } from "xstate";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { Env } from "../../common/utils/environment";

export type UpgradeCredentialParams = {
  pid: StoredCredential;
  walletInstanceAttestation: string;
  credential: StoredCredential;
};

export type UpgradeCredentialOutput = {
  credentialType: string;
  credentials: ReadonlyArray<StoredCredential>;
};

export const createCredentialUpgradeActorsImplementation = (env: Env) => ({
  upgradeCredential: fromPromise<
    UpgradeCredentialOutput,
    UpgradeCredentialParams
  >(async ({ input }) => {
    const { pid, walletInstanceAttestation, credential } = input;

    const { requestedCredential, issuerConf, clientId, codeVerifier } =
      await credentialIssuanceUtils.requestCredential({
        env,
        credentialType: credential.credentialType,
        walletInstanceAttestation,
        isNewIssuanceFlowEnabled: true
      });

    const result = await credentialIssuanceUtils.obtainCredential({
      env,
      credentialType: credential.credentialType,
      walletInstanceAttestation,
      requestedCredential,
      issuerConf,
      clientId,
      codeVerifier,
      pid,
      isNewIssuanceFlowEnabled: true,
      isUpgrading: true
    });

    return {
      credentialType: credential.credentialType,
      credentials: result.credentials
    };
  })
});
