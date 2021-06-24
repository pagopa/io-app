import * as React from "react";
import { connect } from "react-redux";
import { SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import ServicesContactComponent from "../profile/components/services/ServicesContactComponent";
import { InfoBox } from "../../components/box/InfoBox";
import { H5 } from "../../components/core/typography/H5";
import { IOColors } from "../../components/core/variables/IOColors";
import I18n from "../../i18n";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import { IOStyles } from "../../components/core/variables/IOStyles";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const OnboardingServicesPreferenceScreen = (
  props: Props
): React.ReactElement => (
  <BaseScreenComponent 
    contextualHelp={emptyContextualHelp} 
	  headerTitle={I18n.t("profile.preferences.list.service_contact")>
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
        <ServicesContactComponent />
        <InfoBox iconName={"io-profilo"} iconColor={IOColors.bluegrey}>
          <H5 color={"bluegrey"} weight={"Regular"}>
            {I18n.t("profile.main.privacy.shareData.screen.profileSettings")}
          </H5>
        </InfoBox>
        <View spacer={true} />
      </ScrollView>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={confirmButtonProps(props.onContinue)}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO add the function to confirm and start the profile update
  onContinue: () => dispatch(servicesOptinCompleted())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OnboardingServicesPreferenceScreen);
