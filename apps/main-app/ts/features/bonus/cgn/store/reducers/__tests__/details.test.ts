import * as pot from "@pagopa/ts-commons/lib/pot";

import { Card } from "../../../../../../../definitions/cgn/Card";
import { CardPending } from "../../../../../../../definitions/cgn/CardPending";
import { GlobalState } from "../../../../../../store/reducers/types";
import { getGenericError } from "../../../../../../utils/errors";
import { cgnDetails } from "../../actions/details";
import { cgnUnsubscribe } from "../../actions/unsubscribe";
import reducer, {
  cgnDetailSelector,
  cgnDetailsInformationSelector,
  isCgnDetailsAlreadyFetchedSelector,
  isCgnDetailsLoading,
  isCgnEnrolledSelector,
  isCgnInformationAvailableSelector
} from "../details";

const activatedCard = {
  status: "ACTIVATED",
  activation_date: new Date("2024-01-01"),
  expiration_date: new Date("2024-12-31")
} as Card;

const pendingCard = {
  status: "PENDING"
} as CardPending as Card;

const makeState = (
  information: ReturnType<typeof cgnDetailSelector>,
  fetched = false
) =>
  ({
    bonus: {
      cgn: {
        detail: {
          information,
          fetched
        }
      }
    }
  }) as GlobalState;

describe("cgn details reducer", () => {
  it("sets loading on request preserving fetched false", () => {
    const state = reducer(undefined, cgnDetails.request());

    expect(pot.isLoading(state.information)).toBe(true);
    expect(state.fetched).toBe(false);
  });

  it("stores card and marks fetched on success", () => {
    const state = reducer(undefined, cgnDetails.success(activatedCard));

    expect(state.information).toEqual(pot.some(activatedCard));
    expect(state.fetched).toBe(true);
  });

  it("stores error and marks fetched on failure", () => {
    const error = getGenericError(new Error("boom"));
    const previous = reducer(undefined, cgnDetails.success(activatedCard));
    const state = reducer(previous, cgnDetails.failure(error));

    expect(pot.isError(state.information)).toBe(true);
    expect(state.fetched).toBe(true);
  });

  it("resets information and sets fetched on cancel", () => {
    const previous = reducer(undefined, cgnDetails.success(activatedCard));
    const state = reducer(previous, cgnDetails.cancel());

    expect(state.information).toEqual(pot.none);
    expect(state.fetched).toBe(true);
  });

  it("resets to initial state on unsubscribe success", () => {
    const previous = reducer(undefined, cgnDetails.success(activatedCard));
    const state = reducer(previous, cgnUnsubscribe.success());

    expect(state).toEqual({ information: pot.none, fetched: false });
  });
});

describe("cgn details selectors", () => {
  it("returns card information only when available and not pending", () => {
    const state = makeState(pot.some(activatedCard), true);

    expect(isCgnInformationAvailableSelector(state)).toBe(true);
    expect(isCgnEnrolledSelector(state)).toBe(true);
    expect(cgnDetailsInformationSelector(state)).toEqual(activatedCard);
    expect(isCgnDetailsAlreadyFetchedSelector(state)).toBe(true);
    expect(isCgnDetailsLoading(state)).toBe(false);
  });

  it("treats pending card as unavailable and not enrolled yet", () => {
    const state = makeState(pot.some(pendingCard), true);

    expect(isCgnInformationAvailableSelector(state)).toBe(false);
    expect(isCgnEnrolledSelector(state)).toBe(false);
    expect(cgnDetailsInformationSelector(state)).toBeUndefined();
  });

  it("returns undefined enrollment while loading", () => {
    const state = makeState(pot.noneLoading, false);

    expect(isCgnEnrolledSelector(state)).toBeUndefined();
    expect(isCgnDetailsLoading(state)).toBe(true);
  });

  it("returns false enrollment on error", () => {
    const error = getGenericError(new Error("boom"));
    const state = makeState(pot.someError(activatedCard, error), true);

    expect(isCgnEnrolledSelector(state)).toBe(false);
    expect(cgnDetailsInformationSelector(state)).toBeUndefined();
  });
});
