/* eslint-disable functional/immutable-data */
import * as React from "react";
import { IOToast } from "../../../../components/Toast";
import { Body } from "../../../../components/core/typography/Body";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
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
      <LabelSmall weight={"Regular"} color={"bluegrey"}>
        {I18n.t("idpay.onboarding.beforeContinue.text1")}
      </LabelSmall>
      <LabelSmall
        color={"blue"}
        onPress={handleTosLinkPress}
        testID="IDPayOnboardingPrivacyLink"
      >
        {I18n.t("idpay.onboarding.beforeContinue.tosLink")}
      </LabelSmall>
      <LabelSmall weight={"Regular"} color={"bluegrey"}>
        {I18n.t("idpay.onboarding.beforeContinue.text2")}
      </LabelSmall>
      <LabelSmall
        color={"blue"}
        onPress={handlePrivacyLinkPress}
        testID="IDPayOnboardingTOSLink"
      >
        {I18n.t("idpay.onboarding.beforeContinue.privacyLink")}
      </LabelSmall>
    </Body>
  );
};

export { OnboardingPrivacyAdvice };
