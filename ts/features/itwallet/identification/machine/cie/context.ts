import { Input } from "./input";

export type Context = {
  /**
   * The PIN code for the CIE card.
   */
  pin: string;
  /**
   * The URL for authentication. It is used as service provider for the CIE authentication.
   */
  authenticationUrl: string;
  /**
   * The progress of the CIE reading process, represented as a value from 0 to 1.
   * It is undefined when the reading process has not started or has completed.
   */
  readProgress: number | undefined;
  /**
   * The URL for authorization, which is set after a successful CIE read.
   */
  authorizationUrl: string | undefined;
};

export const getInitialContext = (input: Input): Context => ({
  pin: input.pin,
  authenticationUrl: input.authenticationUrl,
  readProgress: undefined,
  authorizationUrl: undefined
});
