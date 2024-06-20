import {
  BlockButtonProps,
  IOToast,
  FooterWithButtons
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { useIOStore } from "../../store/hooks";
import { trackMixpanelScreen } from "./analytics";
import {
  TrackingInfo,
  trackMixPanelTrackingInfo,
  trackMixpanelDeclined,
  trackMixpanelSetEnabled
} from "./analytics/mixpanel/mixpanelAnalytics";
import { useConfirmOptOutBottomSheet } from "./components/OptOutBottomSheet";
import { ShareDataComponent } from "./components/ShareDataComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const ShareDataScreen = (props: Props): React.ReactElement => {
  const store = useIOStore();
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    const flow = getFlowType(false, false);
    trackMixpanelDeclined(flow);
    trackMixpanelSetEnabled(false, flow, store.getState()).finally(() => {
      props.setMixpanelEnabled(false);
    });

    IOToast.success(
      I18n.t("profile.main.privacy.shareData.screen.confirmToast")
    );
  });
  const isMixpanelEnabled = props.isMixpanelEnabled ?? true;

  useOnFirstRender(() => {
    trackMixpanelScreen(getFlowType(false, false));
  });

  const handleTrackingAction = React.useCallback((info: TrackingInfo) => {
    const flow = getFlowType(false, false);
    trackMixPanelTrackingInfo(flow, info);
  }, []);

  const buttonProps: BlockButtonProps = isMixpanelEnabled
    ? {
        type: "Outline",
        buttonProps: {
          color: "primary",
          accessibilityLabel: I18n.t(
            "profile.main.privacy.shareData.screen.cta.dontShareData"
          ),
          onPress: present,
          label: I18n.t(
            "profile.main.privacy.shareData.screen.cta.dontShareData"
          )
        }
      }
    : {
        type: "Solid",
        buttonProps: {
          color: "primary",
          accessibilityLabel: I18n.t(
            "profile.main.privacy.shareData.screen.cta.dontShareData"
          ),
          onPress: () => {
            // Before tracking any event, we need to enable mixpanel
            props.setMixpanelEnabled(true);
            // We wait some time to allow mixpanel to be enabled
            // before tracking the event
            setTimeout(() => {
              void trackMixpanelSetEnabled(
                true,
                getFlowType(false, false),
                store.getState()
              );
            }, 1000);
            IOToast.success(
              I18n.t("profile.main.privacy.shareData.screen.confirmToast")
            );
          },
          label: I18n.t("profile.main.privacy.shareData.screen.cta.shareData"),
          testID: "share-data-confirm-button"
        }
      };

  return (
    <RNavScreenWithLargeHeader
      title={{
        label: I18n.t("profile.main.privacy.shareData.screen.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      fixedBottomSlot={
        <FooterWithButtons type="SingleButton" primary={buttonProps} />
      }
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, { flexGrow: 1 }]}>
          <ShareDataComponent trackAction={handleTrackingAction} />
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
const mapStateToProps = (state: GlobalState) => ({
  isMixpanelEnabled: isMixpanelEnabled(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(ShareDataScreen);
