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
import { ButtonLink, Label } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
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
import { VSpacer } from "./core/spacer/Spacer";
import { IOStyles } from "./core/variables/IOStyles";
import FooterWithButtons from "./ui/FooterWithButtons";
import { Pictogram, IOPictogramSizeScale } from "./core/pictograms/Pictogram";
import { IOToast } from "./Toast";
import BaseScreenComponent from "./screens/BaseScreenComponent";

const emailSentTimeout = 10000 as Millisecond; // 10 seconds
const profilePolling = 5000 as Millisecond; // 5 seconds

const EMPTY_EMAIL = "";
const VALIDATION_ILLUSTRATION_WIDTH: IOPictogramSizeScale = 80;

const NewRemindEmailValidationOverlay = () => {
  const dispatch = useIODispatch();
  const optionEmail = useIOSelector(profileEmailSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
  const [isVerifyButtonDisabled, setIsVerifyButtonDisabled] = useState(false);
  const timeout = useRef<number | undefined>();
  const navigation = useNavigation();

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

  // function to locate the title of the button. If the email is validated and if it is not, whether the confirmation email was sent or not
  const controlButtonTitle = () => {
    if (isEmailValidated) {
      return I18n.t("global.buttons.continue");
    } else {
      if (isVerifyButtonDisabled) {
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
      return isVerifyButtonDisabled;
    }
  };

  const handleSendEmailValidationButton = () => {
    if (isEmailValidated) {
      // if email is validated the user navigate tu prefereces screen
      navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
        screen: ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS
      });
    } else {
      // send email validation only if it exists
      pipe(
        optionEmail,
        O.map(_ => {
          sendEmailValidation();
        })
      );

      IOToast.show(I18n.t("email.newvalidate.toast"));
      setIsVerifyButtonDisabled(true);
      // eslint-disable-next-line functional/immutable-data
      timeout.current = setTimeout(() => {
        setIsVerifyButtonDisabled(false);
      }, emailSentTimeout);
    }
  };

  const navigateToInsertEmail = () => {
    navigation.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN
    });
  };

  const renderFooter = () => (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={{
        block: true,
        bordered: !isEmailValidated,
        disabled: isButtonDisabled(),
        onPress: handleSendEmailValidationButton,
        title: controlButtonTitle()
      }}
    />
  );

  useEffect(() => {
    // use polling to get the profile info, to validate if the email is valid or not
    const polling = setInterval(() => reloadProfile(), profilePolling);
    return () => {
      clearTimeout(timeout.current);
      clearInterval(polling);
    };
  }, [reloadProfile]);

  return (
    <BaseScreenComponent goBack={false}>
      <SafeAreaView style={IOStyles.flex}>
        <VSpacer size={40} />
        <VSpacer size={40} />
        <Content bounces={false}>
          <View style={IOStyles.selfCenter}>
            <Pictogram
              name={"emailValidation"}
              size={VALIDATION_ILLUSTRATION_WIDTH}
              color="aqua"
            />
          </View>
          <VSpacer size={16} />
          <View style={IOStyles.alignCenter}>
            <Label weight="Bold" color="bluegrey">
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
            color="bluegrey"
            style={{ textAlign: "center" }}
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
              <ButtonLink
                accessibilityLabel="Tap to trigger test alert"
                label={I18n.t("email.newvalidate.link")}
                onPress={navigateToInsertEmail}
              />
              <VSpacer size={8} />
            </View>
          )}
        </Content>
        {renderFooter()}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default NewRemindEmailValidationOverlay;
