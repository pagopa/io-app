/**
 * A screen to display the email address used by IO
 * The _isFromProfileSection_ navigation parameter let the screen being adapted
 * if:
 * - it is displayed during the user onboarding
 * - it is displayed after the onboarding (navigation from the profile section)
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { StackActions } from "@react-navigation/native";
import * as React from "react";
import { Alert } from "react-native";
import EmailReadComponent from "../../components/EmailReadComponent";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { TwoButtonsInlineHalf } from "../../components/ui/BlockButtons";
import { useValidatedEmailModal } from "../../hooks/useValidateEmailModal";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import ROUTES from "../../navigation/routes";
import {
  abortOnboarding,
  emailAcknowledged
} from "../../store/actions/onboarding";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { userMetadataSelector } from "../../store/reducers/userMetadata";

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_READ_EMAIL_SCREEN"
>;

const OnboardingEmailReadScreen = (props: Props) => {
  useValidatedEmailModal(true);
  const dispatch = useIODispatch();
  const potUserMetadata = useIOSelector(userMetadataSelector);

  const isLoading = pot.isLoading(potUserMetadata);

  const acknowledgeEmail = () => dispatch(emailAcknowledged());
  const askAbortOnboarding = () => dispatch(abortOnboarding());

  const handleGoBack = () => {
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: askAbortOnboarding
        }
      ]
    );
  };

  const footerProps: TwoButtonsInlineHalf = {
    type: "TwoButtonsInlineHalf",
    leftButton: {
      block: true,
      bordered: true,
      title: I18n.t("email.edit.cta"),
      onPress: () => {
        props.navigation.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN
        });
      }
    },
    rightButton: {
      block: true,
      primary: true,
      title: I18n.t("global.buttons.continue"),
      onPress: acknowledgeEmail
    }
  };

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <EmailReadComponent
        handleGoBack={handleGoBack}
        footerProps={footerProps}
      />
    </LoadingSpinnerOverlay>
  );
};

export default OnboardingEmailReadScreen;
