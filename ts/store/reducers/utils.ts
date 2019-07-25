import { Action } from "../actions/types";

type ReducerFunction<T> = (state: T | undefined, action: Action) => T;

export function testReducer<T>(
  reducer: ReducerFunction<T>,
  initialState: T | undefined,
  actions: ReadonlyArray<Action>
) {
  return actions.reduce<ReadonlyArray<T | undefined>>(
    (accumulator, currentAction) => {
      const currentState =
        accumulator.length > 0
          ? accumulator[accumulator.length - 1]
          : initialState;

      const nextState = reducer(currentState, currentAction);
      return [...accumulator, nextState];
    },
    []
  );
}
