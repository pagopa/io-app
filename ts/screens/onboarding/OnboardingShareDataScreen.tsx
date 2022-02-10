import { View } from "native-base";
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
import { useHardwareBackButton } from "../../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { abortOnboarding } from "../../store/actions/onboarding";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const OnboardingShareDataScreen = (props: Props): React.ReactElement => {
  // This hook should be called **before** `useConfirmOptOutBottomSheet`
  // due to the order of the events being binded. The current behaviour
  // will show the "Go back" modal if the bottom sheet is not currently
  // open. It will dismiss the bottom sheet otherwise.
  useHardwareBackButton(() => {
    handleGoBack();
    return false;
  });

  const { present: confirmOptOut, dismiss } = useConfirmOptOutBottomSheet();
  const dispatch = useDispatch();

  const optOutAction = () =>
    confirmOptOut(() => {
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
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <ShareDataComponent />
          <View spacer={true} />
          <InfoBox iconName={"io-titolare"} iconColor={IOColors.bluegrey}>
            <Label color={"bluegrey"} weight={"Regular"}>
              {I18n.t("profile.main.privacy.shareData.screen.profileSettings")}
            </Label>
          </InfoBox>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(
            optOutAction,
            I18n.t("profile.main.privacy.shareData.screen.cta.dontShare")
          )}
          rightButton={confirmButtonProps(
            () => props.setMixpanelEnabled(true),
            I18n.t("profile.main.privacy.shareData.screen.cta.shareData")
          )}
        />
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
