import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { WIA_KEYTAG } from "./itwCryptoContextUtils";
import { IssuerConfiguration } from "./itwTypesUtils";

export type InitMrtdPoPChallenge = (args: {
  issuerConf: IssuerConfiguration;
  walletInstanceAttestation: string;
  authRedirectUrl: string;
}) => Promise<{
  challenge: string;
  mrtd_auth_session: string;
  mrtd_pop_nonce: string;
  validationUrl: string;
}>;

export const initMrtdPoPChallenge: InitMrtdPoPChallenge = async ({
  authRedirectUrl,
  issuerConf,
  walletInstanceAttestation
}) => {
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const { challenge_info } =
    await Credential.Issuance.continueUserAuthorizationWithMRTDPoPChallenge(
      authRedirectUrl
    );

  const {
    htu: initUrl,
    mrtd_auth_session,
    mrtd_pop_jwt_nonce
  } = await Credential.Issuance.MRTDPoP.verifyAndParseChallengeInfo(
    issuerConf,
    challenge_info,
    { wiaCryptoContext }
  );

  const {
    htu: validationUrl,
    challenge,
    mrtd_pop_nonce
  } = await Credential.Issuance.MRTDPoP.initChallenge(
    issuerConf,
    initUrl,
    mrtd_auth_session,
    mrtd_pop_jwt_nonce,
    {
      walletInstanceAttestation,
      wiaCryptoContext
    }
  );

  return {
    challenge,
    mrtd_auth_session,
    mrtd_pop_nonce,
    validationUrl
  };
};

export type ValidateMrtdPoPChallenge = (args: {
  issuerConf: IssuerConfiguration;
  walletInstanceAttestation: string;
  validationUrl: string;
  mrtd_auth_session: string;
  mrtd_pop_nonce: string;
  mrtd: Credential.Issuance.MRTDPoP.MrtdPayload;
  ias: Credential.Issuance.MRTDPoP.IasPayload;
}) => Promise<{ callbackUrl: string }>;

export const validateMrtdPoPChallenge: ValidateMrtdPoPChallenge = async ({
  validationUrl,
  mrtd_auth_session,
  mrtd_pop_nonce,
  issuerConf,
  walletInstanceAttestation,
  ias,
  mrtd
}) => {
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const { mrtd_val_pop_nonce, redirect_uri } =
    await Credential.Issuance.MRTDPoP.validateChallenge(
      issuerConf,
      validationUrl,
      mrtd_auth_session,
      mrtd_pop_nonce,
      mrtd,
      ias,
      {
        walletInstanceAttestation,
        wiaCryptoContext
      }
    );

  const { callbackUrl } =
    await Credential.Issuance.MRTDPoP.buildChallengeCallbackUrl(
      redirect_uri,
      mrtd_val_pop_nonce,
      mrtd_auth_session
    );

  return {
    callbackUrl
  };
};
