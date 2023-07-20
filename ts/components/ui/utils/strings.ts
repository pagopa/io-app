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
  `https://assets.cdn.io.italia.it/logos/abi/${abi}.png`;
