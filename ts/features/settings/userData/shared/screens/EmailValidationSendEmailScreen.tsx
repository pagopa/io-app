/**
 * A component to remind the user to validate his email
 */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { useRef, useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, AppState } from "react-native";
import {
  IOPictogramSizeScale,
  Pictogram,
  VSpacer,
  Body,
  H3,
  IOToast,
  ContentWrapper,
  IOButton
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { Route, useFocusEffect, useRoute } from "@react-navigation/native";
import _ from "lodash";
import I18n from "i18next";

import {
  acknowledgeOnEmailValidation,
  emailValidationPollingStart,
  emailValidationPollingStop,
  setEmailCheckAtStartupFailure,
  startEmailValidation
} from "../../../common/store/actions";
import {
  isEmailValidatedSelector,
  isProfileFirstOnBoardingSelector,
  profileEmailSelector
} from "../../../common/store/selectors";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { emailValidationSelector } from "../../../../mailCheck/store/selectors/emailValidation";
import { emailAcknowledged } from "../../../../onboarding/store/actions";
import { getFlowType } from "../../../../../utils/analytics";
import {
  trackEmailValidation,
  trackEmailValidationSuccess,
  trackEmailValidationSuccessConfirmed,
  trackResendValidationEmail
} from "../../../../mailCheck/analytics";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { usePrevious } from "../../../../../utils/hooks/usePrevious";
import { CountdownProvider } from "../../../../../components/countdown/CountdownProvider";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { FCI_ROUTES } from "../../../../fci/navigation/routes";
import ROUTES from "../../../../../navigation/routes";
import SectionStatusComponent from "../../../../../components/SectionStatus";
import Countdown from "../../components/CountdownComponent";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

const emailSentTimeout = 60000 as Millisecond; // 60 seconds
const countdownIntervalDuration = 1000 as Millisecond; // 1 second

const EMPTY_EMAIL = "";
const VALIDATION_ILLUSTRATION_WIDTH: IOPictogramSizeScale = 120;

export type SendEmailValidationScreenProp = {
  isOnboarding?: boolean;
  sendEmailAtFirstRender?: boolean;
  isFciEditEmailFlow?: boolean;
  isEditingEmailMode?: boolean;
};

const EmailValidationSendEmailScreen = () => {
  const props =
    useRoute<
      Route<
        "ONBOARDING_EMAIL_VERIFICATION_SCREEN" | "EMAIL_VERIFICATION_SCREEN",
        SendEmailValidationScreenProp
      >
    >().params;
  const { isOnboarding, sendEmailAtFirstRender, isFciEditEmailFlow } = props;
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const optionEmail = useIOSelector(profileEmailSelector, _.isEqual);
  const isEmailValidated = useIOSelector(isEmailValidatedSelector);
  const emailValidation = useIOSelector(emailValidationSelector, _.isEqual);
  const prevEmailValidation = usePrevious(emailValidation);
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const flow = getFlowType(!!isOnboarding, isFirstOnBoarding);
  const [showCountdown, setShowCountdown] = useState(true);
  const email = pipe(
    optionEmail,
    O.getOrElse(() => EMPTY_EMAIL)
  );
  const accessibilityFirstFocuseViewRef = useRef<View>(null);

  const sendEmailValidation = useCallback(
    () => dispatch(startEmailValidation.request()),
    [dispatch]
  );

  const acknowledgeEmail = useCallback(
    () => dispatch(emailAcknowledged()),
    [dispatch]
  );

  const startPollingSaga = useCallback(
    () => dispatch(emailValidationPollingStart()),
    [dispatch]
  );
  const stopPollingSaga = useCallback(
    () => dispatch(emailValidationPollingStop()),
    [dispatch]
  );

  const dispatchAcknowledgeOnEmailValidation = useCallback(
    (maybeAcknowledged: O.Option<boolean>) =>
      dispatch(acknowledgeOnEmailValidation(maybeAcknowledged)),
    [dispatch]
  );

  const dispatchSetEmailCheckAtStartupFailure = useCallback(
    (maybeFailed: O.Option<boolean>) =>
      dispatch(setEmailCheckAtStartupFailure(maybeFailed)),
    [dispatch]
  );

  useFocusEffect(() => setAccessibilityFocus(accessibilityFirstFocuseViewRef));

  useOnFirstRender(() => {
    // polling starts every time the user land on this screen
    startPollingSaga();
    // if the verification email was never sent, we send it
    if (sendEmailAtFirstRender) {
      sendEmailValidation();
    }
  });

  const handleContinue = useCallback(() => {
    if (isEmailValidated) {
      trackEmailValidationSuccessConfirmed(flow);
      if (isOnboarding || isFirstOnBoarding) {
        acknowledgeEmail();
        if (
          O.isSome(emailValidation.emailCheckAtStartupFailed) &&
          emailValidation.emailCheckAtStartupFailed.value
        ) {
          dispatchAcknowledgeOnEmailValidation(O.none);
          dispatchSetEmailCheckAtStartupFailure(O.none);
          // if the user is in the onboarding flow and the email is correctly validated,
          // the email validation flow is finished
        }
      } else {
        if (isFciEditEmailFlow) {
          navigation.navigate(FCI_ROUTES.MAIN, {
            screen: FCI_ROUTES.USER_DATA_SHARE
          });
        } else {
          navigation.popToTop();
        }
      }
    }
  }, [
    acknowledgeEmail,
    dispatchAcknowledgeOnEmailValidation,
    dispatchSetEmailCheckAtStartupFailure,
    emailValidation.emailCheckAtStartupFailed,
    flow,
    isEmailValidated,
    isFciEditEmailFlow,
    isFirstOnBoarding,
    isOnboarding,
    navigation
  ]);

  const handleResendEmail = useCallback(() => {
    trackResendValidationEmail(flow);
    sendEmailValidation();
  }, [flow, sendEmailValidation]);

  const navigateBackToInsertEmail = useCallback(() => {
    dispatchAcknowledgeOnEmailValidation(O.none);
    if (isOnboarding) {
      navigation.navigate(ROUTES.ONBOARDING, {
        screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
        params: {
          isOnboarding,
          isFciEditEmailFlow,
          isEditingPreviouslyInsertedEmailMode: true
        }
      });
    } else {
      navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
        screen: SETTINGS_ROUTES.INSERT_EMAIL_SCREEN,
        params: {
          isOnboarding: false,
          isFciEditEmailFlow,
          isEditingPreviouslyInsertedEmailMode: true
        }
      });
    }
  }, [
    dispatchAcknowledgeOnEmailValidation,
    isFciEditEmailFlow,
    isOnboarding,
    navigation
  ]);

  // manage AppState to pause/resume polling when app goes to background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (nextAppState === "background") {
        stopPollingSaga();
      } else if (nextAppState === "active" && !isEmailValidated) {
        startPollingSaga();
      }
    });

    // Cleanup: remove event listener when component unmounts
    return () => {
      subscription?.remove();
    };
  }, [isEmailValidated, startPollingSaga, stopPollingSaga]);

  useEffect(() => {
    if (
      prevEmailValidation &&
      pot.isLoading(prevEmailValidation.sendEmailValidationRequest)
    ) {
      // send validation email KO
      if (pot.isError(emailValidation.sendEmailValidationRequest)) {
        IOToast.error(I18n.t("global.actions.retry"));
        setShowCountdown(false);
        stopPollingSaga();
      }
      // send validation email OK
      if (pot.isSome(emailValidation.sendEmailValidationRequest)) {
        IOToast.success(I18n.t("email.newvalidate.toast"));
        setShowCountdown(true);
      }
    }
  }, [
    emailValidation.sendEmailValidationRequest,
    prevEmailValidation,
    stopPollingSaga
  ]);

  useEffect(() => {
    if (isEmailValidated) {
      setShowCountdown(false);
      // if the user has validated the email the polling can stop
      trackEmailValidationSuccess(flow);
    } else {
      trackEmailValidation(flow);
    }

    return () => {
      // if the user change screen the polling can stop
      if (!isEmailValidated) {
        stopPollingSaga();
      }
    };
  }, [flow, isEmailValidated, stopPollingSaga]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView centerContent={true} contentContainerStyle={[styles.wrapper]}>
        <SectionStatusComponent sectionKey={"email_validation"} />
        <ContentWrapper>
          <View style={{ alignSelf: "center" }}>
            <Pictogram
              name={isEmailValidated ? "emailDotCheck" : "emailDotNotif"}
              size={VALIDATION_ILLUSTRATION_WIDTH}
            />
          </View>
          <VSpacer size={24} />
          <View
            style={{ alignItems: "center" }}
            accessible={true}
            ref={accessibilityFirstFocuseViewRef}
          >
            <H3 testID="title-test">
              {I18n.t(
                isEmailValidated
                  ? "email.newvalidemail.title"
                  : "email.newvalidate.title"
              )}
            </H3>
          </View>
          <VSpacer size={16} />
          <View style={{ display: "flex", flexDirection: "column" }}>
            <Body
              weight="Regular"
              style={{ textAlign: "center" }}
              testID="subtitle-test"
            >
              {I18n.t(
                isEmailValidated
                  ? "email.newvalidemail.subtitle"
                  : "email.newvalidate.subtitle"
              )}{" "}
              <Body weight="Semibold">{email}</Body>
            </Body>
          </View>
          <VSpacer size={24} />
          {!isEmailValidated && (
            <View style={{ alignSelf: "center" }}>
              <IOButton
                variant="link"
                label={I18n.t("email.newvalidate.link")}
                onPress={navigateBackToInsertEmail}
                testID="link-test"
              />
              <VSpacer size={24} />
            </View>
          )}
          <CountdownProvider
            timerTiming={emailSentTimeout / 1000}
            intervalDuration={countdownIntervalDuration}
          >
            <Countdown
              onContdownCompleted={() => {
                setShowCountdown(false);
              }}
              visible={showCountdown && !isEmailValidated}
            />
          </CountdownProvider>
          {isEmailValidated ? (
            <View style={{ alignSelf: "center" }}>
              <IOButton
                variant="solid"
                label={I18n.t("global.buttons.continue")}
                onPress={handleContinue}
              />
            </View>
          ) : (
            !showCountdown && (
              <View style={{ alignSelf: "center" }}>
                <IOButton
                  variant="outline"
                  label={I18n.t("email.newvalidate.buttonlabelsentagain")}
                  onPress={handleResendEmail}
                />
              </View>
            )
          )}
        </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  wrapper: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "center",
    alignContent: "center"
  }
});

export default EmailValidationSendEmailScreen;
