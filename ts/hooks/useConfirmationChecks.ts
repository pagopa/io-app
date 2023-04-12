import React from "react";

type ConfirmationChecks = {
  values: ReadonlyArray<boolean>;
  toggle: (atIndex: number) => void;
  areFulfilled: boolean;
};

/**
 * A custom React Hook that manages an arbitrary array of boolean values and tells if all values are true or not.
 * @param length - The length of the `values` array.
 */
export const useConfirmationChecks = (length: number): ConfirmationChecks => {
  /**
   * State that holds an array of booleans, indicating whether the corresponding index contains a confirmed check.
   */
  const [values, setValues] = React.useState<ReadonlyArray<boolean>>(
    Array.from({ length }, () => false)
  );

  /**
   * Utilizes the Array's `every` method to check whether all the elements in `values` are true.
   */
  const areFulfilled = values.every(v => v === true);

  /**
   * Function that updates the `values` state using the current state and the boolean value that's being toggled at the given index.
   * @param atIndex - The zero-based index in the `values` array that needs to be toggled.
   */
  const toggle = (atIndex: number): void => {
    setValues(current => [
      ...current.slice(0, atIndex),
      !current[atIndex],
      ...current.slice((atIndex as number) + 1)
    ]);
  };

  return { values, toggle, areFulfilled };
};
