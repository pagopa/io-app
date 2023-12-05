import React, { ReactElement, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Alert } from "react-native";
import { connect, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import {
  ButtonSolid,
  ContentWrapper,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import { InfoBox } from "../../components/box/InfoBox";
import { Label } from "../../components/core/typography/Label";
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
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import SecuritySuggestions from "../../features/fastLogin/components/SecuritySuggestions";
import { useIOSelector } from "../../store/hooks";
import { isSecurityAdviceAcknowledgedEnabled } from "../../features/fastLogin/store/selectors";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const OnboardingShareDataScreen = (props: Props): ReactElement => {
  const dispatch = useDispatch();
  const [mixpanelChoice, setMixpanelChoice] = useState(false);
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    handleConfirm(false);
  });

  const isSecurityAdviceAcknowledged = useIOSelector(
    isSecurityAdviceAcknowledgedEnabled
  );
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

  const handlePressDismiss = () => {
    props.setMixpanelEnabled(mixpanelChoice);
    dismissBottomSheet();
  };

  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooter,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooter,
    dismiss: dismissBottomSheet
  } = useIOBottomSheetAutoresizableModal({
    title: I18n.t("authentication.opt_in.security_suggests"),
    component: <SecuritySuggestions />,
    fullScreen: true,
    onDismiss: handlePressDismiss
  });

  const handleConfirm = (mixpanelChoice: boolean) => {
    setMixpanelChoice(mixpanelChoice);
    if (isSecurityAdviceAcknowledged) {
      props.setMixpanelEnabled(mixpanelChoice);
    } else {
      presentVeryLongAutoresizableBottomSheetWithFooter();
    }
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
            () => handleConfirm(true),
            I18n.t("profile.main.privacy.shareData.screen.cta.shareData"),
            undefined,
            "share-data-confirm-button"
          )}
        />
        {bottomSheet}
        {veryLongAutoResizableBottomSheetWithFooter}
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
