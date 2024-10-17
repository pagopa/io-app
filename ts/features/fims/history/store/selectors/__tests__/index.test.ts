import * as O from "fp-ts/lib/Option";
import { fimsIsHistoryEnabledSelector } from "..";
import { GlobalState } from "../../../../../../store/reducers/types";

describe("fimsIsHistoryEnabledSelector", () => {
  it("should return 'false' if 'backendStatus' is 'O.none'", () => {
    const globalState = {
      remoteConfig: O.none
    } as GlobalState;
    const fimsHistoryEnabled = fimsIsHistoryEnabledSelector(globalState);
    expect(fimsHistoryEnabled).toBe(false);
  });
  [undefined, false, true].forEach(historyEnabled => {
    const expectedOutput = historyEnabled !== false;
    it(`should return '${expectedOutput}' if 'remoteConfig' is 'O.some(${historyEnabled})'`, () => {
      const globalState = {
        remoteConfig: O.some({
          fims: {
            historyEnabled
          }
        })
      } as GlobalState;
      const fimsHistoryEnabled = fimsIsHistoryEnabledSelector(globalState);
      expect(fimsHistoryEnabled).toBe(expectedOutput);
    });
  });
});
