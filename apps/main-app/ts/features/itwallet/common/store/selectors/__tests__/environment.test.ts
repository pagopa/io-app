import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../store/reducers/types";
import { CredentialType } from "../../../utils/itwMocksUtils";
import { CredentialFormat } from "../../../utils/itwTypesUtils";
import { selectItwEnv, selectItwSpecsVersion } from "../environment";

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

describe("selectItwSpecsVersion", () => {
  test.each`
    isWhitelisted | pidSpecVersion | expected
    ${false}      | ${undefined}   | ${"1.0.0"}
    ${false}      | ${"1.0.0"}     | ${"1.0.0"}
    ${true}       | ${undefined}   | ${"1.3.3"}
    ${true}       | ${"1.0.0"}     | ${"1.0.0"}
    ${true}       | ${"1.3.3"}     | ${"1.3.3"}
  `(
    "Whitelist: $isWhitelisted, PID: $pidSpecVersion -> ITW: $expected",
    ({ isWhitelisted, pidSpecVersion, expected }) => {
      const state = {
        remoteConfig: O.none,
        features: {
          itWallet: {
            preferences: {
              isFiscalCodeWhitelisted: isWhitelisted
            },
            credentials: {
              credentials: {
                ...(pidSpecVersion && {
                  pid: {
                    spec_version: pidSpecVersion,
                    credentialType: CredentialType.PID,
                    format: CredentialFormat.SD_JWT
                  }
                })
              }
            }
          }
        }
      } as GlobalState;
      expect(selectItwSpecsVersion(state)).toBe(expected);
    }
  );
});
