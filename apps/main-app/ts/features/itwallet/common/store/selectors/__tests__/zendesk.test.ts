import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  zendeskDocumentiSuIoCategory,
  zendeskItWalletCategory
} from "../../../../../../utils/supportAssistance";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import { itwZendeskCategorySelector } from "../zendesk";

describe("itwZendeskCategorySelector", () => {
  const state = appReducer(undefined, applicationChangeState("active"));

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    {
      name: "IT-Wallet is active",
      isItwValid: true,
      expected: zendeskItWalletCategory
    },
    {
      name: "IT-Wallet is not active",
      isItwValid: false,
      expected: zendeskDocumentiSuIoCategory
    }
  ])("returns $expected.value when $name", ({ isItwValid, expected }) => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(isItwValid);

    expect(itwZendeskCategorySelector(state)).toBe(expected);
  });
});
