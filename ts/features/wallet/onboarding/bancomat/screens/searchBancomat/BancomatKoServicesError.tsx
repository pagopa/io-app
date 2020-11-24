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
  title: I18n.t("wallet.onboarding.bancomat.koServicesError.title"),
  body: I18n.t("wallet.onboarding.bancomat.koServicesError.body"),
  cta: I18n.t("wallet.onboarding.bancomat.koServicesError.chooseTheBank")
});

/**
 * This screen informs the user that no Bancomat in his name were found because not all
 * the services reply with success. The user should try to choose a single bank where
 * search the bancomat.
 * @constructor
 */
const BancomatKoServiceError: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, cta } = loadLocales();

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
          rightButton={confirmButtonProps(props.back, cta)}
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
)(BancomatKoServiceError);
