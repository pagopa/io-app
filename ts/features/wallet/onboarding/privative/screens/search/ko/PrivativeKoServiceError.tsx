import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { View, SafeAreaView } from "react-native";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import { useHardwareBackButton } from "../../../../../../../hooks/useHardwareBackButton";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import image from "../../../../../../../../img/wallet/errors/payment-unavailable-icon.png";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { walletAddPrivativeCancel } from "../../../store/actions";
import { cancelButtonProps } from "../../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.privative.headerTitle"),
  title: I18n.t("wallet.onboarding.privative.search.koServiceError.title"),
  body: I18n.t("wallet.onboarding.privative.search.koServiceError.body"),
  close: I18n.t("global.buttons.close")
});

/**
 * This screen informs the user that no privative card in his name was found because at least one service
 * replied with a failure.
 * @param props
 * @constructor
 */
const PrivativeKoServiceError = (props: Props): React.ReactElement => {
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
      <SafeAreaView style={IOStyles.flex} testID={"PrivativeKoServiceError"}>
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
)(PrivativeKoServiceError);
