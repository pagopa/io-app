import { itwWalletProviderBaseUrl } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { createItWalletFetch } from "../../api/client";
import { WhitelistedFiscalCodeData } from "../../common/utils/itwTypesUtils.ts";

/**
 * Checks if the logged-in user is included in the whitelist from the trial system.
 * If the user is in the whitelist, then L3 functionalities are enabled.
 * @param sessionToken The session token to use for the API calls
 * @returns `true` if the user is whitelisted; otherwise, `false`.
 */
export const getIsFiscalCodeEnabled = async (
  sessionToken: SessionToken
): Promise<boolean> => {
  try {
    const appFetch = createItWalletFetch(
      itwWalletProviderBaseUrl,
      sessionToken
    );

    const endpoint = `${itwWalletProviderBaseUrl}/whitelisted-fiscal-code`;
    const response = await appFetch(endpoint, {
      method: "GET"
    });

    if (!response.ok) {
      return false;
    }

    const { whitelisted }: WhitelistedFiscalCodeData = await response.json();
    return Boolean(whitelisted);
  } catch (e) {
    return false;
  }
};
