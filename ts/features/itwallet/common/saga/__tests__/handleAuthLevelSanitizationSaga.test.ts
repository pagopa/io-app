import { testSaga } from "redux-saga-test-plan";
import * as O from "fp-ts/lib/Option";
import { handleAuthLevelSanitizationSaga } from "../index";
import {
  itwClearSimplifiedActivationRequirements,
  itwFreezeSimplifiedActivationRequirements,
  itwSetAuthLevel,
  itwSetFiscalCodeWhitelisted
} from "../../store/actions/preferences";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { CredentialType } from "../../utils/itwMocksUtils";

const baseEid: StoredCredential = {
  credential: "",
  credentialType: CredentialType.PID,
  credentialId: "dc_sd_jwt_PersonIdentificationData",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "mock-key-tag",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: { expiration: "2025-09-30T07:32:50.000Z" },
  spec_version: "1.0.0"
};

const l3Eid: StoredCredential = {
  ...baseEid,
  verification: { assurance_level: "high" }
};

const nonL3Eid: StoredCredential = {
  ...baseEid,
  verification: undefined
};

describe("handleAuthLevelSanitizationSaga", () => {
  describe("when user is confirmed whitelisted (action.payload = true)", () => {
    it("should dispatch itwClearSimplifiedActivationRequirements when user has an L3 PID", () => {
      testSaga(
        handleAuthLevelSanitizationSaga,
        itwSetFiscalCodeWhitelisted(true)
      )
        .next()
        .select(itwCredentialsEidSelector)
        .next(O.some(l3Eid))
        .put(itwClearSimplifiedActivationRequirements())
        .next()
        .isDone();
    });

    it("should not dispatch anything when user has no L3 PID", () => {
      testSaga(
        handleAuthLevelSanitizationSaga,
        itwSetFiscalCodeWhitelisted(true)
      )
        .next()
        .select(itwCredentialsEidSelector)
        .next(O.some(nonL3Eid))
        .isDone();
    });

    it("should not dispatch anything when user has no EID", () => {
      testSaga(
        handleAuthLevelSanitizationSaga,
        itwSetFiscalCodeWhitelisted(true)
      )
        .next()
        .select(itwCredentialsEidSelector)
        .next(O.none)
        .isDone();
    });
  });

  describe("when user is not whitelisted (action.payload = false)", () => {
    it("should dispatch itwSetAuthLevel and itwFreezeSimplifiedActivationRequirements when user has an L3 PID", () => {
      testSaga(
        handleAuthLevelSanitizationSaga,
        itwSetFiscalCodeWhitelisted(false)
      )
        .next()
        .select(itwCredentialsEidSelector)
        .next(O.some(l3Eid))
        .put(itwSetAuthLevel("L3"))
        .next()
        .put(itwFreezeSimplifiedActivationRequirements())
        .next()
        .isDone();
    });

    it("should not dispatch anything when user has no L3 PID", () => {
      testSaga(
        handleAuthLevelSanitizationSaga,
        itwSetFiscalCodeWhitelisted(false)
      )
        .next()
        .select(itwCredentialsEidSelector)
        .next(O.none)
        .isDone();
    });
  });
});
