import * as LINKING from "react-native";
import configureMockStore from "redux-mock-store";
import * as UTIL_GUARDS from "../../features/authentication/common/store/utils/guards";
import { storeLinkingUrl } from "../../features/linking/actions";
import { resetMessageArchivingAction } from "../../features/messages/store/actions/archiving";
import * as ARCHIVING_SELECTORS from "../../features/messages/store/reducers/archiving";
import * as DEEP_LINKING from "../../features/pn/aar/utils/deepLinking";
import * as UTM_LINK from "../../features/utmLink";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { GlobalState } from "../../store/reducers/types";
import { linkingSubscription } from "../linkingSubscription";
import { initiateAarFlow } from "../../features/pn/aar/store/actions";

describe("linkingSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should add and remove an event listener", () => {
    const { addEventListenerSpy, mockCurrySubscription } = initializeTests();

    const removeMock = jest.fn();
    addEventListenerSpy.mockImplementation(
      () => ({ remove: removeMock } as any)
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
    [true, false].forEach(isAARLink => {
      it(`should handle a URL event when${
        isLoggedIn ? "" : " not"
      } logged in, and the link passed ${
        isAARLink ? "is" : "isn't"
      } a valid AAR link`, () => {
        const { mockDispatch, mockCurrySubscription, addEventListenerSpy } =
          initializeTests();
        const mockNav = jest.fn();
        const testUrl = `https://example.com/${isAARLink}/${isLoggedIn}`;

        jest
          .spyOn(UTIL_GUARDS, "isLoggedIn")
          .mockImplementation(() => isLoggedIn);
        jest
          .spyOn(DEEP_LINKING, "isSendAARLink")
          .mockImplementation(() => isAARLink);

        mockCurrySubscription(jest.fn());

        runEventListenerCallback(addEventListenerSpy, { url: testUrl });

        if (isLoggedIn) {
          // When logged in, we do not store the URL for later processing
          expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: "STORE_LINKING_URL" })
          );

          if (isAARLink) {
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
