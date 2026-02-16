import { buildItwBaseProperties } from "../basePropertyBuilder";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";

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
