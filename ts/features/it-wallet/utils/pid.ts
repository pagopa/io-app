import {
  PID,
  createCryptoContextFor,
  getCredentialIssuerEntityConfiguration
} from "@pagopa/io-react-native-wallet";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import { walletPidProviderUrl, walletProviderUrl } from "../../../config";
import { ITW_WIA_KEY_TAG } from "./wia";
import { getOrGenerateCyptoKey } from "./keychain";

/**
 * PID Key Tag for interacting with the keychain.
 */
export const ITW_PID_KEY_TAG = "ITW_PID_KEY_TAG";

/**
 * Getter method which returns a PID credential.
 * @param instanceAttestation - the wallet instance attestation of the current wallet.
 * @returns a PID credential.
 */
export const getPid = async (instanceAttestation: string, pidData: PidData) => {
  const wiaCryptoContext = createCryptoContextFor(ITW_WIA_KEY_TAG);

  // Obtain PID Entity Configuration
  const pidEntityConfiguration = await getCredentialIssuerEntityConfiguration(
    walletPidProviderUrl
  );

  // Auth Token request
  const authRequest = PID.Issuing.authorizeIssuing({ wiaCryptoContext });
  const authConf = await authRequest(
    instanceAttestation,
    walletProviderUrl,
    pidEntityConfiguration,
    // User's personal data is not supposed to transit in this flow,
    // but to be provided to the PID issuer directly by its chosen authentication method (CIE).
    // Being the project in an initial phase, and being we were still unable to fully comply with authentication,
    // we temporarily provide data from the App's logged user.
    {
      birthDate: pidData.birthDate,
      fiscalCode: pidData.fiscalCode,
      name: pidData.name,
      surname: pidData.surname
    }
  );

  // Generate fresh key for PID binding
  // ensure the key esists befor starting the issuing process
  await getOrGenerateCyptoKey(ITW_PID_KEY_TAG);
  const pidCryptoContext = createCryptoContextFor(ITW_PID_KEY_TAG);

  // Credential request
  const credentialRequest = PID.Issuing.getCredential({ pidCryptoContext });
  return await credentialRequest(authConf, pidEntityConfiguration);
};
