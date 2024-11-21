import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  fimsHistoryErrorSelector,
  fimsHistoryExportStateSelector,
  fimsHistoryPotSelector,
  fimsHistoryToUndefinedSelector,
  fimsIsHistoryEnabledSelector,
  isFimsHistoryExportingSelector,
  isFimsHistoryLoadingSelector
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../../common/model/RemoteValue";

describe("fimsHistoryPotSelector", () =>
  it("should return the 'features.fims.history.consentsList' instance", () => {
    const consentsData = pot.someError({}, "An error");
    const globalState = {
      features: {
        fims: {
          history: {
            consentsList: consentsData
          }
        }
      }
    } as GlobalState;
    const historyPot = fimsHistoryPotSelector(globalState);
    expect(historyPot).toBe(consentsData);
  }));

describe("isFimsHistoryLoadingSelector", () =>
  [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating({}),
    pot.noneError("An error"),
    pot.some({}),
    pot.someLoading({}),
    pot.someUpdating({}, {}),
    pot.someError({}, "An error")
  ].forEach(consentsDataPot => {
    const expectedOutput =
      consentsDataPot.kind === "PotNoneLoading" ||
      consentsDataPot.kind === "PotSomeLoading";
    it(`When 'features.fims.history.consentsList' is of type '${consentsDataPot.kind}', it should return '${expectedOutput}' `, () => {
      const globalState = {
        features: {
          fims: {
            history: {
              consentsList: consentsDataPot
            }
          }
        }
      } as GlobalState;
      const historyPot = isFimsHistoryLoadingSelector(globalState);
      expect(historyPot).toBe(expectedOutput);
    });
  }));

describe("fimsHistoryToUndefinedSelector", () => {
  const consentsData = {
    items: [
      {
        id: "01JBY12W3V8QQTTYCC2QGD85EX",
        service_id: "01JBY130VBSH6GH4V703S8BJ8P",
        timestamp: new Date()
      }
    ],
    continuationToken: "01JBY12NM42JQ22G4NYKXC2Y8H"
  };
  [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(consentsData),
    pot.noneError("An error"),
    pot.some(consentsData),
    pot.someLoading(consentsData),
    pot.someUpdating(consentsData, consentsData),
    pot.someError(consentsData, "An error")
  ].forEach(consentsDataPot => {
    const expectedOutput = pot.isSome(consentsDataPot)
      ? consentsData
      : undefined;
    it(`When 'features.fims.history.consentsList' is of type '${
      consentsDataPot.kind
    }', it should return ${
      expectedOutput ? "its inner data" : "'undefined'"
    }`, () => {
      const globalState = {
        features: {
          fims: {
            history: {
              consentsList: consentsDataPot
            }
          }
        }
      } as GlobalState;
      const historyOrUndefined = fimsHistoryToUndefinedSelector(globalState);
      expect(historyOrUndefined).toBe(expectedOutput);
    });
  });
});

describe("fimsHistoryErrorSelector", () => {
  [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating({}),
    pot.noneError("An error"),
    pot.some({}),
    pot.someLoading({}),
    pot.someUpdating({}, {}),
    pot.someError({}, "An error")
  ].forEach(consentsDataPot => {
    const expectedOutput =
      consentsDataPot.kind === "PotNoneError"
        ? "FULL_KO"
        : consentsDataPot.kind === "PotSomeError"
        ? "ALERT_ONLY"
        : undefined;
    it(`When 'features.fims.history.consentsList' is of type '${consentsDataPot.kind}', it should return ${expectedOutput}`, () => {
      const globalState = {
        features: {
          fims: {
            history: {
              consentsList: consentsDataPot
            }
          }
        }
      } as GlobalState;
      const historyErrorOrUndefined = fimsHistoryErrorSelector(globalState);
      expect(historyErrorOrUndefined).toBe(expectedOutput);
    });
  });
});

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

describe("fimsHistoryExportStateSelector", () =>
  it("should return the 'features.fims.history.historyExportState' instance", () => {
    const exportState = remoteReady("SUCCESS");
    const globalState = {
      features: {
        fims: {
          history: {
            historyExportState: exportState
          }
        }
      }
    } as GlobalState;
    const exportStateRemoteValue = fimsHistoryExportStateSelector(globalState);
    expect(exportStateRemoteValue).toBe(exportState);
  }));

describe("isFimsHistoryExportingSelector", () =>
  [
    remoteUndefined,
    remoteLoading,
    remoteReady("SUCCESS"),
    remoteReady("ALREADY_EXPORTING"),
    remoteError(null)
  ].forEach(exportState => {
    const expectedOutput = exportState.kind === "loading";
    it(`When 'features.fims.history.historyExportState' is of type '${exportState.kind}', it should return '${expectedOutput}'`, () => {
      const globalState = {
        features: {
          fims: {
            history: {
              historyExportState: exportState
            }
          }
        }
      } as GlobalState;
      const isExportingHistory = isFimsHistoryExportingSelector(globalState);
      expect(isExportingHistory).toBe(expectedOutput);
    });
  }));
