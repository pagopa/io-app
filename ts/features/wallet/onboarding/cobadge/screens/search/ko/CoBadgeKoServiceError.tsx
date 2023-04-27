import * as React from "react";
import { View, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";
import image from "../../../../../../../../img/wallet/errors/payment-unavailable-icon.png";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import { cancelButtonProps } from "../../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { useHardwareBackButton } from "../../../../../../../hooks/useHardwareBackButton";
import { walletAddCoBadgeCancel } from "../../../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.coBadge.headerTitle"),
  title: I18n.t("wallet.onboarding.coBadge.search.koServiceError.title"),
  body: I18n.t("wallet.onboarding.coBadge.search.koServiceError.body"),
  close: I18n.t("global.buttons.close")
});

/**
 * This screen informs the user that no co-badge in his name were found because not all
 * the services reply with success.
 * @constructor
 */
const CoBadgeKoServiceError: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, close } = loadLocales();

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
      <SafeAreaView style={IOStyles.flex} testID={"CoBadgeKoServiceError"}>
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
  cancel: () => dispatch(walletAddCoBadgeCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoBadgeKoServiceError);
