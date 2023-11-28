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
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../i18n";

import {
  acknowledgeOnEmailValidation,
  profileLoadRequest,
  startEmailValidation
} from "../store/actions/profile";
import {
  isProfileEmailValidatedSelector,
  profileEmailSelector
} from "../store/reducers/profile";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { emailValidationSelector } from "../store/reducers/emailValidation";
import { emailAcknowledged } from "../store/actions/onboarding";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
import { IOStyles } from "./core/variables/IOStyles";
import FooterWithButtons from "./ui/FooterWithButtons";
import { IOToast } from "./Toast";
import { LightModalContextInterface } from "./ui/LightModal";
import { withLightModalContext } from "./helpers/withLightModalContext";
import BaseScreenComponent from "./screens/BaseScreenComponent";

const emailSentTimeout = 10000 as Millisecond; // 10 seconds
const profilePolling = 5000 as Millisecond; // 5 seconds

const EMPTY_EMAIL = "";
const VALIDATION_ILLUSTRATION_WIDTH: IOPictogramSizeScale = 80;

type OwnProp = {
  isOnboarding?: boolean;
};

type Props = LightModalContextInterface & OwnProp;

const NewRemindEmailValidationOverlay = (props: Props) => {
  const { isOnboarding, hideModal } = props;
  const dispatch = useIODispatch();
  const optionEmail = useIOSelector(profileEmailSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
  const emailValidation = useIOSelector(emailValidationSelector);

  const [isValidateEmailButtonDisabled, setIsValidateEmailButtonDisabled] =
    useState(false);
  const timeout = useRef<number | undefined>();
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

  // function to localize the title of the button. If the email is validated and if it is not, whether the confirmation email was sent or not
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
      if (isOnboarding) {
        // if the user is in the onboarding flow and the email il correctly validated,
        // the email validation flow is finished
        acknowledgeEmail();
        hideModal();
      } else {
        hideModal();
        NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
          screen: ROUTES.PROFILE_DATA
        });
      }
    } else {
      // send email validation only if it exists
      pipe(
        optionEmail,
        O.map(_ => {
          sendEmailValidation();
        })
      );
    }
  };

  const navigateToInsertEmail = () => {
    dispatchAcknowledgeOnEmailValidation(O.none);
    hideModal();
  };

  const renderFooter = () => (
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
  );

  useEffect(() => {
    // use polling to get the profile info, to check if the email is valid or not
    // eslint-disable-next-line functional/immutable-data
    polling.current = setInterval(() => reloadProfile(), profilePolling);
    return () => {
      hideModal();
      clearTimeout(timeout.current);
      clearInterval(polling.current);
    };
  }, [hideModal, reloadProfile]);

  useEffect(() => {
    // send validation email KO
    if (pot.isError(emailValidation.sendEmailValidationRequest)) {
      IOToast.error(I18n.t("global.actions.retry"));
      // send validation email OK
    } else if (pot.isSome(emailValidation.sendEmailValidationRequest)) {
      IOToast.show(I18n.t("email.newvalidate.toast"));
      setIsValidateEmailButtonDisabled(true);
      // eslint-disable-next-line functional/immutable-data
      timeout.current = setTimeout(() => {
        setIsValidateEmailButtonDisabled(false);
      }, emailSentTimeout);
    }
  }, [emailValidation.sendEmailValidationRequest]);

  useEffect(() => {
    if (isEmailValidated) {
      clearInterval(polling.current);
    }
  }, [isEmailValidated]);

  return (
    <BaseScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
      contextualHelpMarkdown={{
        title: "email.validate.title",
        body: "email.validate.help"
      }}
      headerTitle={I18n.t("email.newinsert.header")}
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
        {renderFooter()}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default withLightModalContext(NewRemindEmailValidationOverlay);
