// Internal deep link paths that require wallet update
const WALLET_UPDATE_PATHS = ["ioit://cgn-details/detail", "ioit://main/wallet"];

/**
 * Check if the URL requires wallet update based on specific criteria
 * - External Universal Links from web
 * - Specific internal paths that need wallet refresh
 */
export const shouldTriggerWalletUpdate = (url: string): boolean =>
  WALLET_UPDATE_PATHS.some(path => url.startsWith(path));
