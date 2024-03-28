import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, SafeAreaView, View } from "react-native";
import { connect, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { InfoBox } from "../../components/box/InfoBox";
import { Label } from "../../components/core/typography/Label";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
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
    <RNavScreenWithLargeHeader
      goBack={handleGoBack}
      title={{
        label: I18n.t("profile.main.privacy.shareData.screen.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      fixedBottomSlot={
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          primary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t(
                "profile.main.privacy.shareData.screen.cta.dontShare"
              ),
              accessibilityLabel: I18n.t(
                "profile.main.privacy.shareData.screen.cta.dontShare"
              ),
              onPress: present
            }
          }}
          secondary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t(
                "profile.main.privacy.shareData.screen.cta.shareData"
              ),
              accessibilityLabel: I18n.t(
                "profile.main.privacy.shareData.screen.cta.shareData"
              ),
              onPress: () => {
                trackMixpanelSetEnabled(
                  true,
                  getFlowType(true, isFirstOnBoarding)
                );
                props.setMixpanelEnabled(true);
              },
              testID: "share-data-confirm-button"
            }
          }}
        />
      }
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, { flexGrow: 1 }]}>
          <ShareDataComponent />
          <VSpacer size={24} />
          <InfoBox iconName="profile" iconColor="bluegrey">
            <Label color={"bluegrey"} weight={"Regular"}>
              {I18n.t("profile.main.privacy.shareData.screen.profileSettings")}
            </Label>
          </InfoBox>
        </View>

        {bottomSheet}
      </SafeAreaView>
    </RNavScreenWithLargeHeader>
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
