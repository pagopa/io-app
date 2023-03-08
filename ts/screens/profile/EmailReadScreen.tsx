/**
 * A screen to display the email address used by IO
 * The _isFromProfileSection_ navigation parameter let the screen being adapted
 * if:
 * - it is displayed during the user onboarding
 * - it is displayed after the onboarding (navigation from the profile section)
 */
import * as React from "react";
import EmailReadScreenComponent from "../../components/EmailReadScreenComponent";
import { SingleButton } from "../../components/ui/BlockButtons";
import { useValidatedEmailModal } from "../../hooks/useValidateEmailModal";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import { navigateToEmailInsertScreen } from "../../store/actions/navigation";

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_READ_EMAIL_SCREEN"
>;

const EmailReadScreen = (props: Props) => {
  useValidatedEmailModal();
  const handleGoBack = () => {
    props.navigation.goBack();
  };

  const footerProps: SingleButton = {
    type: "SingleButton",
    leftButton: {
      bordered: true,
      title: I18n.t("email.edit.cta"),
      // TODO replace with new insert screen
      onPress: navigateToEmailInsertScreen
    }
  };

  return (
    <EmailReadScreenComponent
      handleGoBack={handleGoBack}
      footerProps={footerProps}
    />
  );
};

export default EmailReadScreen;
