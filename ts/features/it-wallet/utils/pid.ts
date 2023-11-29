import {
  createCryptoContextFor,
  Credential,
  Trust
} from "@pagopa/io-react-native-wallet";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import {
  walletPidProviderUrl,
  walletProviderUrl as walletProviderBaseUrl
} from "../../../config";
import { ITW_WIA_KEY_TAG } from "./wia";
import { getOrGenerateCyptoKey } from "./keychain";
import { PidResponse } from "./types";

/**
 * PID Key Tag for interacting with the keychain.
 */
export const ITW_PID_KEY_TAG = "ITW_PID_KEY_TAG";

export const PID_CREDENTIAL_TYPE = "PersonIdentificationData" as const;

/**
 * A dummy implementation of CompleteUserAuthorization that uses static values.
 * Used to replace unimplemented specifications by the Issuer
 * Waiting for the Issuer to implement CIE authorization
 * TODO: [SIW-630]
 */
export const completeUserAuthorizationWithCIE: Credential.Issuance.CompleteUserAuthorization =
  async (_, __) => ({ code: "static_code" });

/**
 * Getter method which returns a PID credential.
 * @param walletInstanceAttestation - the wallet instance attestation of the current wallet.
 * @returns a PID credential.
 */
export const getPid = async (
  walletInstanceAttestation: string,
  pidData: PidData
): Promise<PidResponse> => {
  const wiaCryptoContext = createCryptoContextFor(ITW_WIA_KEY_TAG);

  // Obtain PID Entity Configuration
  const entityConfiguration =
    await Trust.getCredentialIssuerEntityConfiguration(
      walletPidProviderUrl
    ).then(_ => _.payload.metadata);

  // Auth Token request
  const authConf = await Credential.Issuance.startUserAuthorization(
    entityConfiguration,
    PID_CREDENTIAL_TYPE,
    {
      wiaCryptoContext,
      walletInstanceAttestation,
      walletProviderBaseUrl,
      additionalParams:
        // User's personal data is not supposed to transit in this flow,
        // but to be provided to the PID issuer directly by its chosen authentication method (CIE).
        // Being the project in an initial phase, and being we were still unable to fully comply with authentication,
        // we temporarily provide data from the App's logged user.
        {
          birth_date: pidData.birthDate,
          fiscal_code: pidData.fiscalCode,
          name: pidData.name,
          surname: pidData.surname
        }
    }
  );

  // Perform strong user authorozation to the PID Issuer
  const { code } = await completeUserAuthorizationWithCIE(
    authConf.requestUri,
    authConf.clientId
  );

  // Generate fresh key for PID binding
  // ensure the key esists befor starting the issuing process
  await getOrGenerateCyptoKey(ITW_PID_KEY_TAG);
  const credentialCryptoContext = createCryptoContextFor(ITW_PID_KEY_TAG);

  // Authorize the User to access the resource (Credential)
  const { accessToken, nonce } = await Credential.Issuance.authorizeAccess(
    entityConfiguration,
    code,
    authConf.clientId,
    {
      walletInstanceAttestation,
      walletProviderBaseUrl
    }
  );

  // Credential request
  const { credential, format } = await Credential.Issuance.obtainCredential(
    entityConfiguration,
    accessToken,
    nonce,
    authConf.clientId,
    PID_CREDENTIAL_TYPE,
    {
      credentialCryptoContext,
      walletProviderBaseUrl
    }
  );

  return { credential, format, entityConfiguration };
};
