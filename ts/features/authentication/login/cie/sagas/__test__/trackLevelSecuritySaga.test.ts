import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import * as O from "fp-ts/Option";
import { shouldTrackLevelSecurityMismatchSaga } from "../trackLevelSecuritySaga";
import { cieIDSelectedSecurityLevelSelector } from "../../store/selectors";
import { idpSelector } from "../../../../common/store/selectors";
import { IdpCIE_ID } from "../../../hooks/useNavigateToLoginMethod";
import { trackCieIdSecurityLevelMismatch } from "../../analytics";
import { PublicSession } from "../../../../../../../definitions/session_manager/PublicSession";
import { SpidLevelEnum } from "../../../../../../../definitions/session_manager/SpidLevel";

jest.mock("../../analytics", () => ({
  trackCieIdSecurityLevelMismatch: jest.fn()
}));

const mockTrack = trackCieIdSecurityLevelMismatch as jest.Mock;

describe("shouldTrackLevelSecurityMismatchSaga", () => {
  const mockSession: PublicSession = {
    spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL2"]
  };

  const cieid = {
    id: IdpCIE_ID.id,
    name: "CIE",
    logo: "",
    profileUrl: ""
  };

  const nonCieIdp = {
    id: "spid",
    name: "SPID",
    logo: "",
    profileUrl: ""
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track mismatch if spidLevel does not include selectedSecurityLevel and idp is cieid", () =>
    expectSaga(shouldTrackLevelSecurityMismatchSaga, O.some(mockSession))
      .provide([
        [select(cieIDSelectedSecurityLevelSelector), "SpidL3"],
        [select(idpSelector), O.some(cieid)]
      ])
      .run()
      .then(() => {
        expect(mockTrack).toHaveBeenCalled();
      }));

  it("should NOT track if spidLevel includes selectedSecurityLevel", () =>
    expectSaga(shouldTrackLevelSecurityMismatchSaga, O.some(mockSession))
      .provide([
        [select(cieIDSelectedSecurityLevelSelector), "SpidL2"],
        [select(idpSelector), O.some(cieid)]
      ])
      .run()
      .then(() => {
        expect(mockTrack).not.toHaveBeenCalled();
      }));

  it("should NOT track if idp is not cieid", () =>
    expectSaga(shouldTrackLevelSecurityMismatchSaga, O.some(mockSession))
      .provide([
        [select(cieIDSelectedSecurityLevelSelector), "SpidL3"],
        [select(idpSelector), O.some(nonCieIdp)]
      ])
      .run()
      .then(() => {
        expect(mockTrack).not.toHaveBeenCalled();
      }));

  it("should NOT track if selectedSecurityLevel is undefined", () =>
    expectSaga(shouldTrackLevelSecurityMismatchSaga, O.some(mockSession))
      .provide([
        [select(cieIDSelectedSecurityLevelSelector), undefined],
        [select(idpSelector), O.some(cieid)]
      ])
      .run()
      .then(() => {
        expect(mockTrack).not.toHaveBeenCalled();
      }));

  it("should NOT track if session is none", () =>
    expectSaga(shouldTrackLevelSecurityMismatchSaga, O.none)
      .provide([
        [select(cieIDSelectedSecurityLevelSelector), "SpidL3"],
        [select(idpSelector), O.some(cieid)]
      ])
      .run()
      .then(() => {
        expect(mockTrack).not.toHaveBeenCalled();
      }));

  it("should NOT track if idp is none", () =>
    expectSaga(shouldTrackLevelSecurityMismatchSaga, O.some(mockSession))
      .provide([
        [select(cieIDSelectedSecurityLevelSelector), "SpidL3"],
        [select(idpSelector), O.none]
      ])
      .run()
      .then(() => {
        expect(mockTrack).not.toHaveBeenCalled();
      }));
});
