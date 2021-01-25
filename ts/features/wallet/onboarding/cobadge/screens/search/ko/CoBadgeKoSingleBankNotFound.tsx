import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";

import I18n from "../../../../../../../i18n";
import image from "../../../../../../../img/servicesStatus/error-detail-icon.png";
import { GlobalState } from "../../../../../../../store/reducers/types";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import {
  searchUserCoBadge,
  walletAddCoBadgeCancel
} from "../../../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  // TODO: replace locales
  headerTitle: I18n.t("wallet.onboarding.coBadge.headerTitle"),
  title: "TMP Title",
  body: "TMP Body",
  chooseAnother: "TMP chooseAnother"
});

/**
 * This screen informs the user that no co-badge cards in his name were found.
 * A specific bank (ABI) has been selected
 * @constructor
 */
const CoBadgeKoSingleBankNotFound: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, chooseAnother } = loadLocales();

  const onChooseAnother = () => props.searchPans();
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
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(props.cancel)}
          rightButton={confirmButtonProps(onChooseAnother, chooseAnother)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddCoBadgeCancel()),
  back: () => dispatch(NavigationActions.back()),
  searchPans: (abi?: string) => {
    dispatch(searchUserCoBadge.request(abi));
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoBadgeKoSingleBankNotFound);
