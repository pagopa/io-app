import { sendLollipopLambdaAction } from "../../actions";
import {
  INITIAL_LOLLIPOP_LAMBDA_STATE,
  lollipopLambdaReducer,
  SENDLollipopLambdaState
} from "..";
import { applicationChangeState } from "../../../../../../store/actions/application";

describe("lollipopLambdaReducer", () => {
  describe("INITIAL_LOLLIPOP_LAMBDA_STATE", () => {
    it("should match expected initial state", () => {
      expect(INITIAL_LOLLIPOP_LAMBDA_STATE).toEqual({
        type: "idle"
      });
    });
  });

  describe("sendLollipopLambdaAction.cancel", () => {
    it("should reset state to idle when cancelling from loading state", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Get"
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.cancel()
      );

      expect(result).toEqual({
        type: "idle"
      });
    });

    it("should reset state to idle when cancelling from failure state", () => {
      const failureState: SENDLollipopLambdaState = {
        type: "failure",
        reason: "Network error"
      };

      const result = lollipopLambdaReducer(
        failureState,
        sendLollipopLambdaAction.cancel()
      );

      expect(result).toEqual({
        type: "idle"
      });
    });

    it("should reset state to idle when cancelling from responseReceived state", () => {
      const responseReceivedState: SENDLollipopLambdaState = {
        type: "responseReceived",
        statusCode: 200,
        responseBody: { message: "Success" } as any
      };

      const result = lollipopLambdaReducer(
        responseReceivedState,
        sendLollipopLambdaAction.cancel()
      );

      expect(result).toEqual({
        type: "idle"
      });
    });

    it("should keep state as idle when cancelling from idle state", () => {
      const idleState: SENDLollipopLambdaState = {
        type: "idle"
      };

      const result = lollipopLambdaReducer(
        idleState,
        sendLollipopLambdaAction.cancel()
      );

      expect(result).toEqual({
        type: "idle"
      });
    });
  });

  describe("sendLollipopLambdaAction.request", () => {
    it("should transition to loading state with Get httpVerb", () => {
      const idleState: SENDLollipopLambdaState = {
        type: "idle"
      };

      const requestPayload = {
        httpVerb: "Get" as const,
        body: "test body content"
      };

      const result = lollipopLambdaReducer(
        idleState,
        sendLollipopLambdaAction.request(requestPayload)
      );

      expect(result).toEqual({
        type: "loading",
        body: "test body content",
        httpVerb: "Get"
      });
    });

    it("should transition to loading state with Post httpVerb", () => {
      const idleState: SENDLollipopLambdaState = {
        type: "idle"
      };

      const requestPayload = {
        httpVerb: "Post" as const,
        body: '{"key": "value"}'
      };

      const result = lollipopLambdaReducer(
        idleState,
        sendLollipopLambdaAction.request(requestPayload)
      );

      expect(result).toEqual({
        type: "loading",
        body: '{"key": "value"}',
        httpVerb: "Post"
      });
    });

    it("should transition to loading state from any previous state", () => {
      const failureState: SENDLollipopLambdaState = {
        type: "failure",
        reason: "Previous error"
      };

      const requestPayload = {
        httpVerb: "Get" as const,
        body: "retry body"
      };

      const result = lollipopLambdaReducer(
        failureState,
        sendLollipopLambdaAction.request(requestPayload)
      );

      expect(result).toEqual({
        type: "loading",
        body: "retry body",
        httpVerb: "Get"
      });
    });

    it("should handle empty body string", () => {
      const idleState: SENDLollipopLambdaState = {
        type: "idle"
      };

      const requestPayload = {
        httpVerb: "Post" as const,
        body: ""
      };

      const result = lollipopLambdaReducer(
        idleState,
        sendLollipopLambdaAction.request(requestPayload)
      );

      expect(result).toEqual({
        type: "loading",
        body: "",
        httpVerb: "Post"
      });
    });
  });

  describe("sendLollipopLambdaAction.success", () => {
    it("should transition to responseReceived state with status 200 and response body", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Get"
      };

      const successPayload = {
        statusCode: 200,
        responseBody: { message: "Success", data: "test" } as any
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.success(successPayload)
      );

      expect(result).toEqual({
        type: "responseReceived",
        statusCode: 200,
        responseBody: { message: "Success", data: "test" }
      });
    });

    it("should handle status 404 with error response body", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Post"
      };

      const successPayload = {
        statusCode: 404,
        responseBody: { error: "Not found" } as any
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.success(successPayload)
      );

      expect(result).toEqual({
        type: "responseReceived",
        statusCode: 404,
        responseBody: { error: "Not found" }
      });
    });

    it("should handle status 500 with error response body", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Get"
      };

      const successPayload = {
        statusCode: 500,
        responseBody: { error: "Internal server error" } as any
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.success(successPayload)
      );

      expect(result).toEqual({
        type: "responseReceived",
        statusCode: 500,
        responseBody: { error: "Internal server error" }
      });
    });

    it("should handle undefined response body", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Get"
      };

      const successPayload = {
        statusCode: 204,
        responseBody: undefined
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.success(successPayload)
      );

      expect(result).toEqual({
        type: "responseReceived",
        statusCode: 204,
        responseBody: undefined
      });
    });

    it("should handle status 201 with nested response structure", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Post"
      };

      const successPayload = {
        statusCode: 201,
        responseBody: {
          data: { id: "123", nested: { value: "test" } },
          status: "created"
        } as any
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.success(successPayload)
      );

      expect(result).toEqual({
        type: "responseReceived",
        statusCode: 201,
        responseBody: {
          data: { id: "123", nested: { value: "test" } },
          status: "created"
        }
      });
    });
  });

  describe("sendLollipopLambdaAction.failure", () => {
    it("should transition to failure state with type 'failure'", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Get"
      };

      const failurePayload = {
        type: "failure" as const,
        reason: "Network connection error"
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.failure(failurePayload)
      );

      expect(result).toEqual({
        type: "failure",
        reason: "Network connection error"
      });
    });

    it("should transition to invalidInput state with type 'invalidInput'", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Post"
      };

      const failurePayload = {
        type: "invalidInput" as const,
        reason: "Invalid request body format"
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.failure(failurePayload)
      );

      expect(result).toEqual({
        type: "invalidInput",
        reason: "Invalid request body format"
      });
    });

    it("should handle failure from idle state", () => {
      const idleState: SENDLollipopLambdaState = {
        type: "idle"
      };

      const failurePayload = {
        type: "failure" as const,
        reason: "Unexpected error"
      };

      const result = lollipopLambdaReducer(
        idleState,
        sendLollipopLambdaAction.failure(failurePayload)
      );

      expect(result).toEqual({
        type: "failure",
        reason: "Unexpected error"
      });
    });

    it("should handle failure with timeout reason", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Get"
      };

      const failurePayload = {
        type: "failure" as const,
        reason: "Request timeout after 30 seconds"
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.failure(failurePayload)
      );

      expect(result).toEqual({
        type: "failure",
        reason: "Request timeout after 30 seconds"
      });
    });

    it("should handle invalidInput with validation error", () => {
      const loadingState: SENDLollipopLambdaState = {
        type: "loading",
        body: "test body",
        httpVerb: "Post"
      };

      const failurePayload = {
        type: "invalidInput" as const,
        reason: "Missing required field: userId"
      };

      const result = lollipopLambdaReducer(
        loadingState,
        sendLollipopLambdaAction.failure(failurePayload)
      );

      expect(result).toEqual({
        type: "invalidInput",
        reason: "Missing required field: userId"
      });
    });
  });

  describe("Unrelated action", () => {
    it("should return initial state when state is undefined and action is unrelated", () => {
      const unrelatedAction = applicationChangeState("active");

      const result = lollipopLambdaReducer(undefined, unrelatedAction);

      expect(result).toEqual(INITIAL_LOLLIPOP_LAMBDA_STATE);
    });

    it("should not mutate state when receiving unknown action", () => {
      const currentState: SENDLollipopLambdaState = {
        type: "responseReceived",
        statusCode: 200,
        responseBody: { data: "test" } as any
      };

      const stateCopy = { ...currentState };

      const unrelatedAction = applicationChangeState("active");

      const result = lollipopLambdaReducer(currentState, unrelatedAction);

      expect(result).toEqual(stateCopy);
      expect(result).toEqual(currentState);
    });
  });
});
