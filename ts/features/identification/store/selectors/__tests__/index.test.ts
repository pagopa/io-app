import * as O from "fp-ts/lib/Option";
import { identificationFailSelector, progressSelector } from "../../selectors";

describe("identificationFailSelector", () => {
  it("should return None when fail is undefined", () => {
    const state = { identification: { fail: undefined } };
    const result = identificationFailSelector(state as any);
    expect(result).toEqual(O.none);
  });

  it("should return Some when fail is defined", () => {
    const failData = { remainingAttempts: 3, nextLegalAttempt: new Date() };
    const state = { identification: { fail: failData } };
    const result = identificationFailSelector(state as any);
    expect(result).toEqual(O.some(failData));
  });
});

describe("progressSelector", () => {
  it("should return the progress state", () => {
    const progressData = { kind: "started" };
    const state = { identification: { progress: progressData } };
    const result = progressSelector(state as any);
    expect(result).toEqual(progressData);
  });
});
