import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { cancelButtonProps } from "../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { useHardwareBackButton } from "../../components/hooks/useHardwareBackButton";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import { bonusVacanzaStyle } from "../../components/Styles";
import { cancelBonusVacanzeRequest } from "../../store/actions/bonusVacanze";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../img/servicesStatus/error-detail-icon.png");

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
    "bonus.bonusVacanza.eligibility.activate.eligibilityExpired.title"
  );
  const body = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.eligibilityExpired.body"
  );
  const cancel = I18n.t("bonus.bonusVacanza.cta.cancelRequest");

  useHardwareBackButton(() => {
    props.onCancel();
    return true;
  });

  return (
    <SafeAreaView style={bonusVacanzaStyle.flex}>
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

export default connect(
  null,
  mapDispatchToProps
)(EligibilityExpired);
