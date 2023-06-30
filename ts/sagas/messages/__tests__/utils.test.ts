import * as E from "fp-ts/lib/Either";
import { ValidationError } from "io-ts";
import { IResponseType } from "@pagopa/ts-commons/lib/requests";

import { handleResponse, ResponseType } from "../utils";
import { reloadAllMessages } from "../../../store/actions/messages";
import {
  defaultRequestError,
  defaultRequestPayload
} from "../../../__mocks__/messages";

describe("`handleResponse` function", () => {
  describe("given a failure", () => {
    const failure: E.Either<
      Array<ValidationError>,
      ResponseType<unknown>
    > = E.left([
      {
        value: 42,
        context: [],
        message: "a password here"
      } as ValidationError
    ]);

    it("should run `onFailure` callback with a privacy report", () => {
      const onFailure = jest.fn();
      handleResponse(failure, jest.fn(), onFailure);
      expect(onFailure).toHaveBeenNthCalledWith(
        1,
        new Error("some value at [root] is not a known property")
      );
    });

    it("should not run `onSuccess` callback", () => {
      const onSuccess = jest.fn();
      handleResponse(failure, onSuccess, jest.fn());
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("given a success", () => {
    describe("with a 200 status", () => {
      const success: E.Either<
        Array<ValidationError>,
        ResponseType<string>
      > = E.right({ status: 200, value: "حبيبتي" } as IResponseType<
        200,
        string
      >);

      it("should run `onSuccess` callback with the response and return its action", () => {
        const expectedAction = reloadAllMessages.request(defaultRequestPayload);
        const onSuccess = jest.fn(() => expectedAction);
        const action = handleResponse(success, onSuccess, jest.fn());
        expect(onSuccess).toHaveBeenNthCalledWith(1, "حبيبتي");
        expect(action).toEqual(expectedAction);
      });

      it("should not run `onFailure` callback", () => {
        const onFailure = jest.fn();
        handleResponse(success, jest.fn(), onFailure);
        expect(onFailure).not.toHaveBeenCalled();
      });
    });

    describe("with a 401 status", () => {
      const success: E.Either<Array<ValidationError>, any> = E.right({
        status: 401,
        value: {}
      });

      it("should run neither `onSuccess` nor `onFailure` callback", () => {
        const onSuccess = jest.fn();
        const onFailure = jest.fn();
        handleResponse(success, onSuccess, onFailure);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onFailure).not.toHaveBeenCalled();
      });

      it("should return `sessionExpired` action", () => {
        expect(handleResponse(success, jest.fn(), jest.fn())).toEqual(
          undefined
        );
      });
    });

    describe("with a 500 status", () => {
      const success: E.Either<Array<ValidationError>, any> = E.right({
        status: 500,
        value: { title: "seriously?" }
      });

      it("should run `onFailure` callback with the error and return its action", () => {
        const expectedAction = reloadAllMessages.failure(defaultRequestError);
        const onFailure = jest.fn(() => expectedAction);
        const action = handleResponse(success, jest.fn(), onFailure);
        expect(onFailure).toHaveBeenNthCalledWith(1, new Error("seriously?"));
        expect(action).toEqual(expectedAction);
      });

      it("should not run `onSuccess` callback", () => {
        const onSuccess = jest.fn();
        handleResponse(success, onSuccess, jest.fn());
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe("with any other status", () => {
    const success: E.Either<Array<ValidationError>, any> = E.right({
      status: Math.random(),
      value: {}
    });

    it("should run `onFailure` callback with the UNKNOWN error", () => {
      const onFailure = jest.fn();
      handleResponse(success, jest.fn(), onFailure);
      expect(onFailure).toHaveBeenNthCalledWith(1, new Error("UNKNOWN"));
    });

    // eslint-disable-next-line sonarjs/no-identical-functions
    it("should not run `onSuccess` callback", () => {
      const onSuccess = jest.fn();
      handleResponse(success, onSuccess, jest.fn());
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});
