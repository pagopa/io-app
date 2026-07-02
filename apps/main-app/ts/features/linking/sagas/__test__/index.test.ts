import { testSaga } from "redux-saga-test-plan";
import { CommonActions } from "@react-navigation/native";
import { handleStoredLinkingUrlIfNeeded } from "..";
import { initiateAarFlow } from "../../../pn/aar/store/actions";
import { isSendAarLink } from "../../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../../actions";
import { storedLinkingUrlSelector } from "../../reducers";
import NavigationService from "../../../../navigation/NavigationService";
import { ITW_ROUTES } from "../../../itwallet/navigation/routes";

describe("handleStoredLinkingUrlIfNeeded", () => {
  const aarUrl = "https://example.com/aar";
  const credentialOfferUrl =
    "openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fissuer.example.com%22%7D";

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

  it("should navigate to the credential offer intro and clear the linking url state when there is a credential offer URL", () => {
    testSaga(handleStoredLinkingUrlIfNeeded)
      .next()
      .select(storedLinkingUrlSelector)
      .next(credentialOfferUrl)
      .select(isSendAarLink, credentialOfferUrl)
      .next(false)
      .put(clearLinkingUrl())
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_OFFER_INTRO,
          params: {
            itwCredentialOfferUri: credentialOfferUrl
          }
        })
      )
      .next()
      .returns(true);
  });
});
