import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import {
  buildItwBaseProperties,
  computeItwStatus
} from "../basePropertyBuilder";

describe("buildItwBaseProperties", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("includes V2 and V3 properties when IT-Wallet is inactive", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);

    const state = appReducer(undefined, applicationChangeState("active"));
    const result = buildItwBaseProperties(state);

    expect(result).toHaveProperty("ITW_ID_V2");
    expect(result).toHaveProperty("ITW_PG_V2");
    expect(result).toHaveProperty("ITW_PG_V3");
  });

  it("includes only V3 properties when IT Wallet is active", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const state = appReducer(undefined, applicationChangeState("active"));
    const result = buildItwBaseProperties(state);

    expect(result).toHaveProperty("ITW_PG_V3");
    expect(Object.keys(result)).not.toEqual(
      expect.arrayContaining([
        "ITW_ID_V2",
        "ITW_PG_V2",
        "ITW_TS_V2",
        "ITW_CED_V2"
      ])
    );
  });
});

describe("computeItwStatus", () => {
  it.each`
    scenario                                        | authLevel    | identificationMode | isItwL3  | expected
    ${"not_active when authLevel is undefined"}     | ${undefined} | ${undefined}       | ${false} | ${"not_active"}
    ${"L2 for Documenti su IO with SPID/CieID"}     | ${"L2"}      | ${undefined}       | ${false} | ${"L2"}
    ${"L3 for Documenti su IO with CIE+PIN"}        | ${"L3"}      | ${undefined}       | ${false} | ${"L3"}
    ${"L2+ (spid_can) for IT-Wallet with SPID"}     | ${"L2"}      | ${"spid"}          | ${true}  | ${"L2+ (spid_can)"}
    ${"L3 (cieid_can) for IT-Wallet with CieID L2"} | ${"L2"}      | ${"cieId"}         | ${true}  | ${"L3 (cieid_can)"}
    ${"L3 (cieid_pin) for IT-Wallet with CieID L3"} | ${"L3"}      | ${"cieId"}         | ${true}  | ${"L3 (cieid_pin)"}
    ${"L3 (cie_pin) for IT-Wallet with CIE+PIN"}    | ${"L3"}      | ${"ciePin"}        | ${true}  | ${"L3 (cie_pin)"}
    ${"L3 fallback for existing IT-Wallet users"}   | ${"L3"}      | ${undefined}       | ${true}  | ${"L3"}
    ${"L2 fallback for existing IT-Wallet users"}   | ${"L2"}      | ${undefined}       | ${true}  | ${"L2"}
  `(
    "returns $expected when $scenario",
    ({ authLevel, identificationMode, isItwL3, expected }) => {
      expect(computeItwStatus(authLevel, identificationMode, isItwL3)).toBe(
        expected
      );
    }
  );
});
