import { pot } from "@pagopa/ts-commons";
import { getType } from "typesafe-actions";
import {
  paymentValidInvalidAfterDueDate,
  successLoadMessageDetails
} from "../../../../../__mocks__/message";

import { loadMessageDetails } from "../../../../actions/messages";
import reducer from "../detailsById";
import { UIMessageId } from "../types";

const id = paymentValidInvalidAfterDueDate.id as UIMessageId;

describe("detailsById reducer", () => {
  describe(`when a ${getType(loadMessageDetails.request)} is sent`, () => {
    const actionRequest = loadMessageDetails.request({ id });
    it(`should add an entry for ${id} with 'noneLoading'`, () => {
      expect(reducer(undefined, actionRequest)[id]).toEqual(pot.noneLoading);
    });

    describe(`and an entry for ${id} already exists`, () => {
      const initialState = { [id]: pot.some(successLoadMessageDetails) };
      it(`should update the entry to loading state preserving the data`, () => {
        const entry = reducer(initialState, actionRequest)[id];
        expect(pot.isLoading(entry)).toBe(true);
        expect(pot.isSome(entry)).toBe(true);
        expect(pot.toUndefined(entry)).toBeDefined();
      });
    });
  });

  describe(`when a ${getType(loadMessageDetails.success)} is sent`, () => {
    const actionRequest = loadMessageDetails.success(successLoadMessageDetails);
    it(`should add an entry for ${id}`, () => {
      const entry = reducer(undefined, actionRequest)[id];
      expect(pot.isSome(entry)).toBe(true);
      expect(pot.toUndefined(entry)).toEqual(successLoadMessageDetails);
    });
  });

  describe(`when a ${getType(loadMessageDetails.failure)} is sent`, () => {
    const error = new Error("Have you tried turning it off and on again?");
    const actionRequest = loadMessageDetails.failure({
      id,
      error
    });
    it(`should add an entry for ${id} with 'noneError'`, () => {
      expect(reducer(undefined, actionRequest)[id]).toEqual(
        pot.noneError(error.message)
      );
    });

    describe(`and an entry for ${id} already exists`, () => {
      const initialState = { [id]: pot.some(successLoadMessageDetails) };
      it(`should update the entry to error state preserving the data`, () => {
        const entry = reducer(initialState, actionRequest)[id];
        expect(pot.isError(entry)).toBe(true);
        expect(pot.isSome(entry)).toBe(true);
        expect(pot.toUndefined(entry)).toBeDefined();
      });
    });
  });
});
