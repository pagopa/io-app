import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../img/servicesStatus/error-detail-icon.png";
import { Link } from "../../../../../../components/core/typography/Link";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { openWebUrl } from "../../../../../../utils/url";
import { cancelButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { walletAddSatispayCancel } from "../../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.satispay.headerTitle"),
  title: I18n.t("wallet.onboarding.satispay.koNotFound.title"),
  body: I18n.t("wallet.onboarding.satispay.koNotFound.body")
});

const satispayUrl = "https://support.satispay.com/it/articles/come-contattarci";

/**
 * No Satispay account found for the user
 * @constructor
 */
const SatispayKoNotFound: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body } = loadLocales();

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={<Link onPress={() => openWebUrl(satispayUrl)}>{body}</Link>}
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
  cancel: () => dispatch(walletAddSatispayCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SatispayKoNotFound);
