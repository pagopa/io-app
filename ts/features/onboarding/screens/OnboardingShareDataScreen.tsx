import { Banner, ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import { ReactElement, useCallback, useMemo } from "react";
import I18n from "i18next";
import { setMixpanelEnabled } from "../../../store/actions/mixpanel";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../settings/common/store/selectors";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { trackMixpanelScreen } from "../../settings/common/analytics";
import {
  TrackingInfo,
  trackMixPanelTrackingInfo,
  trackMixpanelDeclined,
  trackMixpanelNotNowSelected,
  trackMixpanelSetEnabled
} from "../../settings/common/analytics/mixpanel/mixpanelAnalytics";
import { useConfirmOptOutBottomSheet } from "../../settings/privacy/shared/hooks/useConfirmOptOutBottomSheet";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import { useOnboardingAbortAlert } from "../hooks/useOnboardingAbortAlert";
import { IOScrollViewActions } from "../../../components/ui/IOScrollView";
import { ShareDataComponent } from "../../settings/privacy/shared/components/ShareDataComponent";

const OnboardingShareDataScreen = (): ReactElement => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const flow = getFlowType(true, isFirstOnBoarding);

  const { showAlert } = useOnboardingAbortAlert();
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    trackMixpanelDeclined(flow);
    trackMixpanelSetEnabled(false, flow, store.getState()).finally(() => {
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
      goBack={showAlert}
      title={{
        label: I18n.t("profile.main.privacy.shareData.screen.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      actions={actions}
      testID="OnboardingShareDataScreen"
    >
      <ContentWrapper style={{ flexGrow: 1 }}>
        <ShareDataComponent trackAction={handleTrackingAction} />
        <VSpacer size={32} />
        <Banner
          content={I18n.t(
            "profile.main.privacy.shareData.screen.profileSettings"
          )}
          accessibilityLabel={I18n.t(
            "profile.main.privacy.shareData.screen.profileSettings"
          )}
          color="neutral"
          pictogramName="settings"
        />
      </ContentWrapper>
      <VSpacer size={16} />
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default OnboardingShareDataScreen;
