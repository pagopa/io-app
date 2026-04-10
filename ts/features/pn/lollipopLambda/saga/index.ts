import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import {
  call,
  put,
  race,
  select,
  take,
  takeLatest
} from "typed-redux-saga/macro";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { ActionType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../config";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import {
  createSendLollipopLambdaClient,
  SendLollipopLambdaClient
} from "../api";
import { sendLollipopLambdaAction } from "../store/actions";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";
import { unknownToReason } from "../../../messages/utils";
import { isTestEnv } from "../../../../utils/environment";

export function* watchSendLollipopLambda(
  sessionToken: string,
  keyInfo: KeyInfo
) {
  const lollipopLambdaClient = yield* call(
    createSendLollipopLambdaClient,
    apiUrlPrefix,
    sessionToken,
    keyInfo
  );
  yield* takeLatest(
    sendLollipopLambdaAction.request,
    raceLollipopLambdaWithCancellation,
    lollipopLambdaClient
  );
}

function* raceLollipopLambdaWithCancellation(
  client: SendLollipopLambdaClient,
  action: ActionType<typeof sendLollipopLambdaAction.request>
) {
  yield* race({
    task: call(lollipopLambdaSaga, client, action),
    cancel: take(sendLollipopLambdaAction.cancel)
  });
}

function* lollipopLambdaSaga(
  client: SendLollipopLambdaClient,
  action: ActionType<typeof sendLollipopLambdaAction.request>
) {
  const httpVerb = action.payload.httpVerb;
  const requestBody = action.payload.body;

  const useSendUATEnvironment = yield* select(isPnTestEnabledSelector);

  try {
    const lambaLollipopRequestEither = buildLambdaLollipopRequest(
      httpVerb,
      client,
      useSendUATEnvironment,
      requestBody
    );
    if (isLeft(lambaLollipopRequestEither)) {
      yield* put(
        sendLollipopLambdaAction.failure({
          reason: lambaLollipopRequestEither.left,
          type: "invalidInput"
        })
      );
      return;
    }

    const lambdaLollipopRequest = lambaLollipopRequestEither.right;
    const responseEither = (yield* call(
      withRefreshApiCall,
      lambdaLollipopRequest,
      action
    )) as unknown as SagaCallReturnType<
      typeof client.testLollipopGet | typeof client.testLollipopPost
    >;
    if (isLeft(responseEither)) {
      throw new Error(
        `Decoding failure (${readableReportSimplified(responseEither.left)})`
      );
    }

    const response = responseEither.right;
    yield* put(
      sendLollipopLambdaAction.success({
        statusCode: response.status,
        responseBody: response.value
      })
    );
  } catch (e) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    yield* put(
      sendLollipopLambdaAction.failure({
        reason,
        type: "failure"
      })
    );
  }
}

const buildLambdaLollipopRequest = (
  httpVerb: "Get" | "Post",
  client: SendLollipopLambdaClient,
  useSendUATEnvironment: boolean,
  requestBody: string | undefined
): Either<
  string,
  ReturnType<typeof client.testLollipopPost | typeof client.testLollipopPost>
> => {
  if (httpVerb === "Post") {
    const bodyStringEither = bodyStringToObject(requestBody);
    if (isLeft(bodyStringEither)) {
      return bodyStringEither;
    }
    return right(
      client.testLollipopPost({
        isTest: useSendUATEnvironment,
        body: bodyStringEither.right
      })
    );
  }
  return right(
    client.testLollipopGet({
      isTest: useSendUATEnvironment
    })
  );
};

const bodyStringToObject = (
  input: string | undefined
): Either<string, object> => {
  const trimmedInput = input?.trim();
  if (!trimmedInput) {
    return right({});
  }

  try {
    const parsedObject = JSON.parse(trimmedInput);
    return right(parsedObject);
  } catch (e: unknown) {
    const reason = unknownToReason(e);
    return left(`Bad JSON for request body (${reason})`);
  }
};

export const testable = isTestEnv
  ? {
      bodyStringToObject,
      buildLambdaLollipopRequest,
      lollipopLambdaSaga,
      raceLollipopLambdaWithCancellation
    }
  : undefined;
