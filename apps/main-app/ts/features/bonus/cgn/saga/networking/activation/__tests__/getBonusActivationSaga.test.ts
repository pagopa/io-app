import * as E from "fp-ts/Either";
import { testSaga } from "redux-saga-test-plan";

import { StatusEnum } from "../../../../../../../../definitions/cgn/CgnActivationDetail";
import { InstanceId } from "../../../../../../../../definitions/cgn/InstanceId";
import { startTimer } from "../../../../../../../utils/timer";
import { cgnActivationStatus } from "../../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../../store/reducers/activation";
import {
  cgnActivationSaga,
  handleCgnStatusPolling
} from "../getBonusActivationSaga";

describe("cgnActivationSaga", () => {
  const startCgnActivation = jest.fn();
  const handleCgnStatusPolling = jest.fn();
  const saga = cgnActivationSaga(startCgnActivation, handleCgnStatusPolling);
  it("should handle activation saga with 201 status", () => {
    const response = E.right({ status: 201 });
    testSaga(saga)
      .next()
      .call(startCgnActivation, {})
      .next(response)
      .call(handleCgnStatusPolling)
      .next("POLLING_RESULT")
      .returns("POLLING_RESULT")
      .next()
      .isDone();
  });

  it("should handle activation saga with 202 status", () => {
    const response = E.right({ status: 202 });
    testSaga(saga)
      .next()
      .call(startCgnActivation, {})
      .next(response)
      .returns(
        cgnActivationStatus.success({
          status: CgnActivationProgressEnum.PENDING
        })
      )
      .next()
      .isDone();
  });

  [403, 409].forEach(status => {
    it(`should handle activation saga with ${status} status`, () => {
      const response = E.right({ status });
      testSaga(saga)
        .next()
        .call(startCgnActivation, {})
        .next(response)
        .returns(
          cgnActivationStatus.success({
            status:
              status === 403
                ? CgnActivationProgressEnum.INELIGIBLE
                : CgnActivationProgressEnum.EXISTS
          })
        )
        .next()
        .isDone();
    });
  });
});

describe("handleCgnStatusPolling", () => {
  it("returns success when status is COMPLETED", () => {
    const getCgnActivation = jest.fn();
    const saga = handleCgnStatusPolling(getCgnActivation);

    const response = E.right({
      status: 200,
      value: {
        status: StatusEnum.COMPLETED,
        instance_id: { id: "" } as InstanceId
      }
    });

    testSaga(saga)
      .next()
      .call(getCgnActivation, {})
      .next(response)
      .returns(
        cgnActivationStatus.success({
          status: CgnActivationProgressEnum.SUCCESS,
          activation: {
            status: StatusEnum.COMPLETED,
            instance_id: { id: "" } as InstanceId
          }
        })
      )
      .next()
      .isDone();
  });

  it("continues polling when status is PENDING", () => {
    const getCgnActivation = jest.fn();
    const saga = handleCgnStatusPolling(getCgnActivation);

    const response = E.right({
      status: 200,
      value: {
        status: StatusEnum.PENDING,
        instance_id: { id: "" } as InstanceId
      }
    });

    testSaga(saga)
      .next()
      .call(getCgnActivation, {})
      .next(response)
      .call(startTimer, 1000)
      .next();
  });
});
