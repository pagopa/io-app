import * as React from "react";
import { SafeAreaView, ScrollView, StatusBar, Alert } from "react-native";
import { connect, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { InfoBox } from "../../components/box/InfoBox";
import { Label } from "../../components/core/typography/Label";
import { IOColors } from "../../components/core/variables/IOColors";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../i18n";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { GlobalState } from "../../store/reducers/types";
import { useConfirmOptOutBottomSheet } from "../profile/components/OptOutBottomSheet";
import { ShareDataComponent } from "../profile/components/ShareDataComponent";
import { abortOnboarding } from "../../store/actions/onboarding";
import { VSpacer } from "../../components/core/spacer/Spacer";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const OnboardingShareDataScreen = (props: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    props.setMixpanelEnabled(false);
  });

  const executeAbortOnboarding = () => {
    dispatch(abortOnboarding());
  };

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
          onPress: executeAbortOnboarding
        }
      ]
    );
  };

  return (
    <BaseScreenComponent
      goBack={handleGoBack}
      headerTitle={I18n.t("onboarding.shareData.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <StatusBar backgroundColor={IOColors.white} barStyle={"dark-content"} />
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <ShareDataComponent />
          <VSpacer size={16} />
          <InfoBox iconName="profileAlt" iconColor="bluegrey">
            <Label color={"bluegrey"} weight={"Regular"}>
              {I18n.t("profile.main.privacy.shareData.screen.profileSettings")}
            </Label>
          </InfoBox>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(
            present,
            I18n.t("profile.main.privacy.shareData.screen.cta.dontShare")
          )}
          rightButton={confirmButtonProps(
            () => props.setMixpanelEnabled(true),
            I18n.t("profile.main.privacy.shareData.screen.cta.shareData"),
            undefined,
            "share-data-confirm-button"
          )}
        />
        {bottomSheet}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setMixpanelEnabled: (newValue: boolean) =>
    dispatch(setMixpanelEnabled(newValue))
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OnboardingShareDataScreen);
