// Universal Links prefix for external web traffic
const IO_UNIVERSAL_LINK_PREFIX = "https://continua.io.pagopa.it";

// Internal deep link paths that require wallet update
const WALLET_UPDATE_PATHS = ["ioit://cgn-details/detail", "ioit://main/wallet"];

/**
 * Check if the URL requires wallet update based on specific criteria
 * - External Universal Links from web
 * - Specific internal paths that need wallet refresh
 */
export const shouldTriggerWalletUpdate = (url: string): boolean => {
  // External Universal Links always trigger wallet update
  if (url.startsWith(IO_UNIVERSAL_LINK_PREFIX)) {
    return true;
  }

  // Check if internal path requires wallet update
  return WALLET_UPDATE_PATHS.some(path => url.startsWith(path));
};
