import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { NavigationActions } from "react-navigation";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import { useHardwareBackButton } from "../../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { FooterTwoButtons } from "../../../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { walletAddPrivativeCancel } from "../../../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.privative.headerTitle"),
  title: I18n.t("wallet.onboarding.privative.search.koNotFound.title"),
  body: I18n.t("wallet.onboarding.privative.search.koNotFound.body"),
  cancel: I18n.t("global.buttons.cancel"),
  modifyCardNumber: I18n.t(
    "wallet.onboarding.privative.search.koNotFound.cta.modifyCardNumber"
  )
});

/**
 * This screen informs the user that the private card indicated was not found
 * @param props
 * @constructor
 */
const PrivativeKoNotFound = (props: Props): React.ReactElement => {
  const { headerTitle, title, body, cancel, modifyCardNumber } = loadLocales();

  useHardwareBackButton(() => {
    props.cancel();
    return true;
  });
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"CoBadgeKoTimeout"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
        <FooterTwoButtons
          type={"TwoButtonsInlineThird"}
          onRight={props.goToModifyCardNumber}
          onCancel={props.cancel}
          rightText={modifyCardNumber}
          leftText={cancel}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  goToModifyCardNumber: () => dispatch(NavigationActions.back())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeKoNotFound);
