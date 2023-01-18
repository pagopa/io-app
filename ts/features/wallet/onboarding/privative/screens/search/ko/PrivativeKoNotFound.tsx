import * as React from "react";
import { View, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../../i18n";
import { navigateBack } from "../../../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../../../hooks/useHardwareBackButton";
import { FooterTwoButtons } from "../../../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import { walletAddPrivativeCancel } from "../../../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.privative.headerTitle"),
  title: I18n.t("wallet.onboarding.privative.search.koNotFound.title"),
  body: I18n.t("wallet.onboarding.privative.search.koNotFound.body"),
  cancel: I18n.t("global.buttons.cancel"),
  retry: I18n.t("global.buttons.retry")
});

/**
 * This screen informs the user that the private card indicated was not found
 * @param props
 * @constructor
 */
const PrivativeKoNotFound = (props: Props): React.ReactElement => {
  const { headerTitle, title, body, cancel, retry } = loadLocales();

  useHardwareBackButton(() => {
    props.cancel();
    return true;
  });
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      headerTitle={headerTitle}
    >
      <SafeAreaView style={IOStyles.flex} testID={"PrivativeKoNotFound"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
        <FooterTwoButtons
          type={"TwoButtonsInlineThird"}
          onRight={props.goToModifyCardNumber}
          onCancel={props.cancel}
          rightText={retry}
          leftText={cancel}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  goToModifyCardNumber: () => navigateBack()
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeKoNotFound);
