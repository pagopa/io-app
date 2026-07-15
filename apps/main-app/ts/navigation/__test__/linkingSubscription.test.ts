import * as LINKING from "react-native";
import configureMockStore from "redux-mock-store";

import * as UTIL_GUARDS from "../../features/authentication/common/store/utils/guards";
import { IO_LOGIN_CIE_URL_SCHEME } from "../../features/authentication/login/cie/utils/cie";
import { parseCredentialOfferLink } from "../../features/itwallet/offer/utils";
import { storeLinkingUrl } from "../../features/linking/actions";
import * as LINKING_ANALYTICS from "../../features/linking/analytics";
import { resetMessageArchivingAction } from "../../features/messages/store/actions/archiving";
import * as ARCHIVING_SELECTORS from "../../features/messages/store/reducers/archiving";
import { initiateAarFlow } from "../../features/pn/aar/store/actions";
import * as DEEP_LINKING from "../../features/pn/aar/utils/deepLinking";
import * as UTM_LINK from "../../features/utmLink";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { GlobalState } from "../../store/reducers/types";
import { linkingSubscription } from "../linkingSubscription";

describe("linkingSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should add and remove an event listener", () => {
    const { addEventListenerSpy, mockCurrySubscription } = initializeTests();

    const removeMock = jest.fn();
    addEventListenerSpy.mockImplementation(
      () => ({ remove: removeMock }) as any
    );

    const mockUnsubscribe = mockCurrySubscription(jest.fn());
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "url",
      expect.any(Function)
    );
    mockUnsubscribe();
    expect(removeMock).toHaveBeenCalled();
  });
  it("should call the listener and 'processUtmLink'", () => {
    const { mockCurrySubscription, addEventListenerSpy } = initializeTests();
    const mockListener = jest.fn();
    const mockProcessUtmLink = jest.fn();

    jest
      .spyOn(UTM_LINK, "processUtmLink")
      .mockImplementation(mockProcessUtmLink);

    mockCurrySubscription(mockListener);

    const testUrl = "https://example.com";
    runEventListenerCallback(addEventListenerSpy, { url: testUrl });

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(testUrl);
    expect(mockProcessUtmLink).toHaveBeenCalledTimes(1);
    expect(mockProcessUtmLink).toHaveBeenCalledWith(
      testUrl,
      expect.any(Function)
    );
  });

  it("should call 'trackIOOpenedFromUniversalAppLink' when a URL is received", () => {
    const { mockCurrySubscription, addEventListenerSpy } = initializeTests();
    const mockTrackIOOpenedFromUniversalAppLink = jest.fn();

    jest
      .spyOn(LINKING_ANALYTICS, "trackIOOpenedFromUniversalAppLink")
      .mockImplementation(mockTrackIOOpenedFromUniversalAppLink);

    mockCurrySubscription(jest.fn());

    const testUrl = "https://example.com";
    runEventListenerCallback(addEventListenerSpy, { url: testUrl });

    expect(mockTrackIOOpenedFromUniversalAppLink).toHaveBeenCalledTimes(1);
    expect(mockTrackIOOpenedFromUniversalAppLink).toHaveBeenCalledWith(
      testUrl,
      null // Default value for isMixpanelEnabled in initial state
    );
  });

  it.each([false, true])(
    `should dispatch 'resetMessageArchivingAction' if archiving is not disabled; archiving : %d`,
    isDisabled => {
      const { mockDispatch, mockCurrySubscription, addEventListenerSpy } =
        initializeTests();

      jest
        .spyOn(ARCHIVING_SELECTORS, "isArchivingDisabledSelector")
        .mockImplementation(() => isDisabled);

      mockCurrySubscription(jest.fn());

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      const testUrl = "https://example.com";
      runEventListenerCallback(addEventListenerSpy, { url: testUrl });
      if (isDisabled) {
        expect(mockDispatch).not.toHaveBeenCalledWith(
          resetMessageArchivingAction(undefined)
        );
      } else {
        expect(mockDispatch).toHaveBeenCalledWith(
          resetMessageArchivingAction(undefined)
        );
      }
    }
  );

  [true, false].forEach(isLoggedIn => {
    [true, false].forEach(isAarLink => {
      it(`should handle a URL event when${
        isLoggedIn ? "" : " not"
      } logged in, and the link passed ${
        isAarLink ? "is" : "isn't"
      } a valid Aar link`, () => {
        const { mockDispatch, mockCurrySubscription, addEventListenerSpy } =
          initializeTests();
        const mockNav = jest.fn();
        const testUrl = `https://example.com/${isAarLink}/${isLoggedIn}`;

        jest
          .spyOn(UTIL_GUARDS, "isLoggedIn")
          .mockImplementation(() => isLoggedIn);
        jest
          .spyOn(DEEP_LINKING, "isSendAarLink")
          .mockImplementation(() => isAarLink);

        mockCurrySubscription(jest.fn());

        runEventListenerCallback(addEventListenerSpy, { url: testUrl });

        if (isLoggedIn) {
          // When logged in, we do not store the URL for later processing
          expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: "STORE_LINKING_URL" })
          );

          if (isAarLink) {
            expect(mockDispatch).toHaveBeenCalledWith(
              initiateAarFlow({ aarUrl: testUrl })
            );
          } else {
            expect(mockNav).not.toHaveBeenCalled();
          }
        } else {
          expect(mockNav).not.toHaveBeenCalled();
          expect(mockDispatch).toHaveBeenCalledWith(storeLinkingUrl(testUrl));
        }
      });
    });
  });
  const blacklistTestCases = [
    { url: `${IO_LOGIN_CIE_URL_SCHEME}`, shouldBlackList: true },
    { url: `${IO_LOGIN_CIE_URL_SCHEME}somePath`, shouldBlackList: true },
    {
      url: `    ${IO_LOGIN_CIE_URL_SCHEME}`,
      shouldBlackList: true
    },
    {
      url: `    ${IO_LOGIN_CIE_URL_SCHEME}somePath`,
      shouldBlackList: true
    },
    { url: `${IO_LOGIN_CIE_URL_SCHEME.toUpperCase()}`, shouldBlackList: true },
    {
      url: `https://example.com/${IO_LOGIN_CIE_URL_SCHEME}`,
      shouldBlackList: false
    },
    {
      url: `https://example.com/somePath`,
      shouldBlackList: false
    }
  ];
  blacklistTestCases.forEach(({ url, shouldBlackList }) => {
    it(`${
      shouldBlackList ? "shouldn't" : "should"
    } store the DeepLink URL when not logged and passed the following URL: "${url}"`, () => {
      const { mockDispatch, mockCurrySubscription, addEventListenerSpy } =
        initializeTests();

      jest.spyOn(UTIL_GUARDS, "isLoggedIn").mockImplementation(() => false);

      mockCurrySubscription(jest.fn());

      runEventListenerCallback(addEventListenerSpy, { url });

      if (shouldBlackList) {
        expect(mockDispatch).not.toHaveBeenCalledWith(storeLinkingUrl(url));
      } else {
        expect(mockDispatch).toHaveBeenCalledWith(storeLinkingUrl(url));
      }
    });
  });

  describe("credential offer normalization", () => {
    const credentialOfferUrl =
      "openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fissuer%22%7D";

    it("should pass the internal route to the listener when a credential offer custom scheme is received", () => {
      const { mockCurrySubscription, addEventListenerSpy } = initializeTests();
      const mockListener = jest.fn();

      mockCurrySubscription(mockListener);
      runEventListenerCallback(addEventListenerSpy, {
        url: credentialOfferUrl
      });

      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith(
        parseCredentialOfferLink(credentialOfferUrl)?.internalRoute
      );
    });

    it("should store the original URL when not logged in and a credential offer is received", () => {
      const { mockDispatch, mockCurrySubscription, addEventListenerSpy } =
        initializeTests();

      jest.spyOn(UTIL_GUARDS, "isLoggedIn").mockImplementation(() => false);

      mockCurrySubscription(jest.fn());
      runEventListenerCallback(addEventListenerSpy, {
        url: credentialOfferUrl
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        storeLinkingUrl(credentialOfferUrl)
      );
    });

    it("should preserve the original URL for side effects when a credential offer is received", () => {
      const { mockCurrySubscription, addEventListenerSpy } = initializeTests();
      const mockTrackIOOpenedFromUniversalAppLink = jest.fn();
      const mockProcessUtmLink = jest.fn();

      jest
        .spyOn(LINKING_ANALYTICS, "trackIOOpenedFromUniversalAppLink")
        .mockImplementation(mockTrackIOOpenedFromUniversalAppLink);
      jest
        .spyOn(UTM_LINK, "processUtmLink")
        .mockImplementation(mockProcessUtmLink);

      mockCurrySubscription(jest.fn());
      runEventListenerCallback(addEventListenerSpy, {
        url: credentialOfferUrl
      });

      expect(mockTrackIOOpenedFromUniversalAppLink).toHaveBeenCalledWith(
        credentialOfferUrl,
        null // Default value for isMixpanelEnabled in initial state
      );
      expect(mockProcessUtmLink).toHaveBeenCalledWith(
        credentialOfferUrl,
        expect.any(Function)
      );
    });
  });
});

// --------------------- UTILS ---------------------

const runEventListenerCallback = (
  eventListenerSpy: jest.SpyInstance,
  event: { url: string }
) => {
  const callback = eventListenerSpy.mock.calls[0][1] as (event: {
    url: string;
  }) => void;
  callback(event);
};

const initializeTests = () => {
  const mockStore = configureMockStore<GlobalState>();
  const defaultState = appReducer(undefined, applicationChangeState("active"));
  const store = mockStore(defaultState);
  const addEventListenerSpy = jest.spyOn(LINKING.Linking, "addEventListener");
  const mockDispatch = jest.fn();
  const mockCurrySubscription = linkingSubscription(mockDispatch, store);

  return {
    addEventListenerSpy,
    mockCurrySubscription,
    mockDispatch
  };
};
