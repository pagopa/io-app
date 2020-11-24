import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { walletAddBancomatCancel } from "../../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.bancomat.headerTitle"),
  title: I18n.t("wallet.onboarding.bancomat.koNotFoundSingleBank.title"),
  body: I18n.t("wallet.onboarding.bancomat.koNotFoundSingleBank.body"),
  chooseAnother: I18n.t(
    "wallet.onboarding.bancomat.koNotFoundSingleBank.chooseAnother"
  )
});

/**
 * This screen informs the user that no Bancomat in his name were found.
 * A specific bank (ABI) has been selected
 * @constructor
 */
const BancomatKoSingleBankNotFound: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, chooseAnother } = loadLocales();

  return (
    <BaseScreenComponent goBack={true} headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(props.cancel)}
          rightButton={confirmButtonProps(props.back, chooseAnother)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBancomatCancel()),
  back: () => dispatch(NavigationActions.back())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatKoSingleBankNotFound);
