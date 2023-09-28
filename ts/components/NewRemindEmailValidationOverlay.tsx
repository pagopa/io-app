/**
 * A component to remind the user to validate his email
 */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
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
  profileLoadRequest,
  startEmailValidation
} from "../store/actions/profile";
import {
  isProfileEmailValidatedSelector,
  profileEmailSelector
} from "../store/reducers/profile";
import { useIODispatch, useIOSelector } from "../store/hooks";
import ROUTES from "../navigation/routes";
import NavigationService from "../navigation/NavigationService";
import { IOStyles } from "./core/variables/IOStyles";
import FooterWithButtons from "./ui/FooterWithButtons";
import { IOToast } from "./Toast";
import { LightModalContextInterface } from "./ui/LightModal";
import TopScreenComponent from "./screens/TopScreenComponent";
import { withLightModalContext } from "./helpers/withLightModalContext";

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

  const reloadProfile = useCallback(
    () => dispatch(profileLoadRequest()),
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
      // if the email is validated the user navigate to the preferences screen
      if (isOnboarding) {
        hideModal();
      } else {
        NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
          screen: ROUTES.INSERT_EMAIL_SCREEN
        });
      }
    } else {
      // send email validation only if it exists
      pipe(
        optionEmail,
        O.map(_ => {
          sendEmailValidation();
          IOToast.show(I18n.t("email.newvalidate.toast"));
          setIsValidateEmailButtonDisabled(true);
          // eslint-disable-next-line functional/immutable-data
          timeout.current = setTimeout(() => {
            setIsValidateEmailButtonDisabled(false);
          }, emailSentTimeout);
        })
      );
    }
  };

  const navigateToInsertEmail = () => {
    NavigationService.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN
    });
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
      clearTimeout(timeout.current);
      clearInterval(polling.current);
    };
  }, [reloadProfile]);

  useEffect(() => {
    if (isEmailValidated) {
      clearInterval(polling.current);
    }
  }, [isEmailValidated]);

  return (
    <TopScreenComponent
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
          <Label
            weight="Regular"
            style={{ textAlign: "center" }}
            testID="subtitle-test"
          >
            {I18n.t(
              isEmailValidated
                ? "email.newvalidemail.subtitle"
                : "email.newvalidate.subtitle",
              { email }
            )}
          </Label>
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
    </TopScreenComponent>
  );
};
export default withLightModalContext(NewRemindEmailValidationOverlay);
