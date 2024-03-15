/**
 * A component to remind the user to validate his email
 */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  IOPictogramSizeScale,
  Pictogram,
  VSpacer,
  Body,
  IOStyles,
  H3,
  IOVisualCostants,
  ButtonOutline,
  ButtonSolid,
  ButtonLink,
  ProgressLoader,
  IOToast
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { Route, useRoute } from "@react-navigation/native";
import I18n from "../../i18n";

import {
  acknowledgeOnEmailValidation,
  emailValidationPollingStart,
  emailValidationPollingStop,
  setEmailCheckAtStartupFailure,
  startEmailValidation
} from "../../store/actions/profile";
import {
  isEmailValidatedSelector,
  isProfileFirstOnBoardingSelector,
  profileEmailSelector
} from "../../store/reducers/profile";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { emailValidationSelector } from "../../store/reducers/emailValidation";
import { emailAcknowledged } from "../../store/actions/onboarding";
import ROUTES from "../../navigation/routes";
import { getFlowType } from "../../utils/analytics";
import {
  trackEmailValidation,
  trackEmailValidationSuccess,
  trackEmailValidationSuccessConfirmed
} from "../analytics/emailAnalytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { usePrevious } from "../../utils/hooks/usePrevious";
import {
  CountdownProvider,
  useCountdown
} from "../../components/countdown/CountdownProvider";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { SendEmailValidationScreenProp } from "./EmailValidationSendEmailScreen";

const emailSentTimeout = 60000 as Millisecond; // 60 seconds
const countdownIntervalDuration = 1000 as Millisecond; // 1 second

const EMPTY_EMAIL = "";
const VALIDATION_ILLUSTRATION_WIDTH: IOPictogramSizeScale = 120;

export type RemindEmailValidationProp = {
  isOnboarding?: boolean;
  sendEmailAtFirstRender?: boolean;
};
const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};
const EmailValidationScreen = () => {
  const props =
    useRoute<
      Route<
        "ONBOARDING_READ_EMAIL_SCREEN" | "PROFILE_EMAIL_INSERT_SCREEN",
        SendEmailValidationScreenProp
      >
    >().params;
  const { isOnboarding, sendEmailAtFirstRender } = props;
  const headerHeight = useHeaderHeight();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const optionEmail = useIOSelector(
    profileEmailSelector,
    (l, r) =>
      (O.isNone(l) && O.isNone(r)) ||
      (O.isSome(l) && O.isSome(r) && l.value === r.value)
  );
  const isEmailValidated = useIOSelector(isEmailValidatedSelector);
  const emailValidation = useIOSelector(emailValidationSelector);
  const prevEmailValidation = usePrevious(emailValidation);
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const flow = getFlowType(!!isOnboarding, isFirstOnBoarding);
  const [isValidateEmailButtonDisabled, setIsValidateEmailButtonDisabled] =
    useState(true);
  const email = pipe(
    optionEmail,
    O.getOrElse(() => EMPTY_EMAIL)
  );

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

  useOnFirstRender(() => {
    // polling starts every time the user land on this screen
    startPollingSaga();
    // if the verification email was never sent, we send it
    if (sendEmailAtFirstRender) {
      sendEmailValidation();
    }
  });

  const handleContinue = () => {
    if (isEmailValidated) {
      trackEmailValidationSuccessConfirmed(flow);
      navigation.goBack();
      if (isOnboarding) {
        // if the user is in the onboarding flow and the email il correctly validated,
        // the email validation flow is finished
        acknowledgeEmail();
      } else {
        if (
          O.isSome(emailValidation.emailCheckAtStartupFailed) &&
          emailValidation.emailCheckAtStartupFailed.value
        ) {
          acknowledgeEmail();
          dispatchAcknowledgeOnEmailValidation(O.none);
          dispatch(setEmailCheckAtStartupFailure(O.none));
        } else {
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_DATA
          });
        }
      }
    }
  };

  const handleResendEmail = () => {
    sendEmailValidation();
  };

  const navigateToInsertEmail = () => {
    dispatchAcknowledgeOnEmailValidation(O.none);
    navigation.goBack();
  };

  type CountdownProps = {
    visible: boolean;
    timerElapsed?: () => void;
  };

  const Countdown = (props: CountdownProps) => {
    const { visible } = props;
    const { timerCount, resetTimer, startTimer, isRunning } = useCountdown();

    if (timerCount === 0 && props.timerElapsed) {
      props.timerElapsed();
    }

    if (!visible) {
      if (resetTimer) {
        resetTimer();
      }

      return null;
    } else if (startTimer && isRunning && !isRunning()) {
      startTimer();
    }

    if (visible) {
      return (
        <View style={IOStyles.alignCenter}>
          <VSpacer size={24} />
          <ProgressLoader progress={(timerCount / 60) * 100} />
          <VSpacer size={8} />
          <Body weight="Regular" style={{ textAlign: "center" }} color="black">
            {I18n.t("email.newvalidate.countdowntext")}{" "}
            <Body weight="SemiBold" color="black">
              {timerCount}s
            </Body>
          </Body>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    if (
      prevEmailValidation !== undefined &&
      pot.isLoading(prevEmailValidation.sendEmailValidationRequest)
    ) {
      // send validation email KO
      if (pot.isError(emailValidation.sendEmailValidationRequest)) {
        IOToast.error(I18n.t("global.actions.retry"));
        setIsValidateEmailButtonDisabled(false);
        return;
      }
      // send validation email OK
      if (pot.isSome(emailValidation.sendEmailValidationRequest)) {
        IOToast.show(I18n.t("email.newvalidate.toast"));
        setIsValidateEmailButtonDisabled(true);
      }
    }
  }, [emailValidation.sendEmailValidationRequest, prevEmailValidation]);

  useEffect(() => {
    if (isEmailValidated) {
      // if the user has validated the email the polling can stop
      stopPollingSaga();
      trackEmailValidationSuccess(flow);
    } else {
      trackEmailValidation(flow);
    }

    return () => {
      // if the user change screen the polling can stop
      stopPollingSaga();
    };
  }, [flow, isEmailValidated, stopPollingSaga]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown,
    canGoBack: false
  });

  return (
    <SafeAreaView style={[styles.container, { paddingTop: -headerHeight }]}>
      <ScrollView
        centerContent={true}
        contentContainerStyle={[
          styles.wrapper,
          /* Android fallback because `centerContent` is only an iOS property */
          Platform.OS === "android" && styles.wrapper_android
        ]}
      >
        <View style={IOStyles.selfCenter}>
          <Pictogram
            name={isEmailValidated ? "emailDotCheck" : "emailDotNotif"}
            size={VALIDATION_ILLUSTRATION_WIDTH}
          />
        </View>
        <VSpacer size={24} />
        <View style={IOStyles.alignCenter}>
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
            <Body weight="SemiBold">{email}</Body>
          </Body>
        </View>
        {!isEmailValidated && (
          <View style={IOStyles.selfCenter}>
            <VSpacer size={16} />
            <ButtonLink
              label={I18n.t("email.newvalidate.link")}
              accessibilityLabel={I18n.t("email.newvalidate.link")}
              onPress={navigateToInsertEmail}
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
            timerElapsed={() => {
              setIsValidateEmailButtonDisabled(false);
            }}
            visible={isValidateEmailButtonDisabled && !isEmailValidated}
          />
        </CountdownProvider>
        {isEmailValidated ? (
          <View style={IOStyles.selfCenter}>
            <ButtonSolid
              label={I18n.t("global.buttons.continue")}
              accessibilityLabel={I18n.t("global.buttons.continue")}
              onPress={handleContinue}
            />
          </View>
        ) : (
          !isValidateEmailButtonDisabled && (
            <View style={IOStyles.selfCenter}>
              <ButtonOutline
                label={I18n.t("email.newvalidate.buttonlabelsentagain")}
                accessibilityLabel={I18n.t(
                  "email.newvalidate.buttonlabelsentagain"
                )}
                onPress={handleResendEmail}
              />
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginHorizontal: IOVisualCostants.appMarginDefault
  },
  wrapper: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    alignContent: "center"
  },
  wrapper_android: {
    flexGrow: 1,
    justifyContent: "center"
  }
});

export default EmailValidationScreen;
