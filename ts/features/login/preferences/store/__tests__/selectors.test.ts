import { merge, set } from "lodash";
import * as O from "fp-ts/lib/Option";
import { addDays } from "date-fns";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { isSessionExpirationBannerRenderableSelector } from "../selectors";
import { isFastLoginEnabledSelector } from "../../../../fastLogin/store/selectors";
import { AuthenticationState } from "../../../../authentication/store/models";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";

// If you want to know when this selector was implemented, you can refer to the mocked date below!
MockDate.set(new Date(2025, 1, 19));

const getFutureDate = (days: number): Date => addDays(new Date(), days);

jest.mock("../../../../fastLogin/store/selectors", () => ({
  isFastLoginEnabledSelector: jest.fn()
}));

describe("isSessionExpirationBannerRenderableSelector", () => {
  afterEach(jest.clearAllMocks);

  it("Should return false when remoteConfig is none", () => {
    (isFastLoginEnabledSelector as unknown as jest.Mock).mockReturnValue(true);

    const globalState = configureGlobalState({
      authentication: generateAuthenticationObj(getFutureDate(15)),
      remoteConfig: O.none,
      showBanner: true
    });

    const isSessionExpirationBannerRenderable =
      isSessionExpirationBannerRenderableSelector(globalState);

    expect(isSessionExpirationBannerRenderable).toBe(false);
  });

  it("Should return false when sessionInfo is missing", () => {
    (isFastLoginEnabledSelector as unknown as jest.Mock).mockReturnValue(true);

    const globalState = configureGlobalState({
      authentication: generateAuthenticationObj(),
      remoteConfig: O.some({
        loginConfig: {
          notifyExpirationThreshold: {
            fastLogin: 15
          }
        }
      }),
      showBanner: true
    });

    const isSessionExpirationBannerRenderable =
      isSessionExpirationBannerRenderableSelector(globalState);

    expect(isSessionExpirationBannerRenderable).toBe(false);
  });
  it("Should return false when sessionInfo is present but it doesn't contain expirationDate", () => {
    (isFastLoginEnabledSelector as unknown as jest.Mock).mockReturnValue(true);

    const globalState = configureGlobalState({
      authentication: {
        kind: "LoggedInWithSessionInfo",
        sessionInfo: {}
      },
      remoteConfig: O.some({
        loginConfig: {
          notifyExpirationThreshold: {
            fastLogin: 15
          }
        }
      }),
      showBanner: true
    });

    const isSessionExpirationBannerRenderable =
      isSessionExpirationBannerRenderableSelector(globalState);

    expect(isSessionExpirationBannerRenderable).toBe(false);
  });

  it.each`
    isFastLogin | showBanner | days  | fastLogin    | standardLogin | expected
    ${true}     | ${true}    | ${15} | ${30}        | ${undefined}  | ${true}
    ${false}    | ${true}    | ${3}  | ${undefined} | ${3}          | ${true}
    ${true}     | ${true}    | ${15} | ${undefined} | ${3}          | ${false}
    ${true}     | ${true}    | ${15} | ${15}        | ${undefined}  | ${true}
    ${false}    | ${true}    | ${30} | ${15}        | ${3}          | ${false}
    ${false}    | ${false}   | ${3}  | ${15}        | ${3}          | ${false}
    ${true}     | ${false}   | ${3}  | ${15}        | ${3}          | ${false}
  `(
    "Should return $expected for fastLogin=$isFastLogin, showBanner=$showBanner and expirations in $days days for values { standardLogin: $standardLogin, fastLogin: $fastLogin }",
    ({ days, isFastLogin, expected, fastLogin, standardLogin, showBanner }) => {
      (isFastLoginEnabledSelector as unknown as jest.Mock).mockReturnValue(
        isFastLogin
      );

      const globalState = configureGlobalState({
        authentication: generateAuthenticationObj(getFutureDate(days)),
        remoteConfig: O.some({
          loginConfig: {
            notifyExpirationThreshold: {
              fastLogin,
              standardLogin
            }
          }
        }),
        showBanner
      });

      const isSessionExpirationBannerRenderable =
        isSessionExpirationBannerRenderableSelector(globalState);

      expect(isSessionExpirationBannerRenderable).toBe(expected);
    }
  );
});

type Config = {
  authentication?: Partial<AuthenticationState>;
  showBanner?: boolean;
  remoteConfig?: O.Option<Partial<BackendStatus["config"]>>;
};

function generateAuthenticationObj(
  expirationDate?: Date
): Partial<AuthenticationState> {
  if (expirationDate instanceof Date) {
    return {
      kind: "LoggedInWithSessionInfo",
      sessionInfo: {
        expirationDate
      }
    };
  }
  return {
    kind: "LoggedInWithoutSessionInfo"
  };
}

function configureGlobalState({
  authentication,
  remoteConfig,
  showBanner = true
}: Config) {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  return merge(
    globalState,
    set(
      globalState,
      "features.loginFeatures.loginPreferences.showSessionExpirationBanner",
      showBanner
    ),
    set(globalState, "authentication", authentication),
    set(globalState, "remoteConfig", remoteConfig)
  );
}
