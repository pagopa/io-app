import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
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

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const OnboardingShareDataScreen = (props: Props): React.ReactElement => {
  const { present: confirmOptOut, dismiss } = useConfirmOptOutBottomSheet();

  useHardwareBackButton(() => {
    dismiss();
    return true;
  });

  const optOutAction = () =>
    confirmOptOut(() => {
      props.setMixpanelEnabled(false);
    });

  return (
    <BaseScreenComponent
      customGoBack={<View />}
      headerTitle={I18n.t("profile.main.privacy.shareData.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
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
