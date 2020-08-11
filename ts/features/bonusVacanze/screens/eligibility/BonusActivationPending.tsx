import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { cancelButtonProps } from "../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { useHardwareBackButton } from "../../components/hooks/useHardwareBackButton";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { bonusVacanzeStyle } from "../../components/Styles";
import { cancelBonusVacanzeRequest } from "../../store/actions/bonusVacanze";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../img/messages/empty-message-list-icon.png");

/**
 * This screen informs the user that there is already an ongoing activation for the bonus.
 * It allows only one CTA: exit
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const BonusActivationPending: React.FunctionComponent<Props> = props => {
  const title = I18n.t(
    "bonus.bonusVacanze.eligibility.activationPending.title"
  );
  const body = I18n.t(
    "bonus.bonusVacanze.eligibility.activationPending.description"
  );
  const cancel = I18n.t("global.buttons.exit");

  useHardwareBackButton(() => {
    props.onCancel();
    return true;
  });

  return (
    <SafeAreaView style={bonusVacanzeStyle.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={title}
        body={body}
      />
      <FooterStackButton
        buttons={[cancelButtonProps(props.onCancel, cancel)]}
      />
    </SafeAreaView>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(cancelBonusVacanzeRequest())
});

export default connect(null, mapDispatchToProps)(BonusActivationPending);
