export const sortAbiByName = (abis: ReadonlyArray<any>) =>
  abis
    .concat()
    .sort((abi1: { name: string }, abi2: { name: string }) =>
      abi1.name.toLocaleLowerCase().localeCompare(abi2.name.toLocaleLowerCase())
    );
