import { Abi } from "../../../../../../definitions/pagopa/walletv2/Abi";

/**
 * This function aims to order the list of Abis returned by the PM in alphabetical order based on his name
 * @param abis the abi list returned from the PM
 */
export const sortAbiByName = (abis: ReadonlyArray<Abi>) =>
  [...abis].sort((abi1: Abi, abi2: Abi) => {
    const abi1Name = abi1.name ?? "";
    const abi2Name = abi2.name ?? "";
    return abi1Name
      .toLocaleLowerCase()
      .localeCompare(abi2Name.toLocaleLowerCase());
  });
