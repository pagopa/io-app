import * as NAV_SRV from "../../../../../navigation/NavigationService";
import * as REMOTE_CONFIG from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import PN_ROUTES from "../../../navigation/routes";
// import * as SELECTORS from "../../store/selectors";
import { isSendAARLink, navigateToSendAarFlowIfEnabled } from "../deepLinking";

const testRegex = "^\\s*https:\\/\\/example\\.com\\/aar\\/.*";

describe("DeepLinking utils", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  describe("isSendAARLink", () => {
    [true, false].forEach(isValid => {
      it(`should return ${isValid} for a ${
        isValid ? "valid" : "invalid"
      } AAR link`, () => {
        jest
          .spyOn(REMOTE_CONFIG, "pnAARQRCodeRegexSelector")
          .mockImplementation(() => testRegex);
        const url = `https://example.com/${isValid ? "aar" : "INVALID"}/12345`;
        const result = isSendAARLink({} as GlobalState, url);
        expect(result).toBe(isValid);
      });
    });

    it("should return false if the regex is not available", () => {
      jest
        .spyOn(REMOTE_CONFIG, "pnAARQRCodeRegexSelector")
        .mockImplementation(() => undefined);
      const url = "https://example.com/aar/12345";
      const result = isSendAARLink({} as GlobalState, url);
      expect(result).toBe(false);
    });
  });
  describe("navigateToSendAarFlow", () => {
    [true, false].forEach(isAAREnabled =>
      it(`should ${
        isAAREnabled ? "not " : ""
      }navigate to the AAR screen when aar ${
        isAAREnabled ? "is" : "isn't"
      } enabled`, () => {
        const mockNav = jest.fn();
        const aarUrl = "www.example.com";
        jest
          .spyOn(REMOTE_CONFIG, "isAarRemoteEnabled")
          .mockImplementation(() => isAAREnabled);
        jest.spyOn(NAV_SRV.default, "navigate").mockImplementation(mockNav);

        navigateToSendAarFlowIfEnabled({} as GlobalState, aarUrl);
        if (isAAREnabled) {
          expect(mockNav).toHaveBeenCalledTimes(1);
          expect(mockNav).toHaveBeenCalledWith(
            MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
            {
              screen: PN_ROUTES.MAIN,
              params: {
                screen: PN_ROUTES.QR_SCAN_FLOW,
                params: { aarUrl }
              }
            }
          );
        } else {
          expect(mockNav).toHaveBeenCalledTimes(0);
        }
      })
    );
  });
});
