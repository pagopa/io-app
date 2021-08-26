import * as React from "react";
import { SafeAreaView } from "react-native";
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
import { cancelButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { walletAddBancomatCancel } from "../../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.bancomat.headerTitle"),
  title: I18n.t("wallet.onboarding.bancomat.koNotFound.title"),
  body: I18n.t("wallet.onboarding.bancomat.koNotFound.body")
});

/**
 * This screen informs the user that no Bancomat in his name were found.
 * No abi selected, all the services returned 0
 * @constructor
 */
const BancomatKoNotFound: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body } = loadLocales();

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps(props.cancel)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBancomatCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BancomatKoNotFound);
