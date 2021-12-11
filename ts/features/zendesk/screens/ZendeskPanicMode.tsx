import * as React from "react";
import { SafeAreaView } from "react-native";
import image from "../../../../img/servicesStatus/error-detail-icon.png";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";

const ZendeskPanicMode = () => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(image)}
      title={I18n.t("bonus.sv.voucherGeneration.ko.checkIncome.title")}
      body={I18n.t("bonus.sv.voucherGeneration.ko.checkIncome.body")}
    />
    <FooterWithButtons
      type="SingleButton"
      leftButton={cancelButtonProps(() => true, I18n.t("global.buttons.exit"))}
    />
  </SafeAreaView>
);

export default ZendeskPanicMode;
