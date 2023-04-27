import * as React from "react";
import { View, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import { cancelButtonProps } from "../../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { useHardwareBackButton } from "../../../../../../../hooks/useHardwareBackButton";
import { walletAddPrivativeCancel } from "../../../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.privative.headerTitle"),
  title: I18n.t(
    "wallet.onboarding.privative.choosePrivativeIssuer.koUnavailable.title"
  ),
  body: I18n.t(
    "wallet.onboarding.privative.choosePrivativeIssuer.koUnavailable.body"
  ),
  close: I18n.t("global.buttons.close")
});

/**
 * The privative service is remotely disabled for the selected bank
 * @constructor
 * @param props
 */
const PrivativeIssuerKoUnavailable = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    props.cancel();
    return true;
  });
  const { headerTitle, title, body, close } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />

        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps(props.cancel, close)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeIssuerKoUnavailable);
