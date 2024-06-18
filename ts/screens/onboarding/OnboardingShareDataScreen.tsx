import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import React, { ComponentProps, ReactElement, useMemo } from "react";
import { SafeAreaView, View } from "react-native";
import { IOStyles } from "../../components/core/variables/IOStyles";
import I18n from "../../i18n";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { useIODispatch, useIOSelector, useIOStore } from "../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../store/reducers/profile";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackMixpanelScreen } from "../profile/analytics";
import {
  trackMixpanelDeclined,
  trackMixpanelSetEnabled
} from "../profile/analytics/mixpanel/mixpanelAnalytics";
import { useConfirmOptOutBottomSheet } from "../profile/components/OptOutBottomSheet";
import { ShareDataComponent } from "../profile/components/ShareDataComponent";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { useOnboardingAbortAlert } from "../../utils/hooks/useOnboardingAbortAlert";

type IOScrollViewActions = ComponentProps<
  typeof IOScrollViewWithLargeHeader
>["actions"];

const OnboardingShareDataScreen = (): ReactElement => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  const { showAlert } = useOnboardingAbortAlert();
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    const flow = getFlowType(true, isFirstOnBoarding);
    trackMixpanelDeclined(flow);
    trackMixpanelSetEnabled(false, flow, store.getState()).finally(() => {
      dispatch(setMixpanelEnabled(false));
    });
  });

  useOnFirstRender(() => {
    trackMixpanelScreen(getFlowType(true, isFirstOnBoarding));
  });

  const actions = useMemo<IOScrollViewActions>(
    () => ({
      type: "TwoButtons",
      secondary: {
        label: I18n.t("profile.main.privacy.shareData.screen.cta.dontShare"),
        accessibilityLabel: I18n.t(
          "profile.main.privacy.shareData.screen.cta.dontShare"
        ),
        onPress: present
      },
      primary: {
        label: I18n.t("profile.main.privacy.shareData.screen.cta.shareData"),
        accessibilityLabel: I18n.t(
          "profile.main.privacy.shareData.screen.cta.shareData"
        ),
        onPress: () => {
          // Before tracking any event, we need to enable mixpanel
          // props.setMixpanelEnabled(true);
          dispatch(setMixpanelEnabled(true));
          // We wait some time to allow mixpanel to be enabled
          // before tracking the event
          setTimeout(() => {
            void trackMixpanelSetEnabled(
              true,
              getFlowType(false, isFirstOnBoarding),
              store.getState()
            );
          }, 1000);
        },
        testID: "share-data-confirm-button"
      }
    }),
    [isFirstOnBoarding, present, store, dispatch]
  );

  return (
    <IOScrollViewWithLargeHeader
      goBack={showAlert}
      title={{
        label: I18n.t("profile.main.privacy.shareData.screen.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      actions={actions}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, { flexGrow: 1 }]}>
          <ShareDataComponent />
          <VSpacer size={32} />
          <Banner
            content={I18n.t(
              "profile.main.privacy.shareData.screen.profileSettings"
            )}
            accessibilityLabel={I18n.t(
              "profile.main.privacy.shareData.screen.profileSettings"
            )}
            color="neutral"
            pictogramName="activate"
            size="small"
          />
        </View>
        <VSpacer size={16} />
        {bottomSheet}
      </SafeAreaView>
    </IOScrollViewWithLargeHeader>
  );
};

export default OnboardingShareDataScreen;
