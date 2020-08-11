import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { cancelButtonProps } from "../../components/buttons/ButtonConfigurations";
import { useHardwareBackButton } from "../../components/hooks/useHardwareBackButton";
import { bonusVacanzeStyle } from "../../components/Styles";
import { cancelBonusVacanzeRequest } from "../../store/actions/bonusVacanze";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../img/wallet/errors/payment-unknown-icon.png");

/**
 * This screen informs the user that only citizens of legal age can apply for the bonus.
 * It allows only one CTA: exit
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const UnderageScreen: React.FunctionComponent<Props> = props => {
  const title = I18n.t("bonus.bonusVacanze.eligibility.underage.title");
  const cancel = I18n.t("global.buttons.exit");

  useHardwareBackButton(() => {
    props.onCancel();
    return true;
  });

  return (
    <SafeAreaView style={bonusVacanzeStyle.flex}>
      <InfoScreenComponent image={renderInfoRasterImage(image)} title={title} />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={cancelButtonProps(props.onCancel, cancel)}
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
)(UnderageScreen);
