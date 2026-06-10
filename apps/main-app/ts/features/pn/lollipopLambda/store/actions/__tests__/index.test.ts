import { sendLollipopLambdaAction } from "../";

describe("sendLollipopLambdaAction", () => {
  it("should create request action", () => {
    const payload = {
      httpVerb: "Get" as const,
      body: "dummy body"
    };

    const expectedAction = {
      type: "SEND_LOLLIPOP_LAMBDA_REQUEST",
      payload
    };

    expect(sendLollipopLambdaAction.request(payload)).toEqual(expectedAction);
  });

  it("should create success action", () => {
    const payload = {
      statusCode: 200,
      responseBody: {} as any
    };

    const expectedAction = {
      type: "SEND_LOLLIPOP_LAMBDA_SUCCESS",
      payload
    };

    expect(sendLollipopLambdaAction.success(payload)).toEqual(expectedAction);
  });

  it("should create failure action", () => {
    const payload = {
      reason: "error reason",
      type: "failure" as const
    };

    const expectedAction = {
      type: "SEND_LOLLIPOP_LAMBDA_FAILURE",
      payload
    };

    expect(sendLollipopLambdaAction.failure(payload)).toEqual(expectedAction);
  });

  it("should create cancel action", () => {
    const expectedAction = {
      type: "SEND_LOLLIPOP_LAMBDA_CANCEL"
    };

    expect(sendLollipopLambdaAction.cancel()).toEqual(expectedAction);
  });
});
