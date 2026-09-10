import Config from "react-native-config";

/**
 * simple string template for abi logos CDN
 * @param abi the bank's ABI code
 *
 *
 * for testing reasons, an ABI code list can be found at
 *
 * https://www.comuniecitta.it/elenco-banche-per-codice-abi
 * @returns a formatted link string
 */
export const getBankLogosCdnUri = (abi: string) =>
  `${Config.CONTENT_REPO_URL}/logos/abi/${abi}.png`;
