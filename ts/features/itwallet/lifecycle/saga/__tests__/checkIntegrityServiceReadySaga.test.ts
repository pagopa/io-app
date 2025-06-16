import { type DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { GlobalState } from "../../../../../store/reducers/types";
import { ensureIntegrityServiceIsReady } from "../../../common/utils/itwIntegrityUtils";
import { itwSetIntegrityServiceStatus } from "../../../issuance/store/actions";
import { itwIntegrityServiceStatusSelector } from "../../../issuance/store/selectors";
import {
  checkIntegrityServiceReadySaga,
  warmUpIntegrityServiceSaga
} from "../checkIntegrityServiceReadySaga";

describe("checkIntegrityServiceReadySaga", () => {
  it("Should wait for the integrity service status to be set", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: {
            integrityServiceStatus: undefined
          }
        }
      }
    };
    return expectSaga(checkIntegrityServiceReadySaga)
      .withState(store)
      .select(itwIntegrityServiceStatusSelector)
      .take(itwSetIntegrityServiceStatus)
      .not.call.fn(warmUpIntegrityServiceSaga)
      .not.returns(expect.anything())
      .run();
  });

  it("Should return true when the integrity service status is ready", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: {
            integrityServiceStatus: "ready"
          }
        }
      }
    };
    return expectSaga(checkIntegrityServiceReadySaga)
      .withState(store)
      .select(itwIntegrityServiceStatusSelector)
      .not.take(itwSetIntegrityServiceStatus)
      .not.call.fn(warmUpIntegrityServiceSaga)
      .returns(true)
      .run();
  });

  it("Should return false when the integrity service status is unavailable", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: {
            integrityServiceStatus: "unavailable"
          }
        }
      }
    };
    return expectSaga(checkIntegrityServiceReadySaga)
      .withState(store)
      .select(itwIntegrityServiceStatusSelector)
      .not.take(itwSetIntegrityServiceStatus)
      .not.call.fn(warmUpIntegrityServiceSaga)
      .returns(false)
      .run();
  });

  it("Should retry the integrity service warm up when the integrity service status is error", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: {
            integrityServiceStatus: "error"
          },
          environment: {
            env: "prod"
          }
        }
      }
    };
    return expectSaga(checkIntegrityServiceReadySaga)
      .withState(store)
      .select(itwIntegrityServiceStatusSelector)
      .call.fn(warmUpIntegrityServiceSaga)
      .take(itwSetIntegrityServiceStatus)
      .not.returns(expect.anything())
      .run();
  });
});

describe("warmUpIntegrityServiceSaga", () => {
  it("Sets the integrity service status to ready when the integrity service is ready", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          environment: {
            env: "prod"
          }
        }
      }
    };
    return expectSaga(warmUpIntegrityServiceSaga)
      .withState(store)
      .provide([[matchers.call.fn(ensureIntegrityServiceIsReady), true]])
      .call.fn(ensureIntegrityServiceIsReady)
      .put(itwSetIntegrityServiceStatus("ready"))
      .run();
  });

  it("Sets the integrity service status to unavailable when the integrity service is unavailable", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          environment: {
            env: "prod"
          }
        }
      }
    };
    return expectSaga(warmUpIntegrityServiceSaga)
      .withState(store)
      .provide([[matchers.call.fn(ensureIntegrityServiceIsReady), false]])
      .call.fn(ensureIntegrityServiceIsReady)
      .put(itwSetIntegrityServiceStatus("unavailable"))
      .run();
  });

  it("Sets the integrity service status to error when the integrity service is unavailable", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          environment: {
            env: "prod"
          }
        }
      }
    };
    return expectSaga(warmUpIntegrityServiceSaga)
      .withState(store)
      .provide([
        [
          matchers.call.fn(ensureIntegrityServiceIsReady),
          throwError(new Error("Integrity service error"))
        ]
      ])
      .call.fn(ensureIntegrityServiceIsReady)
      .put(itwSetIntegrityServiceStatus("error"))
      .run();
  });
});
