import { testSaga } from "redux-saga-test-plan";

import { StatusEnum } from "../../../../../../../../definitions/cgn/CgnActivationDetail";
import { InstanceId } from "../../../../../../../../definitions/cgn/InstanceId";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
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
    const response = { _tag: "Right", right: { status: 201 } };
    expect(() => {
      testSaga(saga)
        .next()
        .call(startCgnActivation, {})
        .next(response)
        .call(handleCgnStatusPolling)
        .next("POLLING_RESULT")
        .returns("POLLING_RESULT")
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should handle activation saga with 202 status", () => {
    const response = { _tag: "Right", right: { status: 202 } };
    expect(() => {
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
    }).not.toThrow();
  });

  [403, 409].forEach(status => {
    it(`should handle activation saga with ${status} status`, () => {
      const response = { _tag: "Right", right: { status } };
      expect(() => {
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
      }).not.toThrow();
    });
  });

  it("returns failure on unexpected activation status", () => {
    const response = { _tag: "Right", right: { status: 500 } };

    expect(() => {
      testSaga(saga)
        .next()
        .call(startCgnActivation, {})
        .next(response)
        .returns(cgnActivationStatus.failure(new Error("response status 500")))
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("returns failure on decoder error", () => {
    const response = { _tag: "Left", left: [] };

    expect(() => {
      testSaga(saga)
        .next()
        .call(startCgnActivation, {})
        .next(response)
        .returns(
          cgnActivationStatus.failure(
            new Error(readablePrivacyReport(response.left))
          )
        )
        .next()
        .isDone();
    }).not.toThrow();
  });
});

describe("handleCgnStatusPolling", () => {
  it("returns success when status is COMPLETED", () => {
    const getCgnActivation = jest.fn();
    const saga = handleCgnStatusPolling(getCgnActivation);

    const response = {
      _tag: "Right",
      right: {
        status: 200,
        value: {
          status: StatusEnum.COMPLETED,
          instance_id: { id: "" } as InstanceId
        }
      }
    };

    expect(() => {
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
    }).not.toThrow();
  });

  it("continues polling when status is PENDING", () => {
    const getCgnActivation = jest.fn();
    const saga = handleCgnStatusPolling(getCgnActivation);

    const response = {
      _tag: "Right",
      right: {
        status: 200,
        value: {
          status: StatusEnum.PENDING,
          instance_id: { id: "" } as InstanceId
        }
      }
    };

    expect(() => {
      testSaga(saga)
        .next()
        .call(getCgnActivation, {})
        .next(response)
        .call(startTimer, 1000)
        .next();
    }).not.toThrow();
  });

  it("throws on left result", () => {
    const getCgnActivation = jest.fn();
    const saga = handleCgnStatusPolling(getCgnActivation);
    const error = new Error("network");

    expect(() => {
      testSaga(saga)
        .next()
        .call(getCgnActivation, {})
        .next({ _tag: "Left", left: error });
    }).toThrow(error);
  });

  it("returns timeout after polling threshold", () => {
    const getCgnActivation = jest.fn();
    const saga = handleCgnStatusPolling(getCgnActivation);
    const nowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(10001);

    expect(() => {
      testSaga(saga)
        .next()
        .call(getCgnActivation, {})
        .next({
          _tag: "Right",
          right: {
            status: 200,
            value: {
              status: StatusEnum.PENDING,
              instance_id: { id: "" } as InstanceId
            }
          }
        })
        .call(startTimer, 1000)
        .next()
        .returns(
          cgnActivationStatus.success({
            status: CgnActivationProgressEnum.TIMEOUT
          })
        )
        .next()
        .isDone();
    }).not.toThrow();

    nowSpy.mockRestore();
  });
});
