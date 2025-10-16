import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { StackActions } from "@react-navigation/native";
import {
  checkShouldDisplaySendEngagementScreen,
  testable
} from "../checkShouldDisplaySendEngagementScreen";
import NavigationService from "../../../../../navigation/NavigationService";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import PN_ROUTES from "../../../navigation/routes";
import { hasSendEngagementScreenBeenDismissedSelector } from "../../store/reducers";
import { isPnRemoteEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isPnServiceEnabled } from "../../../reminderBanner/reducer/bannerDismiss";
import { setSecurityAdviceReadyToShow } from "../../../../authentication/fastLogin/store/actions/securityAdviceActions";

const { handleNavigateToSendEngagementScreen } = testable!;

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
      .call(handleNavigateToSendEngagementScreen, false, true, false)
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
    it("should navigate when all the conditions are met", () =>
      expectSaga(handleNavigateToSendEngagementScreen, false, true, false)
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
    it("should not navigate when the SEND engagement screen has been dismissed", () =>
      expectSaga(handleNavigateToSendEngagementScreen, true, true, false)
        .put(setSecurityAdviceReadyToShow(true))
        .run()
        .then(result => {
          expect(result.effects.call).toBeUndefined();
        }));
    it("should not navigate when the SEND service is enabled", () =>
      expectSaga(handleNavigateToSendEngagementScreen, false, true, true)
        .put(setSecurityAdviceReadyToShow(true))
        .run()
        .then(result => {
          expect(result.effects.call).toBeUndefined();
        }));
    it("should not navigate when the SEND remote FF is not enabled", () =>
      expectSaga(handleNavigateToSendEngagementScreen, false, false, false)
        .put(setSecurityAdviceReadyToShow(true))
        .run()
        .then(result => {
          expect(result.effects.call).toBeUndefined();
        }));
  });
});
