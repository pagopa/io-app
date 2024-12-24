import { Body, IOToast, BodySmall } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";

type OnboardingPrivacyAdviceProps = {
  tosUrl: string;
  privacyUrl: string;
};

const OnboardingPrivacyAdvice = (props: OnboardingPrivacyAdviceProps) => {
  const { tosUrl, privacyUrl } = props;

  const handlePrivacyLinkPress = () =>
    openWebUrl(privacyUrl, () => IOToast.error(I18n.t("global.jserror.title")));

  const handleTosLinkPress = () =>
    openWebUrl(tosUrl, () => IOToast.error(I18n.t("global.jserror.title")));

  return (
    <Body accessibilityRole="link" testID="IDPayOnboardingBeforeContinue">
      <BodySmall weight="Regular" color={"bluegrey"}>
        {I18n.t("idpay.onboarding.beforeContinue.text1")}
      </BodySmall>
      <BodySmall
        asLink
        weight="Semibold"
        onPress={handleTosLinkPress}
        testID="IDPayOnboardingPrivacyLink"
      >
        {I18n.t("idpay.onboarding.beforeContinue.tosLink")}
      </BodySmall>
      <BodySmall weight={"Regular"} color={"bluegrey"}>
        {I18n.t("idpay.onboarding.beforeContinue.text2")}
      </BodySmall>
      <BodySmall
        asLink
        weight="Semibold"
        onPress={handlePrivacyLinkPress}
        testID="IDPayOnboardingTOSLink"
      >
        {I18n.t("idpay.onboarding.beforeContinue.privacyLink")}
      </BodySmall>
    </Body>
  );
};

export { OnboardingPrivacyAdvice };
