import {
  BlockButtonProps,
  FooterWithButtons
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOToast } from "../../components/Toast";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackMixpanelScreen } from "./analytics";
import {
  trackMixpanelDeclined,
  trackMixpanelSetEnabled
} from "./analytics/mixpanel/mixpanelAnalytics";
import { useConfirmOptOutBottomSheet } from "./components/OptOutBottomSheet";
import { ShareDataComponent } from "./components/ShareDataComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const ShareDataScreen = (props: Props): React.ReactElement => {
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    const flow = getFlowType(false, false);
    trackMixpanelDeclined(flow);
    trackMixpanelSetEnabled(false, flow);
    props.setMixpanelEnabled(false);
    IOToast.success(
      I18n.t("profile.main.privacy.shareData.screen.confirmToast")
    );
  });
  const isMixpanelEnabled = props.isMixpanelEnabled ?? true;

  useOnFirstRender(() => {
    trackMixpanelScreen(getFlowType(false, false));
  });

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
            trackMixpanelSetEnabled(true, getFlowType(false, false));
            props.setMixpanelEnabled(true);
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
      title={I18n.t("profile.main.privacy.shareData.screen.title")}
      titleTestID={"share-data-component-title"}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      fixedBottomSlot={
        <FooterWithButtons type="SingleButton" primary={buttonProps} />
      }
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, { flexGrow: 1 }]}>
          <ShareDataComponent />
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
