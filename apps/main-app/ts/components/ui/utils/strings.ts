import Config from "react-native-config";

/**
 * Simple string template for abi logos CDN
 *
 * @param abi The bank's ABI code
 *
 *   for testing reasons, an ABI code list can be found at
 *
 *   https://www.comuniecitta.it/elenco-banche-per-codice-abi
 * @returns A formatted link string
 */
export const getBankLogosCdnUri = (abi: string) =>
  `${Config.CONTENT_REPO_URL}/logos/abi/${abi}.png`;
