import React from "react";

type MachineCreatorFn<T> = (...args: any) => T;

const useXStateMachine = <T,>(fn: MachineCreatorFn<T>, ...args: any): [T] => {
  const machine = React.useRef<T | undefined>(undefined);

  if (machine.current === undefined) {
    // eslint-disable-next-line functional/immutable-data
    machine.current = fn(args);
  }

  return [machine.current];
};

export { useXStateMachine };
