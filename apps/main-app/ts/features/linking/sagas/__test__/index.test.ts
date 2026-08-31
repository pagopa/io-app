import { testSaga } from "redux-saga-test-plan";

import { handleStoredLinkingUrlIfNeeded } from "..";
import { waitForMainNavigator } from "../../../../navigation/saga/navigation";
import { handleItwStoredDeepLink } from "../../../itwallet/common/saga/linking";
import { initiateAarFlow } from "../../../pn/aar/store/actions";
import { isSendAarLink } from "../../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../../actions";
import { storedLinkingUrlSelector } from "../../reducers";

describe("handleStoredLinkingUrlIfNeeded", () => {
  const aarUrl = "https://example.com/aar";
  const itwDiscoveryUrl = "https://continua.io.pagopa.it/itw/discovery/info";
  const itwDiscoveryDeepLink = {
    path: "itw/discovery/info"
  };

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

  it("should hand off a queued ITW deeplink after the main navigator is ready", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(itwDiscoveryUrl)
      .select(isSendAarLink, itwDiscoveryUrl)
      .next(false)
      .call(waitForMainNavigator)
      .next()
      .call(handleItwStoredDeepLink, itwDiscoveryDeepLink)
      .next(true)
      .put(clearLinkingUrl())
      .next()
      .returns(true);
  });

  it("should preserve a queued ITW deeplink when navigation cannot be created", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(itwDiscoveryUrl)
      .select(isSendAarLink, itwDiscoveryUrl)
      .next(false)
      .call(waitForMainNavigator)
      .next()
      .call(handleItwStoredDeepLink, itwDiscoveryDeepLink)
      .next(false)
      .isDone();
  });
});
