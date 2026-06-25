import { Banner, ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ReactElement, useCallback, useMemo } from "react";

import { IOScrollViewActions } from "../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import { setMixpanelEnabled } from "../../../store/actions/mixpanel";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { trackMixpanelScreen } from "../../settings/common/analytics";
import {
  TrackingInfo,
  trackMixpanelDeclined,
  trackMixpanelNotNowSelected,
  trackMixpanelSetEnabled,
  trackMixPanelTrackingInfo
} from "../../settings/common/analytics/mixpanel/mixpanelAnalytics";
import { isProfileFirstOnBoardingSelector } from "../../settings/common/store/selectors";
import { ShareDataComponent } from "../../settings/privacy/shared/components/ShareDataComponent";
import { useConfirmOptOutBottomSheet } from "../../settings/privacy/shared/hooks/useConfirmOptOutBottomSheet";
import { useOnboardingAbortAlert } from "../hooks/useOnboardingAbortAlert";

const OnboardingShareDataScreen = (): ReactElement => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const flow = getFlowType(true, isFirstOnBoarding);

  const { showAlert } = useOnboardingAbortAlert();
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    trackMixpanelDeclined(flow);
    void trackMixpanelSetEnabled(false, flow, store.getState()).finally(() => {
      dispatch(setMixpanelEnabled(false));
    });
  });

  useOnFirstRender(() => {
    trackMixpanelScreen(getFlowType(true, isFirstOnBoarding));
  });

  const handleTrackingAction = useCallback(
    (info: TrackingInfo) => {
      trackMixPanelTrackingInfo(flow, info);
    },
    [flow]
  );

  const onDontShareDataPress = useCallback(() => {
    trackMixpanelNotNowSelected(flow);
    present();
  }, [flow, present]);

  const actions = useMemo<IOScrollViewActions>(
    () => ({
      type: "TwoButtons",
      secondary: {
        label: I18n.t("profile.main.privacy.shareData.screen.cta.dontShare"),
        accessibilityLabel: I18n.t(
          "profile.main.privacy.shareData.screen.cta.dontShare"
        ),
        onPress: onDontShareDataPress
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
            void trackMixpanelSetEnabled(true, flow, store.getState());
          }, 1000);
        },
        testID: "share-data-confirm-button"
      }
    }),
    [onDontShareDataPress, dispatch, flow, store]
  );

  return (
    <IOScrollViewWithLargeHeader
      actions={actions}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      goBack={showAlert}
      testID="OnboardingShareDataScreen"
      title={{
        label: I18n.t("profile.main.privacy.shareData.screen.title"),
        testID: "share-data-component-title"
      }}
    >
      <ContentWrapper style={{ flexGrow: 1 }}>
        <ShareDataComponent trackAction={handleTrackingAction} />
        <VSpacer size={32} />
        <Banner
          accessibilityLabel={I18n.t(
            "profile.main.privacy.shareData.screen.profileSettings"
          )}
          color="neutral"
          content={I18n.t(
            "profile.main.privacy.shareData.screen.profileSettings"
          )}
          pictogramName="settings"
        />
      </ContentWrapper>
      <VSpacer size={16} />
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default OnboardingShareDataScreen;
