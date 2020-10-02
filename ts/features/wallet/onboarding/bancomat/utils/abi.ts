export const sortAbiByName = (abis: ReadonlyArray<any>) =>
  abis.concat().sort((abi1, abi2) => {
    if (abi1.name < abi2.name) {
      return -1;
    } else if (abi1.name > abi2.name) {
      return 1;
    }
    return 0;
  });
