import { applicationChangeState } from "../../../../../../store/actions/application";
import { Action } from "../../../../../../store/actions/types";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../../utils/tests";
import { itwCredentialsStore } from "../../../../credentials/store/actions";
import { itwStoreIntegrityKeyTag } from "../../../../issuance/store/actions";
import { CURRENT_ITW_SPECS_VERSION } from "../../../utils/constants";
import { CredentialType } from "../../../utils/itwMocksUtils";
import {
  CredentialFormat,
  CredentialMetadata
} from "../../../utils/itwTypesUtils";
import { itwSetFiscalCodeWhitelisted } from "../../actions/preferences";
import {
  selectItwCieIdEnvironment,
  selectItwEnv,
  selectItwSpecsVersion
} from "../environment";

describe("selectItwEnv", () => {
  it("should return the correct environment", () => {
    const state = {
      features: {
        itWallet: {
          environment: {
            env: "pre"
          }
        }
      }
    } as GlobalState;

    expect(selectItwEnv(state)).toEqual("pre");
  });

  it("should return the default environment if not set", () => {
    const state = {
      features: {
        itWallet: {
          environment: {
            env: undefined
          }
        }
      }
    } as GlobalState;

    expect(selectItwEnv(state)).toEqual("prod");
  });
});

describe("selectItwCieIdEnvironment", () => {
  const stateWithEnv = (env: string | undefined) =>
    ({
      features: {
        itWallet: {
          environment: {
            env
          }
        }
      }
    }) as GlobalState;

  it("should target the coll CieID app in the pre environment", () => {
    expect(selectItwCieIdEnvironment(stateWithEnv("pre"))).toEqual("coll");
  });

  it("should target the production CieID app in the prod environment", () => {
    expect(selectItwCieIdEnvironment(stateWithEnv("prod"))).toEqual(
      "production"
    );
  });

  it("should target the production CieID app when the environment is not set", () => {
    expect(selectItwCieIdEnvironment(stateWithEnv(undefined))).toEqual(
      "production"
    );
  });
});

describe("selectItwSpecsVersion", () => {
  const pid = (spec_version: string, verification?: object) =>
    ({
      credentialType: CredentialType.PID,
      credentialId: "dc_sd_jwt_PersonIdentificationData",
      format: CredentialFormat.SD_JWT,
      spec_version,
      verification
    }) as CredentialMetadata;
  const l2Pid = pid("1.0.0");
  const l3Pid = pid("1.4.6", {
    assurance_level: "high",
    trust_framework: "it_cie"
  });
  const whitelisted = itwSetFiscalCodeWhitelisted(true);
  const walletInstance = itwStoreIntegrityKeyTag("integrity-key-tag");

  test.each<{
    actions: ReadonlyArray<Action>;
    expected: string;
    name: string;
  }>([
    { name: "no wallet, not whitelisted", actions: [], expected: "1.0.0" },
    {
      name: "a L2 PID, not whitelisted",
      actions: [walletInstance, itwCredentialsStore([l2Pid])],
      expected: "1.0.0"
    },
    {
      name: "no wallet, whitelisted",
      actions: [whitelisted],
      expected: CURRENT_ITW_SPECS_VERSION
    },
    {
      name: "a L2 PID, whitelisted",
      actions: [whitelisted, walletInstance, itwCredentialsStore([l2Pid])],
      expected: "1.0.0"
    },
    {
      name: "a L3 PID, whitelisted",
      actions: [whitelisted, walletInstance, itwCredentialsStore([l3Pid])],
      expected: "1.4.6"
    },
    {
      name: "a L3 PID, no longer whitelisted",
      actions: [walletInstance, itwCredentialsStore([l3Pid])],
      expected: "1.4.6"
    }
  ])("returns $expected with $name", ({ actions, expected }) => {
    const state = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      ...actions
    ]);
    expect(selectItwSpecsVersion(state)).toBe(expected);
  });
});
