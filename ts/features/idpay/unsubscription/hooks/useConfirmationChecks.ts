import React from "react";

export const useConfirmationChecks = (length: number) => {
  const [values, setValues] = React.useState<ReadonlyArray<boolean>>(
    Array.from({ length }, () => false)
  );

  const areFullfilled = values.every(v => v === true);

  const toggle = (atIndex: number) =>
    setValues(current => [
      ...current.slice(0, atIndex),
      !current[atIndex],
      ...current.slice((atIndex as number) + 1)
    ]);

  return { values, toggle, areFullfilled };
};
