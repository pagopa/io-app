import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { getMessagePrecondition } from "../../../store/actions/messages";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { testWorkerMessagePrecondition } from "../watchMessagePrecondition";
import { ThirdPartyMessagePrecondition } from "../../../../definitions/backend/ThirdPartyMessagePrecondition";

const workerMessagePrecondition = testWorkerMessagePrecondition!;

const id = "MSG001" as UIMessageId;

const mockLollipopHeaders: Record<string, string> = {
  "x-pagopa-lollipop-original-method": "GET",
  "x-pagopa-lollipop-original-url": "",
  "signature-input": "",
  signature: ""
};

const mockResponseSuccess: ThirdPartyMessagePrecondition = {
  title: "-",
  markdown: "-"
};

describe("workerMessagePrecondition", () => {
  it(`should put ${getType(
    getMessagePrecondition.success
  )} when the response is successful`, () => {
    const getThirdPartyMessagePrecondition = jest.fn();

    testSaga(
      workerMessagePrecondition,
      getThirdPartyMessagePrecondition,
      getMessagePrecondition.request(id)
    )
      .next()
      .call(getThirdPartyMessagePrecondition, { id, ...mockLollipopHeaders })
      .next(E.right({ status: 200, value: mockResponseSuccess }))
      .put(getMessagePrecondition.success(mockResponseSuccess))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getMessagePrecondition.failure
  )} when the response is an error`, () => {
    const getThirdPartyMessagePrecondition = jest.fn();

    testSaga(
      workerMessagePrecondition,
      getThirdPartyMessagePrecondition,
      getMessagePrecondition.request(id)
    )
      .next()
      .call(getThirdPartyMessagePrecondition, { id, ...mockLollipopHeaders })
      .next(E.right({ status: 500, value: `response status ${500}` }))
      .put(getMessagePrecondition.failure(new Error(`response status ${500}`)))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getMessagePrecondition.failure
  )} when the handler throws an exception`, () => {
    const getThirdPartyMessagePrecondition = jest.fn();

    testSaga(
      workerMessagePrecondition,
      getThirdPartyMessagePrecondition,
      getMessagePrecondition.request(id)
    )
      .next()
      .call(getThirdPartyMessagePrecondition, { id, ...mockLollipopHeaders })
      .next(E.left([]))
      .put(getMessagePrecondition.failure(new Error()))
      .next()
      .isDone();
  });
});
