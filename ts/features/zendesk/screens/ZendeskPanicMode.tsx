import * as React from "react";
import { SafeAreaView } from "react-native";
import { useDispatch } from "react-redux";
import image from "../../../../img/wallet/errors/payment-unavailable-icon.png";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { zendeskSupportCompleted } from "../store/actions";

/**
 * This screen is show to the user when the panic mode in the remote Zendesk config is activated.
 * It allow the user only to exit from the Zendesk workflow.
 * @constructor
 */
const ZendeskPanicMode = () => {
  const dispatch = useDispatch();
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());

  return (
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={I18n.t("support.panicMode.title")}
        body={I18n.t("support.panicMode.body")}
      />
      <FooterWithButtons
        type="SingleButton"
        leftButton={cancelButtonProps(
          workUnitCompleted,
          I18n.t("global.buttons.close")
        )}
      />
    </SafeAreaView>
  );
};

export default ZendeskPanicMode;
