import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../i18n";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { showToast } from "../../utils/showToast";
import { useConfirmOptOutBottomSheet } from "./components/OptOutBottomSheet";
import { ShareDataComponent } from "./components/ShareDataComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const ShareDataScreen = (props: Props): React.ReactElement => {
  const { present, bottomSheet } = useConfirmOptOutBottomSheet(() => {
    props.setMixpanelEnabled(false);
    showToast(
      I18n.t("profile.main.privacy.shareData.screen.confirmToast"),
      "success"
    );
  });
  const isMixpanelEnabled = props.isMixpanelEnabled ?? true;

  const buttonProps = isMixpanelEnabled
    ? cancelButtonProps(
        present,
        I18n.t("profile.main.privacy.shareData.screen.cta.dontShareData")
      )
    : confirmButtonProps(
        () => {
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
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.main.privacy.shareData.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <ShareDataComponent />
        </ScrollView>
        <FooterWithButtons type={"SingleButton"} leftButton={buttonProps} />
        {bottomSheet}
      </SafeAreaView>
    </BaseScreenComponent>
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
