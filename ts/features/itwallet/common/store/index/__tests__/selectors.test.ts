import { isItwEnabledSelector } from "../../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../../store/reducers/types";
import { isItwTrialActiveSelector } from "../../../../../trialSystem/store/reducers";
import { itwLifecycleIsValidSelector } from "../../../../lifecycle/store/selectors";
import { isItwDiscoveryBannerRenderableSelector } from "../selectors";

jest.mock("../../../../../../store/reducers/backendStatus", () => ({
  isItwEnabledSelector: jest.fn()
}));
jest.mock("../../../../lifecycle/store/selectors", () => ({
  itwLifecycleIsValidSelector: jest.fn()
}));
jest.mock("../../../../../trialSystem/store/reducers", () => ({
  isItwTrialActiveSelector: jest.fn()
}));
type JestMock = ReturnType<typeof jest.fn>;
const mockValues = (
  itwEnabledMock: boolean,
  itwLifecycleValidMock: boolean,
  trialActiveMock: boolean
) => {
  (isItwEnabledSelector as unknown as JestMock).mockReturnValue(itwEnabledMock);
  (itwLifecycleIsValidSelector as unknown as JestMock).mockReturnValue(
    itwLifecycleValidMock
  );
  (isItwTrialActiveSelector as unknown as JestMock).mockReturnValue(
    trialActiveMock
  );
};

describe("itwDiscoveryBannerSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  for (const itwEnabled of [true, false]) {
    for (const lifecycleValid of [true, false]) {
      for (const trialActive of [true, false]) {
        const expectedResult = !(!trialActive || lifecycleValid || !itwEnabled); // this mimicks the behaviour of the standalone banner's selector
        it(`should return ${expectedResult} if isItwEnabled is ${itwEnabled}, trialActive is ${trialActive} and lifecycleValid is ${lifecycleValid}`, () => {
          mockValues(itwEnabled, lifecycleValid, trialActive);
          expect(
            isItwDiscoveryBannerRenderableSelector({} as unknown as GlobalState)
          ).toBe(expectedResult);
        });
      }
    }
  }
});
