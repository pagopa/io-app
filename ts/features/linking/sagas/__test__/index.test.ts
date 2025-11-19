import { testSaga } from "redux-saga-test-plan";
import { handleStoredLinkingUrlIfNeeded } from "..";
import { initiateAarFlow } from "../../../pn/aar/store/actions";
import { isSendAARLink } from "../../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../../actions";
import { storedLinkingUrlSelector } from "../../reducers";

describe("handleStoredLinkingUrlIfNeeded", () => {
  const aarUrl = "https://example.com/aar";
  it("should navigate to the AAR screen and clear the linking url state when there is a valid AAR url returned by the linking selector", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(aarUrl)
      .select(isSendAARLink, aarUrl)
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
      .select(isSendAARLink, aarUrl)
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
});
