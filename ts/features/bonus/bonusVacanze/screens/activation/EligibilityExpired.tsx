import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../img/pictograms/hourglass.png";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../components/buttons/ButtonConfigurations";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import {
  cancelBonusVacanzeRequest,
  checkBonusVacanzeEligibility
} from "../../store/actions/bonusVacanze";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * This screen informs the user that the eligibility data has expired
 * or the user is ineligible to get the bonus.
 * She must re-initiate the eligibility procedure to refresh her data
 * and retry to activate the bonus within 24h since she got the result.
 * It allows only one CTA: exit
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const EligibilityExpired: React.FunctionComponent<Props> = props => {
  const title = I18n.t(
    "bonus.bonusVacanze.activation.eligibilityExpired.title"
  );
  const body = I18n.t("bonus.bonusVacanze.activation.eligibilityExpired.body");
  const cancel = I18n.t("global.buttons.close");
  const cta = I18n.t("bonus.bonusVacanze.activation.eligibilityExpired.cta");

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
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={cancelButtonProps(props.onCancel, cancel)}
        rightButton={confirmButtonProps(props.onRestart, cta)}
      />
    </SafeAreaView>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(cancelBonusVacanzeRequest()),
  onRestart: () => dispatch(checkBonusVacanzeEligibility.request())
});

export default connect(null, mapDispatchToProps)(EligibilityExpired);
