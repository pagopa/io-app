import * as React from "react";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import ServicesContactComponent from "../profile/components/services/ServicesContactComponent";
import { InfoBox } from "../../components/box/InfoBox";
import { H5 } from "../../components/core/typography/H5";
import { IOColors } from "../../components/core/variables/IOColors";
import I18n from "../../i18n";

const OnboardingServicesPreferenceScreen = (): React.ReactElement => (
  <BaseScreenComponent contextualHelp={emptyContextualHelp}>
    <ServicesContactComponent />
    <InfoBox iconName={"io-profilo"} iconColor={IOColors.bluegrey}>
      <H5 color={"bluegrey"} weight={"Regular"}>
        {I18n.t("profile.main.privacy.shareData.screen.profileSettings")}
      </H5>
    </InfoBox>
  </BaseScreenComponent>
);

export default OnboardingServicesPreferenceScreen;
