import { FooterWithButtons } from "@pagopa/io-app-design-system";
import * as React from "react";
import { SafeAreaView } from "react-native";
import image from "../../../../img/wallet/errors/payment-unavailable-icon.png";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import I18n from "../../../i18n";
import { useIODispatch } from "../../../store/hooks";
import { zendeskSupportCompleted } from "../store/actions";

/**
 * This screen is show to the user when the panic mode in the remote Zendesk config is activated.
 * It allow the user only to exit from the Zendesk workflow.
 * @deprecated Use `OperationResultScreen` instead
 * @constructor
 */
const ZendeskPanicMode = () => {
  const dispatch = useIODispatch();
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());

  return (
    <>
      <SafeAreaView style={IOStyles.flex} testID={"zendeskPanicMode"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={I18n.t("support.panicMode.title")}
          body={I18n.t("support.panicMode.body")}
        />
      </SafeAreaView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.close"),
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: workUnitCompleted,
            testID: "closeButton"
          }
        }}
      />
    </>
  );
};

export default ZendeskPanicMode;
