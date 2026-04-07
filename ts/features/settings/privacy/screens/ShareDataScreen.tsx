import { ContentWrapper, useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, View } from "react-native";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { setMixpanelEnabled } from "../../../../store/actions/mixpanel";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { getFlowType } from "../../../../utils/analytics";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackMixpanelScreen } from "../../common/analytics";
import {
  TrackingInfo,
  trackMixPanelTrackingInfo,
  trackMixpanelDeclined,
  trackMixpanelNotNowSelected,
  trackMixpanelSetEnabled
} from "../../common/analytics/mixpanel/mixpanelAnalytics";
import { ShareDataComponent } from "../shared/components/ShareDataComponent";
import { useConfirmOptOutBottomSheet } from "../shared/hooks/useConfirmOptOutBottomSheet";

const ShareDataScreen = () => {
  const timeoutRef = useRef<number>(undefined);
  const store = useIOStore();
  const dispatch = useIODispatch();
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector) ?? true;
  const toast = useIOToast();
  const shareButtonRef = useRef<View>(null);

  const showUpdatedPreferencesToastMessage = useCallback(() => {
    const message = I18n.t(
      "profile.main.privacy.shareData.screen.confirmToast"
    );
    toast.success(message);
    // eslint-disable-next-line functional/immutable-data
    timeoutRef.current = setTimeout(() => {
      AccessibilityInfo.announceForAccessibilityWithOptions(
        I18n.t("profile.main.privacy.shareData.screen.confirmToast"),
        { queue: true }
      );
    }, 1000);
  }, [toast]);

  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    const flow = getFlowType(false, false);
    trackMixpanelDeclined(flow);
    trackMixpanelSetEnabled(false, flow, store.getState()).finally(() => {
      dispatch(setMixpanelEnabled(false));
    });
    showUpdatedPreferencesToastMessage();
  });

  const dontShareDataLabel = I18n.t(
    "profile.main.privacy.shareData.screen.cta.dontShareData"
  );
  const shareDataLabel = I18n.t(
    "profile.main.privacy.shareData.screen.cta.shareData"
  );

  useOnFirstRender(() => {
    trackMixpanelScreen(getFlowType(false, false));
  });

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTrackingAction = useCallback((info: TrackingInfo) => {
    const flow = getFlowType(false, false);
    trackMixPanelTrackingInfo(flow, info);
  }, []);

  const onDontShareDataPress = useCallback(() => {
    const flow = getFlowType(false, false);
    trackMixpanelNotNowSelected(flow);
    present();
  }, [present]);

  const buttonProps = useMemo<IOScrollViewActions>(
    () => ({
      type: "SingleButton",
      primary: isMixpanelEnabled
        ? {
            accessibilityLabel: dontShareDataLabel,
            onPress: onDontShareDataPress,
            label: dontShareDataLabel
          }
        : {
            ref: shareButtonRef,
            label: shareDataLabel,
            accessibilityLabel: shareDataLabel,
            testID: "share-data-confirm-button",
            onPress: () => {
              // Before tracking any event, we need to enable mixpanel
              dispatch(setMixpanelEnabled(true));
              // We wait some time to allow mixpanel to be enabled
              // before tracking the event
              setTimeout(() => {
                void trackMixpanelSetEnabled(
                  true,
                  getFlowType(false, false),
                  store.getState()
                );
              }, 1000);
              showUpdatedPreferencesToastMessage();
            }
          }
    }),
    [
      dispatch,
      dontShareDataLabel,
      isMixpanelEnabled,
      onDontShareDataPress,
      shareDataLabel,
      showUpdatedPreferencesToastMessage,
      store
    ]
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.main.privacy.shareData.screen.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      actions={buttonProps}
    >
      <ContentWrapper style={{ flexGrow: 1 }}>
        <ShareDataComponent trackAction={handleTrackingAction} />
      </ContentWrapper>
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default ShareDataScreen;
