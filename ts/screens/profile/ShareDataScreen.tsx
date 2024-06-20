import { useIOToast } from "@pagopa/io-app-design-system";
import React, { useCallback } from "react";
import { SafeAreaView, View } from "react-native";
import { IOStyles } from "../../components/core/variables/IOStyles";
import I18n from "../../i18n";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../store/reducers/persistedPreferences";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector, useIOStore } from "../../store/hooks";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { IOScrollViewActions } from "../../components/ui/IOScrollView";
import { trackMixpanelScreen } from "./analytics";
import {
  TrackingInfo,
  trackMixPanelTrackingInfo,
  trackMixpanelDeclined,
  trackMixpanelSetEnabled
} from "./analytics/mixpanel/mixpanelAnalytics";
import { useConfirmOptOutBottomSheet } from "./components/OptOutBottomSheet";
import { ShareDataComponent } from "./components/ShareDataComponent";

const ShareDataScreen = () => {
  const store = useIOStore();
  const dispatch = useIODispatch();
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector) ?? true;
  const toast = useIOToast();

  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    const flow = getFlowType(false, false);
    trackMixpanelDeclined(flow);
    trackMixpanelSetEnabled(false, flow, store.getState()).finally(() => {
      dispatch(setMixpanelEnabled(false));
    });

    toast.success(I18n.t("profile.main.privacy.shareData.screen.confirmToast"));
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

  const handleTrackingAction = useCallback((info: TrackingInfo) => {
    const flow = getFlowType(false, false);
    trackMixPanelTrackingInfo(flow, info);
  }, []);

  const buttonProps: IOScrollViewActions = {
    type: "SingleButton",
    primary: isMixpanelEnabled
      ? {
          accessibilityLabel: dontShareDataLabel,
          onPress: present,
          label: dontShareDataLabel
        }
      : {
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
            toast.success(
              I18n.t("profile.main.privacy.shareData.screen.confirmToast")
            );
          }
        }
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.main.privacy.shareData.screen.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      actions={buttonProps}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, { flexGrow: 1 }]}>
          <ShareDataComponent trackAction={handleTrackingAction} />
        </View>

        {bottomSheet}
      </SafeAreaView>
    </IOScrollViewWithLargeHeader>
  );
};

export default ShareDataScreen;
