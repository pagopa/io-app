import React from "react";

type MachineCreatorFn<T> = () => T;

const useXStateMachine = <T,>(fn: MachineCreatorFn<T>): [T] => {
  const machine = React.useRef<T | undefined>(undefined);

  if (machine.current === undefined) {
    // eslint-disable-next-line functional/immutable-data
    machine.current = fn();
  }

  return [machine.current];
};

export { useXStateMachine };
