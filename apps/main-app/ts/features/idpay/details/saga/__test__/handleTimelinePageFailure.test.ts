import { InitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";

import { NetworkError } from "../../../../../utils/errors";
import { trackIDPayDetailTimelineError } from "../../analytics";
import { idpayInitiativeDetailsSelector } from "../../store";
import { idpayInitiativeGet, idpayTimelinePageGet } from "../../store/actions";
import { handleTimelinePageFailure } from "../handleTimelinePageFailure";

const initiativeId = "abcdef";
const error: NetworkError = { kind: "timeout" };
const failureAction = idpayTimelinePageGet.failure({ initiativeId, error });

const loadedInitiative = pot.some({
  initiativeId,
  initiativeName: "Test initiative"
} as InitiativeDTO);
const detailsError = pot.noneError<NetworkError>({ kind: "timeout" });

const expectTracking = (
  saga: ReturnType<ReturnType<typeof testSaga>["next"]>,
  expectedName: string | undefined
) =>
  saga
    .call(trackIDPayDetailTimelineError, {
      initiative_id: initiativeId,
      initiative_name: expectedName,
      error
    })
    .next()
    .isDone();

describe("handleTimelinePageFailure", () => {
  describe("when the initiative details are already concluded", () => {
    it.each([
      {
        name: "the failed initiative is loaded",
        detailsPot: loadedInitiative,
        expectedName: "Test initiative"
      },
      {
        name: "another initiative is loaded",
        detailsPot: pot.some({
          initiativeId: "other",
          initiativeName: "Other initiative"
        } as InitiativeDTO),
        expectedName: undefined
      },
      {
        name: "the details request failed",
        detailsPot: detailsError,
        expectedName: undefined
      }
    ])(
      "should track immediately when $name",
      ({ detailsPot, expectedName }) => {
        expectTracking(
          testSaga(handleTimelinePageFailure, failureAction)
            .next()
            .select(idpayInitiativeDetailsSelector)
            .next(detailsPot)
            .select(idpayInitiativeDetailsSelector)
            .next(detailsPot),
          expectedName
        );
      }
    );
  });

  describe("when the initiative details are still loading", () => {
    it.each([
      {
        name: "succeeds",
        concludedPot: loadedInitiative,
        expectedName: "Test initiative"
      },
      {
        name: "fails",
        concludedPot: detailsError,
        expectedName: undefined
      }
    ])(
      "should wait and track once the details request $name",
      ({ concludedPot, expectedName }) => {
        expectTracking(
          testSaga(handleTimelinePageFailure, failureAction)
            .next()
            .select(idpayInitiativeDetailsSelector)
            .next(pot.noneLoading)
            .take([idpayInitiativeGet.success, idpayInitiativeGet.failure])
            .next()
            .select(idpayInitiativeDetailsSelector)
            .next(concludedPot),
          expectedName
        );
      }
    );
  });
});
