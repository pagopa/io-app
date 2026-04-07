import * as matchers from "redux-saga-test-plan/matchers";
import { expectSaga } from "redux-saga-test-plan";
import { select } from "typed-redux-saga";
import { DeepPartial } from "redux";
import * as O from "fp-ts/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  itwCredentialsStore,
  itwCredentialsRemove
} from "../../../credentials/store/actions";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import {
  updateCredentialProperties,
  updateItwStatusAndPIDProperties
} from "../../properties/propertyUpdaters";
import {
  handleCredentialStoredAnalytics,
  handleCredentialRemovedAnalytics
} from "../credentialAnalyticsHandlers";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

jest.mock("../../properties/propertyUpdaters", () => ({
  updateCredentialProperties: jest.fn(),
  updateItwStatusAndPIDProperties: jest.fn()
}));

const expirationClaim = { value: "2100-09-04", name: "exp" };
const jwtExpiration = "2100-09-04T00:00:00.000Z";
const mockedEid: StoredCredential = {
  credential: "",
  credentialType: CredentialType.PID,
  credentialId: "dc_sd_jwt_PersonIdentificationData",
  parsedCredential: {
    expiry_date: expirationClaim
  },
  format: "dc+sd-jwt",
  keyTag: "1",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: jwtExpiration
  },
  spec_version: "1.0.0"
};
const mockedMdl: StoredCredential = {
  credential: "",
  credentialType: CredentialType.DRIVING_LICENSE,
  credentialId: "dc_sd_jwt_mDL",
  parsedCredential: {
    expiry_date: expirationClaim
  },
  format: "dc+sd-jwt",
  keyTag: "2",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: jwtExpiration
  },
  spec_version: "1.0.0"
};

const store: DeepPartial<GlobalState> = {
  features: {
    itWallet: {
      issuance: { integrityKeyTag: O.some("key-tag") },
      credentials: {
        credentials: {}
      },
      preferences: {
        isFiscalCodeWhitelisted: true
      }
    }
  }
};

describe("credentialAnalyticsHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tracks credential added for non-eID credentials", async () => {
    await expectSaga(
      handleCredentialStoredAnalytics,
      itwCredentialsStore([mockedMdl])
    )
      .withState(store)
      .provide([
        [select(itwLifecycleIsITWalletValidSelector), true],
        [matchers.select(), store]
      ])
      .run();

    expect(updateCredentialProperties).toHaveBeenCalledTimes(1);
    expect(updateItwStatusAndPIDProperties).not.toHaveBeenCalled();
  });

  it("updates ITW status when PID is stored", async () => {
    await expectSaga(
      handleCredentialStoredAnalytics,
      itwCredentialsStore([mockedEid])
    )
      .withState(store)
      .provide([[select(itwLifecycleIsITWalletValidSelector), true]])
      .run();

    expect(updateItwStatusAndPIDProperties).toHaveBeenCalledTimes(1);
    expect(updateCredentialProperties).not.toHaveBeenCalled();
  });

  it("tracks credential deletion for non-eID credentials", async () => {
    await expectSaga(
      handleCredentialRemovedAnalytics,
      itwCredentialsRemove([mockedMdl])
    )
      .withState(store)
      .provide([[select(itwLifecycleIsITWalletValidSelector), true]])
      .run();

    expect(updateCredentialProperties).toHaveBeenCalledTimes(1);
  });

  it("does NOT delete eIDs analytics properties when eID is removed", async () => {
    await expectSaga(
      handleCredentialRemovedAnalytics,
      itwCredentialsRemove([mockedEid])
    )
      .withState(store)
      .provide([[select(itwLifecycleIsITWalletValidSelector), true]])
      .run();

    expect(updateCredentialProperties).not.toHaveBeenCalled();
  });
});
