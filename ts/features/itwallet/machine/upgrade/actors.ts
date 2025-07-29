import { fromPromise } from "xstate";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { Env } from "../../common/utils/environment";

export type UpgradeCredentialParams = {
  pid: StoredCredential;
  walletInstanceAttestation: string;
  credential: StoredCredential;
};

export const createCredentialUpgradeActorsImplementation = (env: Env) => ({
  upgradeCredential: fromPromise<void, UpgradeCredentialParams>(
    async ({ input }) => {
      const { pid, walletInstanceAttestation, credential } = input;

      console.log("Upgrading credential:", credential.credentialId);

      const { requestedCredential, issuerConf, clientId, codeVerifier } =
        await credentialIssuanceUtils.requestCredential({
          env,
          credentialType: credential.credentialType,
          walletInstanceAttestation,
          isNewIssuanceFlowEnabled: true
        });

      console.log(
        "Obtaining upgraded credential for",
        credential.credentialId,
        "with requestedCredential",
        requestedCredential
      );

      const result = await credentialIssuanceUtils.obtainCredential({
        env,
        credentialType: credential.credentialType,
        walletInstanceAttestation,
        requestedCredential,
        issuerConf,
        clientId,
        codeVerifier,
        pid,
        isNewIssuanceFlowEnabled: true
      });

      console.log(
        "Credential upgrade completed for",
        credential.credentialId,
        "result:",
        result
      );
    }
  )
});
