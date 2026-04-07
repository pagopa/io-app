import { GlobalState } from "../../../../../../store/reducers/types";
import {
  isSendLollipopLambdaLoading,
  sendLollipopLambdaErrorReason,
  sendLollipopLambdaResponseBodyString,
  sendLollipopLambdaResponseStatusCode
} from "..";
import { SENDLollipopLambdaState } from "../../reducers";

const createMockGlobalState = (
  lollipopLambdaState: SENDLollipopLambdaState
): GlobalState =>
  ({
    features: {
      pn: {
        lollipopLambda: lollipopLambdaState
      }
    }
  } as GlobalState);

describe("isSendLollipopLambdaLoading", () => {
  it("should return true when state type is loading", () => {
    const state = createMockGlobalState({
      type: "loading",
      body: "test body",
      httpVerb: "Get"
    });

    expect(isSendLollipopLambdaLoading(state)).toBe(true);
  });

  it("should return false when state type is idle", () => {
    const state = createMockGlobalState({
      type: "idle"
    });

    expect(isSendLollipopLambdaLoading(state)).toBe(false);
  });

  it("should return false when state type is failure", () => {
    const state = createMockGlobalState({
      type: "failure",
      reason: "test error"
    });

    expect(isSendLollipopLambdaLoading(state)).toBe(false);
  });

  it("should return false when state type is invalidInput", () => {
    const state = createMockGlobalState({
      type: "invalidInput",
      reason: "test error"
    });

    expect(isSendLollipopLambdaLoading(state)).toBe(false);
  });

  it("should return false when state type is responseReceived", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 200,
      responseBody: undefined
    });

    expect(isSendLollipopLambdaLoading(state)).toBe(false);
  });
});

describe("sendLollipopLambdaErrorReason", () => {
  it("should return reason when state type is failure", () => {
    const errorReason = "Network error occurred";
    const state = createMockGlobalState({
      type: "failure",
      reason: errorReason
    });

    expect(sendLollipopLambdaErrorReason(state)).toBe(errorReason);
  });

  it("should return reason when state type is invalidInput", () => {
    const errorReason = "Invalid input provided";
    const state = createMockGlobalState({
      type: "invalidInput",
      reason: errorReason
    });

    expect(sendLollipopLambdaErrorReason(state)).toBe(errorReason);
  });

  it("should return undefined when state type is idle", () => {
    const state = createMockGlobalState({
      type: "idle"
    });

    expect(sendLollipopLambdaErrorReason(state)).toBeUndefined();
  });

  it("should return undefined when state type is loading", () => {
    const state = createMockGlobalState({
      type: "loading",
      body: "test body",
      httpVerb: "Post"
    });

    expect(sendLollipopLambdaErrorReason(state)).toBeUndefined();
  });

  it("should return undefined when state type is responseReceived", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 200,
      responseBody: undefined
    });

    expect(sendLollipopLambdaErrorReason(state)).toBeUndefined();
  });
});

describe("sendLollipopLambdaResponseStatusCode", () => {
  it("should return statusCode when state type is responseReceived with status 200", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 200,
      responseBody: undefined
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBe(200);
  });

  it("should return statusCode when state type is responseReceived with status 400", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 400,
      responseBody: undefined
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBe(400);
  });

  it("should return statusCode when state type is responseReceived with status 401", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 401,
      responseBody: undefined
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBe(401);
  });

  it("should return statusCode when state type is responseReceived with status 403", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 403,
      responseBody: undefined
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBe(403);
  });

  it("should return statusCode when state type is responseReceived with status 500", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 500,
      responseBody: { message: "Server error" } as any
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBe(500);
  });

  it("should return undefined when state type is idle", () => {
    const state = createMockGlobalState({
      type: "idle"
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBeUndefined();
  });

  it("should return undefined when state type is loading", () => {
    const state = createMockGlobalState({
      type: "loading",
      body: "test body",
      httpVerb: "Get"
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBeUndefined();
  });

  it("should return undefined when state type is failure", () => {
    const state = createMockGlobalState({
      type: "failure",
      reason: "test error"
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBeUndefined();
  });

  it("should return undefined when state type is invalidInput", () => {
    const state = createMockGlobalState({
      type: "invalidInput",
      reason: "test error"
    });

    expect(sendLollipopLambdaResponseStatusCode(state)).toBeUndefined();
  });
});

describe("sendLollipopLambdaResponseBodyString", () => {
  it("should return stringified responseBody when state type is responseReceived with valid object", () => {
    const responseBody = { data: "test", value: 123 };
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 200,
      responseBody: responseBody as any
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBe(
      JSON.stringify(responseBody)
    );
  });

  it("should return stringified responseBody when state type is responseReceived with nested object", () => {
    const responseBody = {
      nested: { data: "test", items: [1, 2, 3] },
      status: "success"
    };
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 200,
      responseBody: responseBody as any
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBe(
      JSON.stringify(responseBody)
    );
  });

  it("should return stringified responseBody when responseBody is undefined", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 204,
      responseBody: undefined
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBe(
      JSON.stringify(undefined)
    );
  });

  it("should return error reason when JSON.stringify throws an error", () => {
    const circularRef: any = {};
    // eslint-disable-next-line functional/immutable-data
    circularRef.self = circularRef;

    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 200,
      responseBody: circularRef
    });

    const result = sendLollipopLambdaResponseBodyString(state);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    // Should contain error message about circular structure
    expect(result).toContain("circular");
  });

  it("should return undefined when state type is idle", () => {
    const state = createMockGlobalState({
      type: "idle"
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBeUndefined();
  });

  it("should return undefined when state type is loading", () => {
    const state = createMockGlobalState({
      type: "loading",
      body: "test body",
      httpVerb: "Post"
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBeUndefined();
  });

  it("should return undefined when state type is failure", () => {
    const state = createMockGlobalState({
      type: "failure",
      reason: "test error"
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBeUndefined();
  });

  it("should return undefined when state type is invalidInput", () => {
    const state = createMockGlobalState({
      type: "invalidInput",
      reason: "test error"
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBeUndefined();
  });

  it("should handle empty object responseBody", () => {
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 200,
      responseBody: {} as any
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBe(
      JSON.stringify({})
    );
  });

  it("should handle array responseBody", () => {
    const responseBody = [1, 2, 3, 4, 5];
    const state = createMockGlobalState({
      type: "responseReceived",
      statusCode: 200,
      responseBody: responseBody as any
    });

    expect(sendLollipopLambdaResponseBodyString(state)).toBe(
      JSON.stringify(responseBody)
    );
  });
});
