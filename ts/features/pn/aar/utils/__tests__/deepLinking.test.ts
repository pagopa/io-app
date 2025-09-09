import * as REMOTE_CONFIG from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { isSendAARLink } from "../deepLinking";
const testRegex = "^\\s*https:\\/\\/example\\.com\\/aar\\/.*";
describe("DeepLinking utils", () => {
  describe("isSendAARLink", () => {
    [true, false].forEach(isValid => {
      it(`should return ${isValid} for a ${
        isValid ? "valid" : "invalid"
      } AAR link`, () => {
        jest
          .spyOn(REMOTE_CONFIG, "pnAARQRCodeRegexSelector")
          .mockImplementation(() => testRegex);
        const url = `https://example.com/${isValid ? "aar" : "INVALID"}/12345`;
        expect(isSendAARLink({} as GlobalState, url)).toBe(isValid);
      });
    });

    it("should return false if the regex is not available", () => {
      jest
        .spyOn(REMOTE_CONFIG, "pnAARQRCodeRegexSelector")
        .mockImplementation(() => undefined);
      const url = "https://example.com/aar/12345";
      expect(isSendAARLink({} as GlobalState, url)).toBe(false);
    });
  });
});
