import * as REMOTE_CONFIG from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { isSendAarLink } from "../deepLinking";

const testRegex = "^\\s*https:\\/\\/example\\.com\\/aar\\/.*";

describe("DeepLinking utils", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  describe("isSendAarLink", () => {
    [true, false].forEach(isValid => {
      it(`should return ${isValid} for a ${
        isValid ? "valid" : "invalid"
      } Aar link`, () => {
        jest
          .spyOn(REMOTE_CONFIG, "pnAarQRCodeRegexSelector")
          .mockImplementation(() => testRegex);
        const url = `https://example.com/${isValid ? "aar" : "INVALID"}/12345`;
        const result = isSendAarLink({} as GlobalState, url);
        expect(result).toBe(isValid);
      });
    });

    it("should return false if the regex is not available", () => {
      jest
        .spyOn(REMOTE_CONFIG, "pnAarQRCodeRegexSelector")
        .mockImplementation(() => undefined);
      const url = "https://example.com/aar/12345";
      const result = isSendAarLink({} as GlobalState, url);
      expect(result).toBe(false);
    });
  });
});
