import * as O from "fp-ts/lib/Option";
import { isAAREnabled } from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as appVersion from "../../../../../../utils/appVersion";

describe("isAAREnabled selector", () => {
  [
    { local: true, remote: true, expect: true },
    { local: true, remote: false, expect: false },
    { local: false, remote: true, expect: false },
    { local: false, remote: false, expect: false }
  ].forEach(({ local, remote, expect: expected }) => {
    it(`Should return ${expected} when isAARLocalEnabled='${local}' and isAARRemoteEnabled='${remote}'`, () => {
      const state = {
        persistedPreferences: {
          isAarFeatureEnabled: local
        },
        remoteConfig: O.some({
          pn: {
            aar: {
              min_app_version: {
                android: remote ? "1.0.0.0" : "3.0.0.0",
                ios: remote ? "1.0.0.0" : "3.0.0.0"
              }
            }
          }
        })
      } as GlobalState;
      jest
        .spyOn(appVersion, "getAppVersion")
        .mockImplementation(() => "2.0.0.0");

      const isAarFeatureEnabled = isAAREnabled(state);
      expect(isAarFeatureEnabled).toBe(expected);
    });
  });
});
