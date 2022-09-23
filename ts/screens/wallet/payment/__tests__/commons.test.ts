import { PspData } from "../../../../../definitions/pagopa/PspData";
import { filterPspsByPreferredPsps } from "../common";

type SimplePspData = Pick<PspData, "idPsp">;

type TestCase = {
  originalPsps: ReadonlyArray<SimplePspData>;
  remotePreferredPsps: ReadonlyArray<string> | undefined;
  fallbackPreferredPsps: ReadonlyArray<string> | undefined;
  expectedPsps: ReadonlyArray<SimplePspData>;
};

const PspNP1 = {
  idPsp: "PSP_NOT_PREFERRED_1"
};

const PspNP2 = {
  idPsp: "PSP_NOT_PREFERRED_2"
};

const PspP1 = {
  idPsp: "PSP_PREFERRED_1"
};

const PspP2 = {
  idPsp: "PSP_PREFERRED_2"
};

const TEST_CASES: ReadonlyArray<TestCase> = [
  {
    originalPsps: [PspNP1, PspNP2, PspP1, PspP2],
    remotePreferredPsps: undefined,
    fallbackPreferredPsps: undefined,
    expectedPsps: [PspNP1, PspNP2, PspP1, PspP2]
  },
  {
    originalPsps: [PspNP1, PspNP2, PspP1, PspP2],
    remotePreferredPsps: [],
    fallbackPreferredPsps: [],
    expectedPsps: [PspNP1, PspNP2, PspP1, PspP2]
  },
  {
    originalPsps: [PspNP1, PspNP2, PspP1, PspP2],
    remotePreferredPsps: [PspP1.idPsp],
    fallbackPreferredPsps: undefined,
    expectedPsps: [PspP1]
  },
  {
    originalPsps: [PspNP1, PspNP2, PspP1, PspP2],
    remotePreferredPsps: [PspP1.idPsp, PspP2.idPsp],
    fallbackPreferredPsps: undefined,
    expectedPsps: [PspP1, PspP2]
  },
  {
    originalPsps: [PspNP1, PspNP2, PspP1, PspP2],
    remotePreferredPsps: undefined,
    fallbackPreferredPsps: [PspP1.idPsp],
    expectedPsps: [PspP1]
  },
  {
    originalPsps: [PspNP1, PspNP2, PspP1, PspP2],
    remotePreferredPsps: undefined,
    fallbackPreferredPsps: [PspP1.idPsp, PspP2.idPsp],
    expectedPsps: [PspP1, PspP2]
  },
  {
    originalPsps: [PspNP1, PspNP2, PspP1, PspP2],
    remotePreferredPsps: [PspP1.idPsp],
    fallbackPreferredPsps: [PspP2.idPsp],
    expectedPsps: [PspP1]
  }
];

describe("filterPspsByAllowedPsps", () => {
  it.each(TEST_CASES)(
    "should filter original PSPs by preferred PSPs",
    ({
      originalPsps,
      remotePreferredPsps,
      fallbackPreferredPsps,
      expectedPsps
    }) => {
      expect(
        filterPspsByPreferredPsps(
          originalPsps as unknown as ReadonlyArray<PspData>,
          remotePreferredPsps,
          fallbackPreferredPsps
        )
      ).toEqual(expectedPsps);
    }
  );
});
