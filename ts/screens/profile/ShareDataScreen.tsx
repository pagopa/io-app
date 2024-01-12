import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../i18n";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { showToast } from "../../utils/showToast";
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
    showToast(
      I18n.t("profile.main.privacy.shareData.screen.confirmToast"),
      "success"
    );
  });
  const isMixpanelEnabled = props.isMixpanelEnabled ?? true;

  useOnFirstRender(() => {
    trackMixpanelScreen(getFlowType(false, false));
  });

  const buttonProps = isMixpanelEnabled
    ? cancelButtonProps(
        present,
        I18n.t("profile.main.privacy.shareData.screen.cta.dontShareData")
      )
    : confirmButtonProps(
        () => {
          trackMixpanelSetEnabled(true, getFlowType(false, false));
          props.setMixpanelEnabled(true);
          showToast(
            I18n.t("profile.main.privacy.shareData.screen.confirmToast"),
            "success"
          );
        },
        I18n.t("profile.main.privacy.shareData.screen.cta.shareData"),
        undefined,
        "share-data-confirm-button"
      );

  return (
    <RNavScreenWithLargeHeader
      title={I18n.t("profile.main.privacy.shareData.screen.title")}
      description={I18n.t("profile.main.privacy.shareData.screen.description")}
      fixedBottomSlot={
        <SafeAreaView>
          <FooterWithButtons type={"SingleButton"} leftButton={buttonProps} />
        </SafeAreaView>
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
