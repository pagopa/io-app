import { EnvType } from "../../../common/utils/environment";

export type CieInput = {
  /**
   * The PIN code for the CIE card.
   */
  pin: string;
  /**
   * The URL from which obtain the authentication url and complete the flow.
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
};
