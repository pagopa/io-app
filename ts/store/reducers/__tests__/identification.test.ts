import { range } from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { fromNullable } from "fp-ts/lib/Option";
import { PinString } from "../../../types/PinString";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationReset,
  identificationStart,
  identificationSuccess
} from "../../actions/identification";
import { Action } from "../../actions/types";
import reducer, {
  deltaTimespanBetweenAttempts,
  freeAttempts,
  IdentificationState,
  maxAttempts
} from "../identification";

const identificationStartMock = identificationStart("111111" as PinString);

describe("Identification reducer", () => {
  it("should return the initial state", () => {
    const result = reducer(undefined, identificationStartMock);
    expect(result.progress.kind).toEqual("started");
    expect(result.fail).toEqual(undefined);
  });
  it("should return correct state after identification success", () => {
    const startState = reducer(undefined, identificationStartMock);
    const successState = reducer(startState, identificationSuccess());
    expect(successState.progress.kind).toEqual("identified");
    expect(successState.fail).toEqual(undefined);
  });
  it("should return correct state after the first identification fail", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      identificationStartMock,
      identificationFailure()
    ];
    const finalState = reproduceSequence(
      {} as IdentificationState,
      sequenceOfActions
    );
    expect(finalState.progress.kind).toEqual("started");
    expectFailState(finalState, maxAttempts - 1, 0);
  });
  it("should return correct state after the complete sequence of fails", () => {
    const initialState = reducer(undefined, identificationStartMock);
    expectFailSequence(initialState);
  });
  it("should return correct state after a complete sequence of fails followed by another fail action (overflow)", () => {
    const initialState = reducer(undefined, identificationStartMock);
    const finalState = expectFailSequence(initialState);

    // check what happens in the event of an overflow of action
    const overflow = reducer(finalState, identificationFailure());
    expectFailState(
      overflow,
      1,
      (maxAttempts - freeAttempts - 1) * deltaTimespanBetweenAttempts
    );
  });
  it("should return correct state after a complete sequence of fails followed by another action", () => {
    const initialState = reducer(undefined, identificationStartMock);
    const failState = expectFailSequence(initialState);

    // expect to reset the fail state when the next action is used
    const expectFailStateReset = (nextAction: Action, expectedKind: string) => {
      const nextState = reducer(failState, nextAction);
      expect(nextState.progress.kind).toEqual(expectedKind);
      expect(nextState.fail).toEqual(undefined);
    };

    // expect to keep the fail state  when the next action is used
    const expectFailStateKeep = (nextAction: Action, expectedKind: string) => {
      const nextState = reducer(failState, nextAction);
      expect(nextState.progress.kind).toEqual(expectedKind);
      expectFailState(
        nextState,
        1,
        (maxAttempts - freeAttempts - 1) * deltaTimespanBetweenAttempts
      );
    };

    // after a success the fail state is cleared
    expectFailStateReset(identificationSuccess(), "identified");

    // after a reset the fail state is cleared
    expectFailStateReset(identificationReset(), "unidentified");

    // after an identificationstart the fail state is keep
    expectFailStateKeep(identificationStartMock, "started");

    // after an identificationcancel the fail state is keep
    expectFailStateKeep(identificationCancel(), "unidentified");

    // expect no change with a not involved action
    expectFailStateKeep(identificationForceLogout(), "started");
  });
  it("should return correct fail state after starting the complete failing sequence from different states", () => {
    const identificationResetState = reducer(undefined, identificationReset());
    expectFailSequence(identificationResetState);

    const expectFailSequenceFromStartingState = (action: Action) => {
      expectFailSequence(reducer(identificationResetState, action));
    };
    // start the full identification sequence from different states
    [
      identificationCancel(),
      identificationSuccess(),
      identificationStartMock
    ].forEach(action => expectFailSequenceFromStartingState(action));
  });
  it("should execute multiple fail sequence after a reset of the fail state correctly", () => {
    const identificationResetState = reducer(undefined, identificationReset());

    pipe(
      expectFailSequence,
      (state: IdentificationState) => reducer(state, identificationSuccess()),
      expectFailSequence,
      (state: IdentificationState) => reducer(state, identificationReset()),
      expectFailSequence
    )(identificationResetState);
  });
});

/**
 *  This function execute the full fail sequence, simulate the insertion of the wrong pin for
 * :maxAttempts -1:  amount of time.
 * @param initialState
 */
const expectFailSequence = (
  initialState: IdentificationState
): IdentificationState => {
  const sequenceOfActions: ReadonlyArray<Action> = range(
    1,
    maxAttempts - 1
  ).map(_ => identificationFailure());

  const expectedTimespan = range(1, freeAttempts)
    .map(_ => 0)
    .concat(
      range(1, maxAttempts - freeAttempts).map(
        i => i * deltaTimespanBetweenAttempts
      )
    );

  const finalState = sequenceOfActions.reduce((acc, val, i) => {
    const newState = reducer(acc, val);
    expectFailState(newState, maxAttempts - i - 1, expectedTimespan[i]);
    return newState;
  }, initialState);

  // check the final state after all the attempts

  expectFailState(
    finalState,
    1,
    (maxAttempts - freeAttempts - 1) * deltaTimespanBetweenAttempts
  );
  return finalState;
};

/**
 * Verify if a IdentificationState satisfies all the properties for a fail condition
 * @param state
 * @param expectedRemainingAttempts
 * @param expectedTimeSpan
 */
const expectFailState = (
  state: IdentificationState,
  expectedRemainingAttempts: number,
  expectedTimeSpan: number
) => {
  expect(state.fail).toBeDefined();

  fromNullable(state.fail).map(failState => {
    expect(failState.remainingAttempts).toEqual(expectedRemainingAttempts);
    expect(failState.timespanBetweenAttempts).toEqual(expectedTimeSpan);
  });
};

/**
 * Reproduce a sequence of action, returning the state after this sequence
 * @param initialState
 * @param sequenceOfActions
 */
const reproduceSequence = (
  initialState: IdentificationState,
  sequenceOfActions: ReadonlyArray<Action>
) => {
  return sequenceOfActions.reduce(
    (acc, val) => reducer(acc, val),
    initialState
  );
};
