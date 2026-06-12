import { Action } from "../store/actions/types";

/**
 * Reproduce a sequence of action, returning the state after this sequence
 * @param initialState
 * @param reducer
 * @param sequenceOfActions
 */
export const reproduceSequence = <S>(
  initialState: S,
  reducer: (s: S, a: Action) => S,
  sequenceOfActions: ReadonlyArray<Action>
): S =>
  sequenceOfActions.reduce<S>((acc, val) => reducer(acc, val), initialState);
