jest.mock("@pagopa/io-react-native-cie", () => ({
  CieUtils: {
    hasNfcFeature: jest.fn()
  }
}));
import * as CIE_UTILS from "@pagopa/io-react-native-cie";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useIsNfcFeatureAvailable } from "../useIsNfcFeatureAvailable";

const hasNfcMock = CIE_UTILS.CieUtils.hasNfcFeature as jest.Mock;
describe("useIsNfcFeatureAvailable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [
    {
      description: "should return true when NFC is available",
      mockImpl: () => Promise.resolve(true),
      expectedResult: true
    },

    {
      description: "should return false when NFC is not available",
      mockImpl: () => Promise.resolve(false),
      expectedResult: false
    },
    {
      description: "should return false when hasNfcFeature throws an error",
      mockImpl: () => Promise.reject(new Error("NFC error")),
      expectedResult: false
    }
  ];

  for (const { description, expectedResult, mockImpl } of testCases) {
    it(`${description}, and not repeat the "hasNfcFeature" call on rerender`, async () => {
      hasNfcMock.mockImplementation(mockImpl);

      expect(hasNfcMock).toHaveBeenCalledTimes(0);
      const { result, rerender } = renderHook(() => useIsNfcFeatureAvailable());
      expect(result.current).toBeUndefined();
      expect(hasNfcMock).toHaveBeenCalledTimes(1);

      rerender(undefined);
      await waitFor(() => {
        expect(hasNfcMock).toHaveBeenCalledTimes(1);
        expect(result.current).toBe(expectedResult);
      });
    });
  }
});
