import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  paymentValidInvalidAfterDueDate,
  successLoadMessageDetails
} from "../../../__mocks__/message";

import { loadMessageDetails } from "../../actions";
import { PaymentData, UIMessageDetails, UIMessageId } from "../../../types";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  detailsByIdReducer,
  messageDetailsByIdSelector,
  messagePaymentDataSelector
} from "../detailsById";

const id = paymentValidInvalidAfterDueDate.id as UIMessageId;

describe("detailsById reducer", () => {
  describe(`when a ${getType(loadMessageDetails.request)} is sent`, () => {
    const actionRequest = loadMessageDetails.request({ id });
    it(`should add an entry for ${id} with 'noneLoading'`, () => {
      expect(detailsByIdReducer(undefined, actionRequest)[id]).toEqual(
        pot.noneLoading
      );
    });

    describe(`and an entry for ${id} already exists`, () => {
      const initialState = { [id]: pot.some(successLoadMessageDetails) };
      it(`should update the entry to loading state preserving the data`, () => {
        const entry = detailsByIdReducer(initialState, actionRequest)[id];
        expect(pot.isLoading(entry)).toBe(true);
        expect(pot.isSome(entry)).toBe(true);
        expect(pot.toUndefined(entry)).toBeDefined();
      });
    });
  });

  describe(`when a ${getType(loadMessageDetails.success)} is sent`, () => {
    const actionRequest = loadMessageDetails.success(successLoadMessageDetails);
    it(`should add an entry for ${id}`, () => {
      const entry = detailsByIdReducer(undefined, actionRequest)[id];
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
      expect(detailsByIdReducer(undefined, actionRequest)[id]).toEqual(
        pot.noneError(error.message)
      );
    });

    describe(`and an entry for ${id} already exists`, () => {
      const initialState = { [id]: pot.some(successLoadMessageDetails) };
      it(`should update the entry to error state preserving the data`, () => {
        const entry = detailsByIdReducer(initialState, actionRequest)[id];
        expect(pot.isError(entry)).toBe(true);
        expect(pot.isSome(entry)).toBe(true);
        expect(pot.toUndefined(entry)).toBeDefined();
      });
    });
  });
});

describe("messageDetailsByIdSelector", () => {
  it("Should return pot.none for an unmatching message id", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const messageDetailsPot = messageDetailsByIdSelector(
      state,
      "" as UIMessageId
    );
    expect(messageDetailsPot).toBe(pot.none);
  });
  it("Should return pot.noneLoading for a matching loading message id", () => {
    const messageId = "m1" as UIMessageId;
    const action = loadMessageDetails.request({ id: messageId });
    const state = appReducer(undefined, action);
    const messageDetailsPot = messageDetailsByIdSelector(state, messageId);
    expect(messageDetailsPot).toBe(pot.noneLoading);
  });
});

describe("messagePaymentData selector", () => {
  it("should return undefined when the state is empty", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const messageId = "01HR9ZVVKPQDGQ97TT83AN1W8C" as UIMessageId;
    const paymentData = messagePaymentDataSelector(appState, messageId);
    expect(paymentData).toBeUndefined();
  });
  it("should return undefined when there is no message match", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HRA095RSRSY7Z2DJQ0H8N3TR": pot.some({
              paymentData: {}
            } as UIMessageDetails)
          }
        }
      }
    } as GlobalState;
    const paymentData = messagePaymentDataSelector(
      finalState,
      "01HR9ZVVKPQDGQ97TT83AN1W8C" as UIMessageId
    );
    expect(paymentData).toBeUndefined();
  });
  it("should return undefined when the message has no payment data", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HR9ZVVKPQDGQ97TT83AN1W8C": pot.some({} as UIMessageDetails)
          }
        }
      }
    } as GlobalState;
    const paymentData = messagePaymentDataSelector(
      finalState,
      "01HR9ZVVKPQDGQ97TT83AN1W8C" as UIMessageId
    );
    expect(paymentData).toBeUndefined();
  });
  it("should match returned payment data", () => {
    const paymentData = {} as PaymentData;
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HR9ZVVKPQDGQ97TT83AN1W8C": pot.some({
              paymentData
            } as UIMessageDetails)
          }
        }
      }
    } as GlobalState;
    const returnedPaymentData = messagePaymentDataSelector(
      finalState,
      "01HR9ZVVKPQDGQ97TT83AN1W8C" as UIMessageId
    );
    expect(returnedPaymentData).toBe(paymentData);
  });
});
