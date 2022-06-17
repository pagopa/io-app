import React from "react";
import I18n from "../../../i18n";
import image from "../../../../img/wallet/errors/generic-error-icon.png";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";

type Props = Readonly<{
  onRetry: () => void;
}>;

export const PnMessageDetailsError = (props: Props) => (
  <>
    <InfoScreenComponent
      image={renderInfoRasterImage(image)}
      title={I18n.t("features.pn.details.loadError.title")}
      body={I18n.t("features.pn.details.loadError.body")}
    />
    <FooterWithButtons
      type="SingleButton"
      leftButton={{
        block: true,
        onPress: props.onRetry,
        title: I18n.t("global.buttons.retry")
      }}
    />
  </>
);
