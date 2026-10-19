import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  zendeskDocumentiSuIoCategory,
  zendeskItWalletCategory
} from "../../../../../../utils/supportAssistance";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import { ItwLifecycleState } from "../../../../lifecycle/store/selectors";
import {
  itwZendeskCategorySelector,
  ItwZendeskWalletStatus,
  itwZendeskWalletStatusSelector
} from "../zendesk";

const scenarios: ReadonlyArray<{
  expectedCategory: typeof zendeskItWalletCategory;
  expectedStatus: ItwZendeskWalletStatus;
  lifecycle: ItwLifecycleState;
}> = [
  {
    lifecycle: ItwLifecycleState.IT_WALLET,
    expectedStatus: ItwZendeskWalletStatus.IT_WALLET,
    expectedCategory: zendeskItWalletCategory
  },
  ...(
    [
      ItwLifecycleState.DOC_IO,
      ItwLifecycleState.DOC_IO_UPGRADABLE,
      ItwLifecycleState.DOC_IO_FALLBACK
    ] as const
  ).map(lifecycle => ({
    lifecycle,
    expectedStatus: ItwZendeskWalletStatus.DOCUMENTI_SU_IO,
    expectedCategory: zendeskDocumentiSuIoCategory
  })),
  ...(
    [
      ItwLifecycleState.INACTIVE,
      ItwLifecycleState.IT_WALLET_ELIGIBLE,
      ItwLifecycleState.IT_WALLET_UNSUPPORTED
    ] as const
  ).map(lifecycle => ({
    lifecycle,
    expectedStatus: ItwZendeskWalletStatus.NOT_ACTIVE,
    expectedCategory: zendeskDocumentiSuIoCategory
  }))
];

describe("itwallet Zendesk selectors", () => {
  const state = appReducer(undefined, applicationChangeState("active"));

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each(
    scenarios.map(row => ({
      ...row,
      lifecycleName: ItwLifecycleState[row.lifecycle]
    }))
  )(
    "returns $expectedStatus and $expectedCategory.value with $lifecycleName",
    ({ lifecycle, expectedStatus, expectedCategory }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleStateSelector")
        .mockReturnValue(lifecycle);
      expect(itwZendeskWalletStatusSelector(state)).toBe(expectedStatus);
      expect(itwZendeskCategorySelector(state)).toBe(expectedCategory);
    }
  );
});
