import * as O from "fp-ts/lib/Option";
import { Tuple2, ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { isEmailUniquenessValidationEnabledSelector } from "..";
import { EmailUniquenessConfig } from "../../../../../../definitions/content/EmailUniquenessConfig";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

jest.mock("../../../../../config", () => ({
  isNewCduFlow: true
}));

describe('backend service Feature Flag "emailUniquenessValidation"', () => {
  const status: BackendStatus = {
    ...baseRawBackendStatus
  };

  const customStore = (emailUniquenessValidation: EmailUniquenessConfig) =>
    ({
      features: {
        loginFeatures: {
          fastLogin: {
            optIn: {
              enabled: true
            }
          }
        }
      },
      backendStatus: {
        status: O.some({
          ...status,
          config: {
            ...status.config,
            emailUniquenessValidation
          }
        })
      }
    } as unknown as GlobalState);

  [
    Tuple2("0", false),
    Tuple2("0.0", false),
    Tuple2("0.0.0", false),
    Tuple2("0.0.0.0", false),
    Tuple2("1", true),
    Tuple2("1.2", true),
    Tuple2("1.2.3", true),
    Tuple2("1.2.3.0", true),
    Tuple2("1.2.3.1", true),
    Tuple2("1.2.3.2", true),
    Tuple2("1.2.3.3", true),
    Tuple2("1.2.3.4", true),
    Tuple2("1.2.3.5", false),
    Tuple2("-1", false),
    Tuple2("", false),
    Tuple2(undefined, false),
    Tuple2("?$&&/!@", false),
    Tuple2("2", false),
    Tuple2("1.3", false),
    Tuple2("1.2.4", false)
  ].forEach((t: ITuple2<string | undefined, boolean>) => {
    const [minAppVersion, expectedValue] = [t.e1, t.e2];
    it(`should return ${expectedValue} for ${JSON.stringify(
      minAppVersion
    )}`, () => {
      const store = customStore({
        min_app_version: {
          ios: minAppVersion,
          android: minAppVersion
        }
      });

      expect(isEmailUniquenessValidationEnabledSelector(store)).toBe(
        expectedValue
      );
    });
  });
});
