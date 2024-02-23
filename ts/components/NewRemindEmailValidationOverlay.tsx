/**
 * A component to remind the user to validate his email
 */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, SafeAreaView } from "react-native";
import {
  LabelLink,
  IOPictogramSizeScale,
  Label,
  Pictogram,
  VSpacer,
  Body
} from "@pagopa/io-app-design-system";
import I18n from "../i18n";

import {
  acknowledgeOnEmailValidation,
  profileLoadRequest,
  setEmailCheckAtStartupFailure,
  startEmailValidation
} from "../store/actions/profile";
import {
  isProfileEmailValidatedSelector,
  isProfileFirstOnBoardingSelector,
  profileEmailSelector
} from "../store/reducers/profile";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { emailValidationSelector } from "../store/reducers/emailValidation";
import { emailAcknowledged } from "../store/actions/onboarding";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
import { getFlowType } from "../utils/analytics";
import {
  trackEmailValidation,
  trackEmailValidationSuccess,
  trackEmailValidationSuccessConfirmed
} from "../screens/analytics/emailAnalytics";
import { useOnFirstRender } from "../utils/hooks/useOnFirstRender";
import { usePrevious } from "../utils/hooks/usePrevious";
import { IOStyles } from "./core/variables/IOStyles";
import FooterWithButtons from "./ui/FooterWithButtons";
import { IOToast } from "./Toast";
import { LightModalContextInterface } from "./ui/LightModal";
import { withLightModalContext } from "./helpers/withLightModalContext";
import BaseScreenComponent from "./screens/BaseScreenComponent";
import { CountdownProvider, useCountdown } from "./countdown/CountdownProvider";

const emailSentTimeout = 60000 as Millisecond; // 60 seconds
const profilePolling = 5000 as Millisecond; // 5 seconds
const countdownIntervalDuration = 1000 as Millisecond; // 1 second

const EMPTY_EMAIL = "";
const VALIDATION_ILLUSTRATION_WIDTH: IOPictogramSizeScale = 80;

type OwnProp = {
  isOnboarding?: boolean;
  sendEmailAtFirstRender?: boolean;
};

type Props = LightModalContextInterface & OwnProp;

const NewRemindEmailValidationOverlayComponent = (props: Props) => {
  const { isOnboarding, hideModal, sendEmailAtFirstRender } = props;
  const dispatch = useIODispatch();
  const optionEmail = useIOSelector(profileEmailSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
  const emailValidation = useIOSelector(emailValidationSelector);
  const prevEmailValidation = usePrevious(emailValidation);
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const flow = getFlowType(!!isOnboarding, isFirstOnBoarding);
  const [isValidateEmailButtonDisabled, setIsValidateEmailButtonDisabled] =
    useState(true);
  const polling = useRef<number | undefined>();
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

  const reloadProfile = useCallback(
    () => dispatch(profileLoadRequest()),
    [dispatch]
  );

  const dispatchAcknowledgeOnEmailValidation = useCallback(
    (maybeAcknowledged: O.Option<boolean>) =>
      dispatch(acknowledgeOnEmailValidation(maybeAcknowledged)),
    [dispatch]
  );

  useOnFirstRender(() => {
    // if the verification email was never sent, we send it
    if (sendEmailAtFirstRender) {
      sendEmailValidation();
    }
  });

  // function to localize the title of the button.
  // If the email is validated and if it is not,
  // whether the confirmation email was sent or not
  const buttonTitle = () => {
    if (isEmailValidated) {
      return I18n.t("global.buttons.continue");
    } else {
      if (isValidateEmailButtonDisabled) {
        return I18n.t("email.newvalidate.buttonlabelsent");
      } else {
        return I18n.t("email.newvalidate.buttonlabelsentagain");
      }
    }
  };

  // this function contol if the button is disabled. It is disabled if the email is sent and the timeout is active
  const isButtonDisabled = () => {
    if (isEmailValidated) {
      return false;
    } else {
      return isValidateEmailButtonDisabled;
    }
  };

  const handleSendEmailValidationButton = () => {
    if (isEmailValidated) {
      trackEmailValidationSuccessConfirmed(flow);
      hideModal();
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
          NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_DATA
          });
        }
      }
    } else {
      // resend the validation email
      sendEmailValidation();
    }
  };

  const navigateToInsertEmail = () => {
    dispatchAcknowledgeOnEmailValidation(O.none);
    hideModal();
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
          <Body>
            <Label weight="Regular" style={{ textAlign: "center" }}>
              {I18n.t("email.newvalidate.countdowntext")}{" "}
            </Label>
            <Label weight="SemiBold" style={{ textAlign: "center" }}>
              {timerCount}s
            </Label>
          </Body>
        </View>
      );
    }
    return null;
  };

  const Footer = () => (
    <>
      <Countdown
        timerElapsed={() => {
          setIsValidateEmailButtonDisabled(false);
        }}
        visible={isValidateEmailButtonDisabled && !isEmailValidated}
      />
      <VSpacer size={16} />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={{
          testID: "button-test",
          block: true,
          bordered: !isEmailValidated,
          disabled: isButtonDisabled(),
          onPress: handleSendEmailValidationButton,
          title: buttonTitle()
        }}
      />
    </>
  );

  useEffect(() => {
    // use polling to get the profile info, to check if the email is valid or not
    // eslint-disable-next-line functional/immutable-data
    polling.current = setInterval(() => reloadProfile(), profilePolling);
    // at the unmount of the page clear all timeout and interval
    return () => {
      hideModal();
      clearInterval(polling.current);
    };
  }, [hideModal, reloadProfile]);

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
      clearInterval(polling.current);
      trackEmailValidationSuccess(flow);
    } else {
      trackEmailValidation(flow);
    }
  }, [flow, isEmailValidated]);

  return (
    <BaseScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
    >
      <SafeAreaView style={IOStyles.flex}>
        <VSpacer size={40} />
        <VSpacer size={40} />
        <Content bounces={false} testID="container-test">
          <View style={IOStyles.selfCenter}>
            <Pictogram
              name={"emailValidation"}
              size={VALIDATION_ILLUSTRATION_WIDTH}
              color="aqua"
            />
          </View>
          <VSpacer size={16} />
          <View style={IOStyles.alignCenter}>
            <Label weight="Bold" testID="title-test">
              {I18n.t(
                isEmailValidated
                  ? "email.newvalidemail.title"
                  : "email.newvalidate.title"
              )}
            </Label>
          </View>
          <VSpacer size={16} />
          <View>
            <Label
              weight="Regular"
              style={{ textAlign: "center" }}
              testID="subtitle-test"
            >
              {I18n.t(
                isEmailValidated
                  ? "email.newvalidemail.subtitle"
                  : "email.newvalidate.subtitle"
              )}
            </Label>
            <Label
              weight="SemiBold"
              style={{ textAlign: "center" }}
              testID="subtitle-test"
            >
              {email}.
            </Label>
          </View>
          {!isEmailValidated && (
            <View style={IOStyles.selfCenter}>
              <VSpacer size={16} />
              <LabelLink onPress={navigateToInsertEmail} testID="link-test">
                {I18n.t("email.newvalidate.link")}
              </LabelLink>
              <VSpacer size={8} />
            </View>
          )}
        </Content>
        <Footer />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const NewRemindEmailValidationOverlay = (props: Props) => (
  <CountdownProvider
    timerTiming={emailSentTimeout / 1000}
    intervalDuration={countdownIntervalDuration}
  >
    <NewRemindEmailValidationOverlayComponent {...props} />
  </CountdownProvider>
);

export default withLightModalContext(NewRemindEmailValidationOverlay);
