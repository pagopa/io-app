import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { itwCredentialsBatchRefillRequest } from "../../store/actions";
import { checkCredentialsBatchRefill } from "../checkCredentialsBatchRefill";

const proofOfAge = {
  credentialType: CredentialType.PROOF_OF_AGE,
  credentialId: "dc_sd_jwt_proof_of_age",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "kt-1",
  keyTags: ["kt-1", "kt-2"],
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-01-01T00:00:00.000Z",
    expiration: "2100-01-01T00:00:00.000Z"
  },
  spec_version: "1.3.3"
} as CredentialMetadata;

const makeState = (
  credentials: ReadonlyArray<CredentialMetadata>
): GlobalState => {
  const state = appReducer(undefined, applicationChangeState("active"));
  return {
    ...state,
    features: {
      ...state.features,
      itWallet: {
        ...state.features.itWallet,
        credentials: {
          ...state.features.itWallet.credentials,
          credentials: credentials.reduce(
            (acc, c) => ({ ...acc, [c.credentialId]: c }),
            {}
          )
        }
      }
    }
  };
};

describe("checkCredentialsBatchRefill", () => {
  it("requests a renewal for every credential under threshold", () =>
    expectSaga(checkCredentialsBatchRefill)
      .withState(makeState([proofOfAge]))
      .provide([[matchers.select(itwLifecycleIsValidSelector), true]])
      .put(
        itwCredentialsBatchRefillRequest({
          credentialType: CredentialType.PROOF_OF_AGE,
          trigger: "app-start"
        })
      )
      .run());

  it("does nothing when the wallet is not valid", () =>
    expectSaga(checkCredentialsBatchRefill)
      .withState(makeState([proofOfAge]))
      .provide([[matchers.select(itwLifecycleIsValidSelector), false]])
      .not.put.actionType(itwCredentialsBatchRefillRequest.toString())
      .run());

  it("does nothing when no credential is under threshold", () =>
    expectSaga(checkCredentialsBatchRefill)
      .withState(
        makeState([{ ...proofOfAge, keyTags: ["kt-1", "kt-2", "kt-3"] }])
      )
      .provide([[matchers.select(itwLifecycleIsValidSelector), true]])
      .not.put.actionType(itwCredentialsBatchRefillRequest.toString())
      .run());
});
