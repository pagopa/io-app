import { ItwVersion } from "@pagopa/io-react-native-wallet";

import { Env } from "../../common/utils/environment";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { EidIssuanceMode } from "../eid/context";
import { MachineStore } from "../utils/deps";

export type CredentialUpgradeMachineDeps = {
  env: Env;
  store: MachineStore;
};

export type Input = {
  /**
   * Array of credentials that must be upgraded to L3
   */
  credentials: ReadonlyArray<CredentialMetadata>;
  /**
   * Runtime dependencies injected by the parent machine
   */
  deps: CredentialUpgradeMachineDeps;
  /**
   * The issuance mode considered by the credential upgrade machine.
   * - "upgrade": upgrade from Documenti su IO to IT Wallet, upgrading also owned credentials.
   * - "reissuance": reissuing the eID on Documenti su IO, reissuing also owned credentials.
   */
  issuanceMode: EidIssuanceMode;
  /**
   * IT-Wallet technical specifications version to upgrade credentials, for routing to the correct issuer API.
   */
  itwVersion: ItwVersion;
};
