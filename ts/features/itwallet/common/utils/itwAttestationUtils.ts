import { SessionToken } from "../../../../types/SessionToken";
import { generateIntegrityHardwareKeyTag } from "./itwIntegrityUtils";
import { WalletInstanceAttestations } from "./itwTypesUtils.ts";
import * as AttestationUtilsV1 from "./itwAttestationUtils.v1";
import * as AttestationUtilsV2 from "./itwAttestationUtils.v2";
import { Env } from "./environment.ts";

/**
 * Getter for the integrity hardware keytag to be used for an {@link IntegrityContext}.
 * @return the integrity hardware keytag to be persisted
 */
export const getIntegrityHardwareKeyTag = async (): Promise<string> =>
  await generateIntegrityHardwareKeyTag();

/**
 * Register a new wallet instance with hardwareKeyTag.
 * @param env - The environment to use for the wallet provider base URL
 * @param hardwareKeyTag - the hardware key tag of the integrity Context
 * @param sessionToken - the session token to use for the API calls
 */
export const registerWalletInstance = async (
  env: Env,
  hardwareKeyTag: string,
  sessionToken: SessionToken,
  newApiEnabled: boolean = false
) =>
  newApiEnabled
    ? AttestationUtilsV2.registerWalletInstance(
        env,
        hardwareKeyTag,
        sessionToken
      )
    : AttestationUtilsV1.registerWalletInstance(
        env,
        hardwareKeyTag,
        sessionToken
      );

/**
 * Getter for the wallet attestation binded to the wallet instance created with the given hardwareKeyTag.
 * @param env - The environment to use for the wallet provider base URL
 * @param hardwareKeyTag - the hardware key tag of the wallet instance
 * @param sessionToken - the session token to use for the API calls
 * @param newApiEnabled - enable v1.0 API - TODO: [SIW-2530] Remove after transitioning to API 1.0
 * @return the wallet attestation in multiple formats
 */
export const getAttestation = async (
  env: Env,
  hardwareKeyTag: string,
  sessionToken: SessionToken,
  newApiEnabled: boolean = false
): Promise<WalletInstanceAttestations> =>
  newApiEnabled
    ? AttestationUtilsV2.getAttestation(env, hardwareKeyTag, sessionToken)
    : AttestationUtilsV1.getAttestation(env, hardwareKeyTag, sessionToken);

/**
 * Checks if the Wallet Instance Attestation needs to be requested by
 * checking the expiry date
 * @param attestation - the Wallet Instance Attestation to validate
 * @param newApiEnabled - enable v1.0 API - TODO: [SIW-2530] Remove after transitioning to API 1.0
 * @returns true if the Wallet Instance Attestation is expired or not present
 */
export const isWalletInstanceAttestationValid = (
  attestation: string,
  newApiEnabled: boolean = false
): boolean =>
  newApiEnabled
    ? AttestationUtilsV2.isWalletInstanceAttestationValid(attestation)
    : AttestationUtilsV1.isWalletInstanceAttestationValid(attestation);

/**
 * Get the wallet instance status from the Wallet Provider.
 * This operation is more lightweight than getting a new attestation to check the status.
 * @param env - The environment to use for the wallet provider base URL
 * @param hardwareKeyTag The hardware key tag used to create the wallet instance
 * @param sessionToken The session token to use for the API calls
 */
export const getWalletInstanceStatus = (
  env: Env,
  hardwareKeyTag: string,
  sessionToken: SessionToken,
  newApiEnabled: boolean = false
) =>
  newApiEnabled
    ? AttestationUtilsV2.getWalletInstanceStatus(
        env,
        hardwareKeyTag,
        sessionToken
      )
    : AttestationUtilsV1.getWalletInstanceStatus(
        env,
        hardwareKeyTag,
        sessionToken
      );
/**
 * Get the current wallet instance status from the Wallet Provider.
 * This operation will check the wallet instance status based on the current fiscal code of the user.
 * @param env - The environment to use for the wallet provider base URL
 * @param sessionToken The session token to use for the API calls
 */
export const getCurrentWalletInstanceStatus = (
  env: Env,
  sessionToken: SessionToken,
  newApiEnabled: boolean = false
) =>
  newApiEnabled
    ? AttestationUtilsV2.getCurrentWalletInstanceStatus(env, sessionToken)
    : AttestationUtilsV1.getCurrentWalletInstanceStatus(env, sessionToken);
