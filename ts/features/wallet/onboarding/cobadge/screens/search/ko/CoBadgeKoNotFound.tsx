import * as React from "react";
import { useContext } from "react";
import { SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { FooterStackButton } from "../../../../../../../components/buttons/FooterStackButtons";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import { LightModalContext } from "../../../../../../../components/ui/LightModal";
import { useHardwareBackButton } from "../../../../../../../hooks/useHardwareBackButton";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import TosBonusComponent from "../../../../../../bonus/common/components/TosBonusComponent";
import { walletAddCoBadgeCancel } from "../../../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.coBadge.headerTitle"),
  title: I18n.t("wallet.onboarding.coBadge.search.koNotFound.title"),
  body: I18n.t("wallet.onboarding.coBadge.search.koNotFound.body"),
  close: I18n.t("global.buttons.close"),
  findOutMore: I18n.t("global.buttons.findOutMore")
});

// TODO: unify with the link used in CoBadgeSingleBankScreen https://www.pivotaltracker.com/story/show/176780396
const participatingBankUrl =
  "https://io.italia.it/cashback/carta-non-abilitata-pagamenti-online";

/**
 * This screen informs the user that no co-badge in his name were found.
 * @constructor
 */
const CoBadgeKoNotFound = (props: Props): React.ReactElement => {
  const { headerTitle, title, body, close, findOutMore } = loadLocales();

  useHardwareBackButton(() => {
    props.cancel();
    return true;
  });
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
      <SafeAreaView style={IOStyles.flex} testID={"CoBadgeKoNotFound"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
        <FooterStackButton
          primaryActionProps={{
            label: close,
            accessibilityLabel: close,
            onPress: props.cancel
          }}
          secondaryActionProps={{
            label: findOutMore,
            accessibilityLabel: findOutMore,
            onPress: openCardsNotEnabledModal
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddCoBadgeCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeKoNotFound);
