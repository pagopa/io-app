import { testSaga } from "redux-saga-test-plan";
import { handleStoredLinkingUrlIfNeeded } from "..";
import { trackIOOpenedFromUniversalAppLink } from "../../analytics";
import { initiateAarFlow } from "../../../pn/aar/store/actions";
import { isSendAarLink } from "../../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../../actions";
import { storedLinkingUrlSelector } from "../../reducers";

jest.mock("../../analytics", () => ({
  trackIOOpenedFromUniversalAppLink: jest.fn()
}));

describe("handleStoredLinkingUrlIfNeeded", () => {
  const aarUrl = "https://example.com/aar";

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should navigate to the AAR screen and clear the linking url state when there is a valid AAR url returned by the linking selector", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(aarUrl)
      .select(isSendAarLink, aarUrl)
      .next(true)
      .put(clearLinkingUrl())
      .next()
      .put(initiateAarFlow({ aarUrl }))
      .next()
      .isDone();
  });
  it("should not do any navigation or clear the linking url state when there is an unrecognized url stored in the linking selector", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(aarUrl)
      .select(isSendAarLink, aarUrl)
      .next(false)
      .isDone();
  });
  it("should do nothing if no linking url is stored", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(undefined)
      .isDone();
  });
  it("should call trackIOOpenedFromUniversalAppLink with the stored linking url", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(aarUrl)
      .select(isSendAarLink, aarUrl);

    expect(trackIOOpenedFromUniversalAppLink).toHaveBeenCalledWith(aarUrl);
    expect(trackIOOpenedFromUniversalAppLink).toHaveBeenCalledTimes(1);
  });
  it("should not call trackIOOpenedFromUniversalAppLink when no linking url is stored", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(undefined)
      .isDone();

    expect(trackIOOpenedFromUniversalAppLink).not.toHaveBeenCalled();
  });
});
