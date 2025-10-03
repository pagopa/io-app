import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { StackActions } from "@react-navigation/native";
import {
  checkShouldDisplaySendEngagementScreen,
  handleNavigateToSendEngagementScreen
} from "../checkShouldDisplaySendEngagementScreen";
import NavigationService from "../../../../../navigation/NavigationService";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import PN_ROUTES from "../../../navigation/routes";
import { hasSendEngagementScreenBeenDismissedSelector } from "../../store/reducers";
import { isPnRemoteEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isPnServiceEnabled } from "../../../reminderBanner/reducer/bannerDismiss";
import { setSecurityAdviceReadyToShow } from "../../../../authentication/fastLogin/store/actions/securityAdviceActions";

describe("checkShouldDisplaySendEngagementScreen saga", () => {
  it("should not navigate when is a first onboarding", () =>
    expectSaga(checkShouldDisplaySendEngagementScreen, true)
      .provide([
        [select(hasSendEngagementScreenBeenDismissedSelector), false],
        [select(isPnRemoteEnabledSelector), true],
        [select(isPnServiceEnabled), false]
      ])
      .put(setSecurityAdviceReadyToShow(true))
      .run()
      .then(result => {
        expect(result.returnValue).toBeUndefined();
        expect(result.effects.call).toBeUndefined();
      }));
  it("should call handleNavigateToSendEngagementScreen when is not a first onboarding", () =>
    expectSaga(checkShouldDisplaySendEngagementScreen, false)
      .provide([
        [select(hasSendEngagementScreenBeenDismissedSelector), false],
        [select(isPnRemoteEnabledSelector), true],
        [select(isPnServiceEnabled), false]
      ])
      .call(handleNavigateToSendEngagementScreen, true, true, true)
      .run()
      .then(result => {
        expect(result.returnValue).toBeUndefined();
        expect(result.effects.put).toBeUndefined();
      }));
  it("should wait for loadServicePreference.success when isPnServiceEnabled is undefined", () =>
    expectSaga(checkShouldDisplaySendEngagementScreen, false)
      .provide([
        [select(hasSendEngagementScreenBeenDismissedSelector), false],
        [select(isPnRemoteEnabledSelector), true],
        [select(isPnServiceEnabled), undefined]
      ])
      .run()
      .then(result => {
        expect(result.returnValue).toBeUndefined();
        expect(result.effects.put).toBeUndefined();
        expect(result.effects.call).toBeUndefined();
        expect(result.effects.fork).not.toBeUndefined();
      }));
  describe("handleNavigateToSendEngagementScreen", () => {
    it("should not navigate when the condition is not met", () =>
      expectSaga(handleNavigateToSendEngagementScreen, true, false, false)
        .put(setSecurityAdviceReadyToShow(true))
        .run()
        .then(result => {
          expect(result.effects.call).toBeUndefined();
        }));
    it("should navigate when is not a first onboarding", () =>
      expectSaga(handleNavigateToSendEngagementScreen, true, true, true, true)
        .call(
          NavigationService.dispatchNavigationAction,
          StackActions.push(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.SEND_ENGAGEMENT_ON_FIRST_APP_OPENING
            }
          })
        )
        .run()
        .then(result => {
          expect(result.effects.put).toBeUndefined();
        }));
  });
});
