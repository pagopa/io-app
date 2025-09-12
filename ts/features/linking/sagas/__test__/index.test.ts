import { testSaga } from "redux-saga-test-plan";
import { handleStoredLinkingUrlIfNeeded } from "..";
import {
  isSendAARLink,
  navigateToSendAarFlow
} from "../../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../../actions";
import { storedLinkingUrlSelector } from "../../reducers";
import { GlobalState } from "../../../../store/reducers/types";

describe("handleStoredLinkingUrlIfNeeded", () => {
  const aarUrl = "https://example.com/aar";
  it("should navigate to the AAR screen and clear the linking url state when there is a valid AAR url returned by the linking selector", () => {
    const state = {} as GlobalState;
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(aarUrl)
      .select(isSendAARLink, aarUrl)
      .next(true)
      .select()
      .next(state)
      .put(clearLinkingUrl())
      .next()
      .call(navigateToSendAarFlow, state, aarUrl)
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
