import React from "react";

export const useConfirmationChecks = (lenght: number) => {
  const [values, setValues] = React.useState<ReadonlyArray<boolean>>(
    Array(lenght).map(() => false)
  );

  const areFullfilled = !values.find(c => !c);

  const toggle = (atIndex: number) =>
    setValues(current => [
      ...current.slice(0, atIndex),
      !current[atIndex],
      ...current.slice((atIndex as number) + 1)
    ]);

  return { values, toggle, areFullfilled };
};
