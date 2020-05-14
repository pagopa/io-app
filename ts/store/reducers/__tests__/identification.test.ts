import { fromNullable } from "fp-ts/lib/Option";
import { PinString } from "../../../types/PinString";
import {
  identificationCancel,
  identificationFailure,
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

const identificationStartMock = identificationStart(
  "111111" as PinString,
  true,
  undefined,
  undefined,
  undefined,
  false
);

// Defining the condition that should be always verified when changing state
const identificationStartState = (state: IdentificationState) => {
  expect(state.progress.kind).toEqual("started");
};

const identificationCancelState = (state: IdentificationState) => {
  expect(state.progress.kind).toEqual("unidentified");
};

const identificationSuccessState = (state: IdentificationState) => {
  expect(state.progress.kind).toEqual("identified");
  expect(state.fail).toEqual(undefined);
};

const identificationResetState = (state: IdentificationState) => {
  expect(state.progress.kind).toEqual("unidentified");
  expect(state.fail).toEqual(undefined);
};

const identificationFailState = (state: IdentificationState) => {
  expect(state.fail).toBeDefined();
};

const actionToCondition: Map<
  Action,
  (state: IdentificationState) => void
> = new Map<Action, (state: IdentificationState) => void>();

actionToCondition.set(identificationStartMock, identificationStartState);
actionToCondition.set(identificationCancel(), identificationCancelState);
actionToCondition.set(identificationSuccess(), identificationSuccessState);
actionToCondition.set(identificationReset(), identificationResetState);
actionToCondition.set(identificationFailure(), identificationFailState);

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
    expect(finalState.fail).toBeDefined();

    fromNullable(finalState.fail).map(failState =>
      expect(failState.remainingAttempts).toEqual(maxAttempts - 1)
    );
  });
  it("should return correct state after switching from different states", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      identificationFailure(),
      identificationFailure(),
      identificationFailure(),
      identificationFailure(),
      identificationFailure(),
      identificationFailure(),
      identificationFailure(),
      identificationFailure()
    ];

    const initialState = reducer(undefined, identificationStartMock);

    // tslint:disable-next-line:no-let
    let attempts = maxAttempts - 1;
    const finalstate = sequenceOfActions.reduce((acc, val) => {
      const newState = reducer(acc, val);
      expect(newState.fail).toBeDefined();

      fromNullable(newState.fail).map(failState => {
        expect(failState.remainingAttempts).toEqual(attempts--);
      });

      return newState;
    }, initialState);

    expect(finalstate.fail).toBeDefined();

    fromNullable(finalstate.fail).map(failState => {
      expect(failState.remainingAttempts).toEqual(0);
      expect(failState.timespanBetweenAttempts).toEqual(
        (maxAttempts - freeAttempts) * deltaTimespanBetweenAttempts
      );
    });
  });
});

const reproduceSequence = (
  initialState: IdentificationState,
  sequenceOfActions: ReadonlyArray<Action>
) => {
  return sequenceOfActions.reduce(
    (acc, val) => reducer(acc, val),
    initialState
  );
};
