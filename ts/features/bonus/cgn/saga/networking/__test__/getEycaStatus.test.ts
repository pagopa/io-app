import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

import { ValidationError } from "io-ts";
import { expectSaga } from "redux-saga-test-plan";
import { StatusEnum } from "../../../../../../../definitions/cgn/CardActivated";
import { StatusEnum as ExpiredStatus } from "../../../../../../../definitions/cgn/CardExpired";
import { StatusEnum as PendingStatus } from "../../../../../../../definitions/cgn/CardPending";
import { StatusEnum as RevokedStatus } from "../../../../../../../definitions/cgn/CardRevoked";
import { CcdbNumber } from "../../../../../../../definitions/cgn/CcdbNumber";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import {
  remoteError,
  remoteReady
} from "../../../../../../common/model/RemoteValue";
import { cgnEycaStatus } from "../../../store/actions/eyca/details";
import { handleGetEycaStatus } from "../eyca/details/getEycaStatus";

const card_number = "W413-K096-O814-Z223" as CcdbNumber;
const activation_date = new Date("2021-03-16T11:41:34.394Z");
const expiration_date = new Date("2050-05-10T00:00:00.000Z");
const eycaCards: ReadonlyArray<EycaCard> = [
  {
    status: StatusEnum.ACTIVATED,
    card_number,
    activation_date,
    expiration_date
  },
  {
    status: PendingStatus.PENDING
  },
  {
    status: ExpiredStatus.EXPIRED,
    card_number,
    activation_date,
    expiration_date
  },
  {
    status: RevokedStatus.REVOKED,
    revocation_date: new Date("2021-03-16T11:41:34.394Z"),
    revocation_reason: "a reason" as NonEmptyString,
    card_number,
    activation_date,
    expiration_date
  }
];

describe("handleGetEycaStatus", () => {
  eycaCards.forEach(eycaCard => {
    const getEycaStatus = jest.fn();
    getEycaStatus.mockImplementation(() =>
      E.right({ status: 200, value: eycaCard })
    );
    it("With 200 should be FOUND and have an eyca card", () =>
      expectSaga(handleGetEycaStatus, getEycaStatus, cgnEycaStatus.request())
        .withReducer(appReducer)
        .put(cgnEycaStatus.success({ status: "FOUND", card: eycaCard }))
        .run()
        .then(rr => {
          const globalState = rr.storeState as GlobalState;
          expect(globalState.bonus.cgn.eyca.details).not.toBeNull();
          expect(globalState.bonus.cgn.eyca.details).toEqual(
            remoteReady({ status: "FOUND", card: eycaCard })
          );
        }));
  });

  it("With 404 should be NOT_FOUND", () => {
    const getEycaStatus = jest.fn();
    getEycaStatus.mockImplementation(() => E.right({ status: 404 }));
    return expectSaga(
      handleGetEycaStatus,
      getEycaStatus,
      cgnEycaStatus.request()
    )
      .withReducer(appReducer)
      .put(cgnEycaStatus.success({ status: "NOT_FOUND" }))
      .run()
      .then(rr => {
        const globalState = rr.storeState as GlobalState;
        expect(globalState.bonus.cgn.eyca.details).not.toBeNull();
        expect(globalState.bonus.cgn.eyca.details).toEqual(
          remoteReady({ status: "NOT_FOUND" })
        );
      });
  });

  it("With 403 should be INELIGIBLE", () => {
    const getEycaStatus = jest.fn();
    getEycaStatus.mockImplementation(() => E.right({ status: 403 }));
    return expectSaga(
      handleGetEycaStatus,
      getEycaStatus,
      cgnEycaStatus.request()
    )
      .withReducer(appReducer)
      .put(cgnEycaStatus.success({ status: "INELIGIBLE" }))
      .run()
      .then(rr => {
        const globalState = rr.storeState as GlobalState;
        expect(globalState.bonus.cgn.eyca.details).not.toBeNull();
        expect(globalState.bonus.cgn.eyca.details).toEqual(
          remoteReady({ status: "INELIGIBLE" })
        );
      });
  });

  it(`With 409 status should be ERROR`, () => {
    const getEycaStatus = jest.fn();
    getEycaStatus.mockImplementation(() => E.right({ status: 409 }));
    return expectSaga(
      handleGetEycaStatus,
      getEycaStatus,
      cgnEycaStatus.request()
    )
      .withReducer(appReducer)
      .put(cgnEycaStatus.success({ status: "ERROR" }))
      .run()
      .then(rr => {
        const globalState = rr.storeState as GlobalState;
        expect(globalState.bonus.cgn.eyca.details).not.toBeNull();
        expect(globalState.bonus.cgn.eyca.details).toEqual(
          remoteReady({ status: "ERROR" })
        );
      });
  });

  [500, 401].forEach(status => {
    it(`With ${status} status should dispatch a failure`, () => {
      const error = getGenericError(new Error(`response status ${status}`));
      const getEycaStatus = jest.fn();
      getEycaStatus.mockImplementation(() => E.right({ status }));
      return expectSaga(
        handleGetEycaStatus,
        getEycaStatus,
        cgnEycaStatus.request()
      )
        .withReducer(appReducer)
        .put(cgnEycaStatus.failure(error))
        .run()
        .then(rr => {
          const globalState = rr.storeState as GlobalState;
          expect(globalState.bonus.cgn.eyca.details).not.toBeNull();
          expect(globalState.bonus.cgn.eyca.details).toEqual(
            remoteError(error)
          );
        });
    });
  });

  it(`With response error should dispatch a failure`, () => {
    const getEycaStatus = jest.fn();
    const error = t.number.decode("abc");
    if (E.isLeft(error)) {
      const genericError = getGenericError(
        new Error(
          readablePrivacyReport(error.left as ReadonlyArray<ValidationError>)
        )
      );
      getEycaStatus.mockImplementation(() => error);
      return expectSaga(
        handleGetEycaStatus,
        getEycaStatus,
        cgnEycaStatus.request()
      )
        .withReducer(appReducer)
        .put(cgnEycaStatus.failure(genericError))
        .run()
        .then(rr => {
          const globalState = rr.storeState as GlobalState;
          expect(globalState.bonus.cgn.eyca.details).not.toBeNull();
          expect(globalState.bonus.cgn.eyca.details).toEqual(
            remoteError(genericError)
          );
        });
    }
    fail("decode should fail");
  });
});
