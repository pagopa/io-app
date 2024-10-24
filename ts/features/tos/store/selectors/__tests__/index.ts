import * as O from "fp-ts/lib/Option";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { TosConfig } from "../../../../../../definitions/content/TosConfig";
import { getTosUrl, getTosVersion } from "../../..";

const TOS_CONFIG: TosConfig = {
  tos_url: "https://www.example.com",
  tos_version: 3.2 as NonNegativeNumber
};

const status: BackendStatus = {
  ...baseRawBackendStatus
};

const customStore = {
  remoteConfig: O.some({
    ...status.config,
    tos: TOS_CONFIG
  })
} as unknown as GlobalState;

function runTest(store: GlobalState, test: (tosConfig: TosConfig) => void) {
  const actualStatus = store.remoteConfig;
  expect(O.isSome(actualStatus)).toBe(true);
  if (O.isSome(actualStatus)) {
    const tosConfig = actualStatus.value.tos;
    expect(tosConfig).not.toBeUndefined();
    test(tosConfig);
  } else {
    fail("unexpected none");
  }
}

describe("Tos config", () => {
  it("should return a value", () => {
    runTest(customStore, tosConfig => {
      expect(getTosVersion(tosConfig)).not.toBeUndefined();
      expect(getTosUrl(tosConfig)).not.toBeNull();
      expect(getTosVersion(tosConfig)).not.toBeNaN();
    });
  });
  it("should be right", () => {
    runTest(customStore, tosConfig => {
      expect(getTosVersion(tosConfig)).toBe(3.2);
      expect(getTosUrl(tosConfig)).toBe("https://www.example.com");
    });
  });
  it("should not be wrong", () => {
    runTest(customStore, tosConfig => {
      expect(getTosVersion(tosConfig)).not.toBe(3.0);
      expect(getTosVersion(tosConfig)).not.toBe(3);
      expect(getTosUrl(tosConfig)).not.toBe("http://www.example.com");
      expect(getTosVersion(tosConfig)).not.toBe(3.8);
      expect(getTosUrl(tosConfig)).not.toBe("http://www.example.it");
    });
  });
});
