import * as React from "react";
import { useContext } from "react";
import { View, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/wallet/errors/payment-unavailable-icon.png";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import { LightModalContext } from "../../../../../../../components/ui/LightModal";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../../../../../bonus/bonusVacanze/components/buttons/FooterStackButtons";
import { useHardwareBackButton } from "../../../../../../../hooks/useHardwareBackButton";
import TosBonusComponent from "../../../../../../bonus/common/components/TosBonusComponent";
import { walletAddCoBadgeCancel } from "../../../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.coBadge.headerTitle"),
  title: I18n.t("wallet.onboarding.coBadge.start.koDisabled.title"),
  body: I18n.t("wallet.onboarding.coBadge.start.koDisabled.body"),
  close: I18n.t("global.buttons.close"),
  findOutMore: I18n.t("global.buttons.findOutMore")
});

// TODO: unify with the link used in CoBadgeSingleBankScreen https://www.pivotaltracker.com/story/show/176780396
const participatingBankUrl =
  "https://io.italia.it/cashback/carta-non-abilitata-pagamenti-online";

/**
 * The co-badge workflow is not yet available for the selected bank
 * @constructor
 * @param props
 */
const CoBadgeStartKoDisabled = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    props.cancel();
    return true;
  });
  const { headerTitle, title, body, close, findOutMore } = loadLocales();
  const { showModal, hideModal } = useContext(LightModalContext);
  const openCardsNotEnabledModal = () => {
    showModal(
      <TosBonusComponent tos_url={participatingBankUrl} onClose={hideModal} />
    );
  };
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"CoBadgeStartKoDisabled"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />

        <FooterStackButton
          buttons={[
            confirmButtonProps(props.cancel, close),
            cancelButtonProps(openCardsNotEnabledModal, findOutMore)
          ]}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddCoBadgeCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoBadgeStartKoDisabled);
