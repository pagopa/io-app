import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, SafeAreaView, ScrollView, StatusBar } from "react-native";
import { connect, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { InfoBox } from "../../components/box/InfoBox";
import { Label } from "../../components/core/typography/Label";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../components/buttons/ButtonConfigurations";
import I18n from "../../i18n";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { abortOnboarding } from "../../store/actions/onboarding";
import { useIOSelector } from "../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackMixpanelScreen } from "../profile/analytics";
import {
  trackMixpanelDeclined,
  trackMixpanelSetEnabled
} from "../profile/analytics/mixpanel/mixpanelAnalytics";
import { useConfirmOptOutBottomSheet } from "../profile/components/OptOutBottomSheet";
import { ShareDataComponent } from "../profile/components/ShareDataComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const OnboardingShareDataScreen = (props: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    const flow = getFlowType(true, isFirstOnBoarding);
    trackMixpanelDeclined(flow);
    trackMixpanelSetEnabled(false, flow);
    props.setMixpanelEnabled(false);
  });

  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  useOnFirstRender(() => {
    trackMixpanelScreen(getFlowType(true, isFirstOnBoarding));
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
          <InfoBox iconName="profile" iconColor="bluegrey">
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
            () => {
              trackMixpanelSetEnabled(
                true,
                getFlowType(true, isFirstOnBoarding)
              );
              props.setMixpanelEnabled(true);
            },
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
