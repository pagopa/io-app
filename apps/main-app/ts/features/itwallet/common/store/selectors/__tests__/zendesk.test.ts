import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  zendeskDocumentiSuIoCategory,
  zendeskItWalletCategory
} from "../../../../../../utils/supportAssistance";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import {
  itwZendeskCategorySelector,
  ItwZendeskWalletStatus,
  itwZendeskWalletStatusSelector
} from "../zendesk";

const scenarios = [
  {
    name: "IT-Wallet is active",
    isItwValid: true,
    isValid: true,
    expectedStatus: ItwZendeskWalletStatus.IT_WALLET,
    expectedCategory: zendeskItWalletCategory
  },
  {
    name: "Documenti su IO is active",
    isItwValid: false,
    isValid: true,
    expectedStatus: ItwZendeskWalletStatus.DOCUMENTI_SU_IO,
    expectedCategory: zendeskDocumentiSuIoCategory
  },
  {
    name: "no wallet is active",
    isItwValid: false,
    isValid: false,
    expectedStatus: ItwZendeskWalletStatus.NOT_ACTIVE,
    expectedCategory: zendeskDocumentiSuIoCategory
  }
];

describe("itwallet Zendesk selectors", () => {
  const state = appReducer(undefined, applicationChangeState("active"));

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockLifecycle = (isItwValid: boolean, isValid: boolean) => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(isItwValid);
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(isValid);
  };

  test.each(scenarios)(
    "itwZendeskWalletStatusSelector returns $expectedStatus when $name",
    ({ isItwValid, isValid, expectedStatus }) => {
      mockLifecycle(isItwValid, isValid);
      expect(itwZendeskWalletStatusSelector(state)).toBe(expectedStatus);
    }
  );

  test.each(scenarios)(
    "itwZendeskCategorySelector returns $expectedCategory.value when $name",
    ({ isItwValid, isValid, expectedCategory }) => {
      mockLifecycle(isItwValid, isValid);
      expect(itwZendeskCategorySelector(state)).toBe(expectedCategory);
    }
  );
});
