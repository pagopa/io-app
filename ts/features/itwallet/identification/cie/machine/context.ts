import { CieError, NfcError } from "@pagopa/io-react-native-cie";
import { EnvType } from "../../../common/utils/environment";
import { WebViewError } from "../utils/error";
import { CieInput } from "./input";

export type CieContext = {
  /**
   * The PIN code for the CIE card.
   */
  pin: string;
  /**
   * The URL from which obtain the service provider url and complete the auth flow.
   */
  authenticationUrl: string;
  /**
   * Wether the screen reader is enabled or not.
   */
  isScreenReaderEnabled: boolean;
  /**
   * Current IT Wallet environment
   */
  env: EnvType;
  /**
   * Wether the identification flow is for L3 or L2
   */
  isL3: boolean;
  /**
   * The auth service provider url to be used with the CIE auth flow
   */
  serviceProviderUrl: string | undefined;
  /**
   * The progress of the CIE reading process, represented as a value from 0 to 1.
   * It is undefined when the reading process has not started or has completed.
   */
  readProgress: number | undefined;
  /**
   * The URL for authorization, which is set after a successful CIE read.
   */
  authorizationUrl: string | undefined;
  /**
   * Redirect url after the authentication authorization
   */
  redirectUrl: string | undefined;
  /**
   * Error during CIE manager initialization, CIE read or webviews load
   */
  failure: CieError | NfcError | WebViewError | undefined;
};

export const getInitialContext = (input: CieInput): CieContext => ({
  pin: input.pin,
  authenticationUrl: input.authenticationUrl,
  isScreenReaderEnabled: input.isScreenReaderEnabled,
  env: input.env,
  isL3: input.isL3,
  serviceProviderUrl: undefined,
  readProgress: undefined,
  authorizationUrl: undefined,
  redirectUrl: undefined,
  failure: undefined
});
