import * as E from "fp-ts/lib/Either";
import { call, take } from "typed-redux-saga/macro";
import { testSaga } from "redux-saga-test-plan";
import { Effect } from "redux-saga/effects";
import { SessionToken } from "../../../../../types/SessionToken";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import {
  createSendLollipopLambdaClient,
  SendLollipopLambdaClient
} from "../../api";
import { sendLollipopLambdaAction } from "../../store/actions";
import { testable, watchSendLollipopLambda } from "..";
import { apiUrlPrefix } from "../../../../../config";
import { SuccessResponse } from "../../../../../../definitions/pn/lollipop-lambda/SuccessResponse";
import { MethodEnum } from "../../../../../../definitions/pn/lollipop-lambda/RequestInfo";
import { ErrorResponse } from "../../../../../../definitions/pn/lollipop-lambda/ErrorResponse";

const {
  bodyStringToObject,
  buildLambdaLollipopRequest,
  lollipopLambdaSaga,
  raceLollipopLambdaWithCancellation
} = testable!;

const mockSuccessResponse: SuccessResponse = {
  success: true,
  timestamp: new Date(),
  data: {
    message: "Mock message",
    timestamp: new Date(),
    request: {
      method: MethodEnum.GET,
      path: "/",
      hasBody: false,
      bodyLength: 0
    }
  }
};
const mockErrorResponse: ErrorResponse = {
  success: false,
  timestamp: new Date(),
  error: {
    message: "Mock message",
    statusCode: 0
  }
};

const mockSessionToken = "mock-session-token" as SessionToken;
const mockKeyInfo = {} as KeyInfo;

const mockClient: SendLollipopLambdaClient = {
  testLollipopGet: jest.fn(),
  testLollipopPost: jest.fn()
};

describe("watchSendLollipopLambda", () => {
  it("should setup takeLatest for sendLollipopLambdaAction.request", () => {
    testSaga(watchSendLollipopLambda, mockSessionToken, mockKeyInfo)
      .next()
      .call(
        createSendLollipopLambdaClient,
        apiUrlPrefix,
        mockSessionToken,
        mockKeyInfo
      )
      .next(mockClient)
      .takeLatest(
        sendLollipopLambdaAction.request,
        raceLollipopLambdaWithCancellation,
        mockClient
      )
      .next()
      .isDone();
  });
});

describe("bodyStringToObject", () => {
  it("should return right with empty object when input is undefined", () => {
    const result = bodyStringToObject(undefined);
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual({});
    }
  });

  it("should return right with empty object when input is empty string", () => {
    const result = bodyStringToObject("");
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual({});
    }
  });

  it("should return right with empty object when input is whitespace only", () => {
    const result = bodyStringToObject("   ");
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual({});
    }
  });

  it("should return right with parsed object when input is valid JSON", () => {
    const input = '{"name": "John", "age": 30}';
    const result = bodyStringToObject(input);
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual({ name: "John", age: 30 });
    }
  });

  it("should return right with parsed complex object", () => {
    const input = '{"nested": {"array": [1, 2, 3]}, "flag": true}';
    const result = bodyStringToObject(input);
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual({
        nested: { array: [1, 2, 3] },
        flag: true
      });
    }
  });

  it("should return right with parsed array", () => {
    const input = '[1, 2, 3, "test"]';
    const result = bodyStringToObject(input);
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual([1, 2, 3, "test"]);
    }
  });

  it("should return left with error message when input is invalid JSON", () => {
    const input = '{"invalid": json}';
    const result = bodyStringToObject(input);
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toContain("Bad JSON for request body");
    }
  });

  it("should return left when input has unclosed braces", () => {
    const input = '{"unclosed": "brace"';
    const result = bodyStringToObject(input);
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toContain("Bad JSON for request body");
    }
  });

  it("should return left when input has trailing comma", () => {
    const input = '{"key": "value",}';
    const result = bodyStringToObject(input);
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toContain("Bad JSON for request body");
    }
  });
});

describe("buildLambdaLollipopRequest", () => {
  const mockGetRequest = jest.fn();
  const mockPostRequest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRequest.mockReturnValue("get-request");
    mockPostRequest.mockReturnValue("post-request");
  });

  const clientWithMocks = {
    testLollipopGet: mockGetRequest,
    testLollipopPost: mockPostRequest
  } as unknown as SendLollipopLambdaClient;

  it("should return right with Get request when httpVerb is Get", () => {
    const result = buildLambdaLollipopRequest(
      "Get",
      clientWithMocks,
      false,
      undefined
    );

    expect(E.isRight(result)).toBe(true);
    expect(mockGetRequest).toHaveBeenCalledWith({ isTest: false });
    expect(mockPostRequest).not.toHaveBeenCalled();
  });

  it("should return right with Get request when httpVerb is Get and isTest is true", () => {
    const result = buildLambdaLollipopRequest(
      "Get",
      clientWithMocks,
      true,
      undefined
    );

    expect(E.isRight(result)).toBe(true);
    expect(mockGetRequest).toHaveBeenCalledWith({ isTest: true });
  });

  it("should return right with Post request when httpVerb is Post and body is valid JSON", () => {
    const requestBody = '{"key": "value"}';
    const result = buildLambdaLollipopRequest(
      "Post",
      clientWithMocks,
      false,
      requestBody
    );

    expect(E.isRight(result)).toBe(true);
    expect(mockPostRequest).toHaveBeenCalledWith({
      isTest: false,
      body: { key: "value" }
    });
    expect(mockGetRequest).not.toHaveBeenCalled();
  });

  it("should return right with Post request with empty object when body is empty", () => {
    const result = buildLambdaLollipopRequest(
      "Post",
      clientWithMocks,
      true,
      ""
    );

    expect(E.isRight(result)).toBe(true);
    expect(mockPostRequest).toHaveBeenCalledWith({
      isTest: true,
      body: {}
    });
  });

  it("should return right with Post request with empty object when body is undefined", () => {
    const result = buildLambdaLollipopRequest(
      "Post",
      clientWithMocks,
      false,
      undefined
    );

    expect(E.isRight(result)).toBe(true);
    expect(mockPostRequest).toHaveBeenCalledWith({
      isTest: false,
      body: {}
    });
  });

  it("should return left when Post has invalid JSON body", () => {
    const invalidBody = '{"invalid": json}';
    const result = buildLambdaLollipopRequest(
      "Post",
      clientWithMocks,
      false,
      invalidBody
    );

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toContain("Bad JSON for request body");
    }
    expect(mockPostRequest).not.toHaveBeenCalled();
  });

  it("should return right with Post request for complex nested body", () => {
    const complexBody =
      '{"data": {"items": [1, 2, 3]}, "metadata": {"count": 3}}';
    const result = buildLambdaLollipopRequest(
      "Post",
      clientWithMocks,
      true,
      complexBody
    );

    expect(E.isRight(result)).toBe(true);
    expect(mockPostRequest).toHaveBeenCalledWith({
      isTest: true,
      body: { data: { items: [1, 2, 3] }, metadata: { count: 3 } }
    });
  });
});

describe("raceLollipopLambdaWithCancellation", () => {
  const mockAction = sendLollipopLambdaAction.request({
    httpVerb: "Get",
    body: "test"
  });

  it("should race between task and cancel action", () => {
    testSaga(raceLollipopLambdaWithCancellation, mockClient, mockAction)
      .next()
      .race({
        task: call(lollipopLambdaSaga, mockClient, mockAction),
        cancel: take(sendLollipopLambdaAction.cancel)
      } as unknown as { [key: string]: Effect })
      .next()
      .isDone();
  });
});

describe("lollipopLambdaSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Get requests", () => {
    const getAction = sendLollipopLambdaAction.request({
      httpVerb: "Get",
      body: ""
    });

    it("should successfully handle Get request with 200 response", () => {
      const mockResponse = E.right({
        status: 200,
        value: mockSuccessResponse
      });

      const mockGetRequest = jest.fn().mockReturnValue("get-request");
      const clientWithGet = {
        testLollipopGet: mockGetRequest,
        testLollipopPost: jest.fn()
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithGet, getAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .call(withRefreshApiCall, "get-request", getAction)
        .next(mockResponse)
        .put(
          sendLollipopLambdaAction.success({
            statusCode: 200,
            responseBody: mockSuccessResponse
          })
        )
        .next()
        .isDone();

      expect(mockGetRequest).toHaveBeenCalledWith({ isTest: false });
    });

    it("should handle Get request with 401 response", () => {
      const mockResponse = E.right({
        status: 401,
        value: undefined
      });

      const mockGetRequest = jest.fn().mockReturnValue("get-request");
      const clientWithGet = {
        testLollipopGet: mockGetRequest,
        testLollipopPost: jest.fn()
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithGet, getAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(withRefreshApiCall, "get-request", getAction)
        .next(mockResponse)
        .put(
          sendLollipopLambdaAction.success({
            statusCode: 401,
            responseBody: undefined
          })
        )
        .next()
        .isDone();

      expect(mockGetRequest).toHaveBeenCalledWith({ isTest: true });
    });

    it("should handle Get request with 500 response", () => {
      const mockResponse = E.right({
        status: 500,
        value: mockErrorResponse
      });

      const mockGetRequest = jest.fn().mockReturnValue("get-request");
      const clientWithGet = {
        testLollipopGet: mockGetRequest,
        testLollipopPost: jest.fn()
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithGet, getAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .call(withRefreshApiCall, "get-request", getAction)
        .next(mockResponse)
        .put(
          sendLollipopLambdaAction.success({
            statusCode: 500,
            responseBody: mockErrorResponse
          })
        )
        .next()
        .isDone();
    });

    it("should handle decoding failure for Get request", () => {
      const mockFailure = E.left([]);

      const mockGetRequest = jest.fn().mockReturnValue("get-request");
      const clientWithGet = {
        testLollipopGet: mockGetRequest,
        testLollipopPost: jest.fn()
      } as unknown as SendLollipopLambdaClient;

      const expectedReason = "An error was thrown (Decoding failure ())";

      testSaga(lollipopLambdaSaga, clientWithGet, getAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .call(withRefreshApiCall, "get-request", getAction)
        .next(mockFailure)
        .put(
          sendLollipopLambdaAction.failure({
            reason: expectedReason,
            type: "failure"
          })
        )
        .next()
        .isDone();
    });
  });

  describe("Post requests", () => {
    const validBody = '{"key": "value"}';
    const postAction = sendLollipopLambdaAction.request({
      httpVerb: "Post",
      body: validBody
    });

    it("should successfully handle Post request with 200 response", () => {
      const mockResponse = E.right({
        status: 200,
        value: mockSuccessResponse
      });

      const mockPostRequest = jest.fn().mockReturnValue("post-request");
      const clientWithPost = {
        testLollipopGet: jest.fn(),
        testLollipopPost: mockPostRequest
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithPost, postAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(withRefreshApiCall, "post-request", postAction)
        .next(mockResponse)
        .put(
          sendLollipopLambdaAction.success({
            statusCode: 200,
            responseBody: mockSuccessResponse
          })
        )
        .next()
        .isDone();

      expect(mockPostRequest).toHaveBeenCalledWith({
        isTest: true,
        body: { key: "value" }
      });
    });

    it("should handle Post request with 401 response", () => {
      const mockResponse = E.right({
        status: 401,
        value: undefined
      });

      const mockPostRequest = jest.fn().mockReturnValue("post-request");
      const clientWithPost = {
        testLollipopGet: jest.fn(),
        testLollipopPost: mockPostRequest
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithPost, postAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .call(withRefreshApiCall, "post-request", postAction)
        .next(mockResponse)
        .put(
          sendLollipopLambdaAction.success({
            statusCode: 401,
            responseBody: undefined
          })
        )
        .next()
        .isDone();
    });

    it("should handle Post request with 500 response", () => {
      const mockResponse = E.right({
        status: 500,
        value: mockErrorResponse
      });

      const mockPostRequest = jest.fn().mockReturnValue("post-request");
      const clientWithPost = {
        testLollipopGet: jest.fn(),
        testLollipopPost: mockPostRequest
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithPost, postAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .call(withRefreshApiCall, "post-request", postAction)
        .next(mockResponse)
        .put(
          sendLollipopLambdaAction.success({
            statusCode: 500,
            responseBody: mockErrorResponse
          })
        )
        .next()
        .isDone();
    });

    it("should handle invalid JSON body in Post request", () => {
      const invalidPostAction = sendLollipopLambdaAction.request({
        httpVerb: "Post",
        body: '{"invalid": json}'
      });

      testSaga(lollipopLambdaSaga, mockClient, invalidPostAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .put(
          sendLollipopLambdaAction.failure({
            reason: `Bad JSON for request body (Unexpected token 'j', "{"invalid": json}" is not valid JSON)`,
            type: "invalidInput"
          })
        )
        .next()
        .isDone();
    });

    it("should handle decoding failure for Post request", () => {
      const mockFailure = E.left([]);

      const mockPostRequest = jest.fn().mockReturnValue("post-request");
      const clientWithPost = {
        testLollipopGet: jest.fn(),
        testLollipopPost: mockPostRequest
      } as unknown as SendLollipopLambdaClient;

      const expectedReason = "An error was thrown (Decoding failure ())";

      testSaga(lollipopLambdaSaga, clientWithPost, postAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .call(withRefreshApiCall, "post-request", postAction)
        .next(mockFailure)
        .put(
          sendLollipopLambdaAction.failure({
            reason: expectedReason,
            type: "failure"
          })
        )
        .next()
        .isDone();
    });
  });

  describe("Error handling", () => {
    const getAction = sendLollipopLambdaAction.request({
      httpVerb: "Get",
      body: ""
    });
    it("should handle thrown Error", () => {
      const errorString = "Something went wrong";
      const mockGetRequest = jest.fn().mockReturnValue("get-request");
      const clientWithGet = {
        testLollipopGet: mockGetRequest,
        testLollipopPost: jest.fn()
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithGet, getAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .throw(Error(errorString))
        .put(
          sendLollipopLambdaAction.failure({
            reason: `An error was thrown (${errorString})`,
            type: "failure"
          })
        )
        .next()
        .isDone();
    });

    it("should handle unknown error type", () => {
      const mockGetRequest = jest.fn().mockReturnValue("get-request");
      const clientWithGet = {
        testLollipopGet: mockGetRequest,
        testLollipopPost: jest.fn()
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithGet, getAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(false)
        .throw(Error("error object"))
        .put(
          sendLollipopLambdaAction.failure({
            reason: "An error was thrown (error object)",
            type: "failure"
          })
        )
        .next()
        .isDone();
    });
  });

  describe("Environment flag", () => {
    const getAction = sendLollipopLambdaAction.request({
      httpVerb: "Get",
      body: ""
    });

    it("should pass isTest=true when isPnTestEnabledSelector returns true", () => {
      const mockResponse = E.right({
        status: 200,
        value: mockSuccessResponse
      });

      const mockGetRequest = jest.fn().mockReturnValue("get-request");
      const clientWithGet = {
        testLollipopGet: mockGetRequest,
        testLollipopPost: jest.fn()
      } as unknown as SendLollipopLambdaClient;

      testSaga(lollipopLambdaSaga, clientWithGet, getAction)
        .next()
        .select(isPnTestEnabledSelector)
        .next(true) // isPnTestEnabled = true
        .call(withRefreshApiCall, "get-request", getAction)
        .next(mockResponse)
        .put(
          sendLollipopLambdaAction.success({
            statusCode: 200,
            responseBody: mockSuccessResponse
          })
        )
        .next()
        .isDone();

      expect(mockGetRequest).toHaveBeenCalledWith({ isTest: true });
    });
  });
});
