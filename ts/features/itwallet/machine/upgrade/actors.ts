import * as O from "fp-ts/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { Env } from "../../common/utils/environment";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import {
  CredentialBundle,
  CredentialMetadata,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { EidIssuanceMode } from "../eid/context";
import { CredentialsVault } from "../../credentials/utils/vault";

export type UpgradeCredentialParams = {
  pid: CredentialBundle | undefined;
  walletInstanceAttestation: string | undefined;
  credential: CredentialMetadata;
  issuanceMode: EidIssuanceMode;
};

export type UpgradeCredentialOutput = {
  credentialType: string;
  credentials: ReadonlyArray<CredentialBundle>;
};

export type LoadContextOutput = {
  pid: CredentialBundle;
  walletInstanceAttestation: WalletInstanceAttestations;
};

export const createCredentialUpgradeActorsImplementation = (
  env: Env,
  store: ReturnType<typeof useIOStore>
) => ({
  loadContext: fromPromise<LoadContextOutput>(async () => {
    const walletInstanceAttestation = itwWalletInstanceAttestationSelector(
      store.getState()
    );
    assert(
      walletInstanceAttestation,
      "walletInstanceAttestation is not present in the store"
    );

    const pidOption = itwCredentialsEidSelector(store.getState());
    assert(O.isSome(pidOption), "PID credential is not present in the store");

    const pid = await CredentialsVault.get(pidOption.value.credentialId);
    assert(pid, "PID credential not found in secure storage");

    return {
      pid: {
        metadata: pidOption.value,
        credential: pid
      },
      walletInstanceAttestation
    };
  }),

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

    assert(pid, "PID credential is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");

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
