import React from "react";
import * as X from "xstate";

type MachineCreatorFn<T extends X.AnyStateMachine> = () => T;

const useXStateMachine = <T extends X.AnyStateMachine>(
  fn: MachineCreatorFn<T>
): [T] => {
  const machine = React.useRef<T | undefined>(undefined);

  if (machine.current === undefined) {
    // eslint-disable-next-line functional/immutable-data
    machine.current = fn();
  }

  return [machine.current];
};

export { useXStateMachine };
