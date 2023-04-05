import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../../i18n";
import { confirmButtonProps } from "../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import {
  cancelBonusVacanzeRequest,
  showBonusVacanze
} from "../../store/actions/bonusVacanze";

type Props = ReturnType<typeof mapDispatchToProps>;

import image from "../../../../../../img/messages/empty-due-date-list-icon.png";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";

/**
 * This screen informs the user that the bonus cannot be activated because another active or redeemed
 * bonus related to this user was found.
 * It allows only one CTA: exit
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const BonusAlreadyExists: React.FunctionComponent<Props> = props => {
  const title = I18n.t("bonus.bonusVacanze.activation.alreadyRedeemed.title");
  const body = I18n.t("bonus.bonusVacanze.activation.alreadyRedeemed.body");
  const cta = I18n.t("bonus.bonusVacanze.activation.alreadyRedeemed.cta");

  useHardwareBackButton(() => {
    props.onCancel();
    return true;
  });

  return (
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={title}
        body={body}
      />
      <FooterStackButton
        buttons={[confirmButtonProps(props.onGoToBonus, cta)]}
      />
    </SafeAreaView>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(cancelBonusVacanzeRequest()),
  onGoToBonus: () => dispatch(showBonusVacanze())
});

export default connect(null, mapDispatchToProps)(BonusAlreadyExists);
