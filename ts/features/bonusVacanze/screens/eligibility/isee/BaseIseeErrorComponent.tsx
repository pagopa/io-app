import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { openLink } from "../../../../../components/ui/Markdown/handlers/link";
import I18n from "../../../../../i18n";
import { abortBonusRequest } from "../../../components/AbortBonusRequest";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../../components/buttons/FooterStackButtons";
import { useHardwareBackButton } from "../../../components/hooks/useHardwareBackButton";
import { renderRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";

const inpsDsuHomeUrl =
  "https://www.inps.it/nuovoportaleinps/default.aspx?itemdir=49961";
const inpsSimulationUrl =
  "https://servizi2.inps.it/servizi/Iseeriforma/FrmSimHome.aspx";

type Props = {
  image: ImageSourcePropType;
  title: string;
  body: string;
  onCancel: () => void;
};

/**
 * A generic component used to display the possible ISEE errors during the check eligibility phase.
 * @param props
 * @constructor
 */
export const BaseIseeErrorComponent: React.FunctionComponent<Props> = props => {
  const goToDsu = I18n.t(
    "bonus.bonusVacanza.eligibility.iseeNotEligible.goToNewDSU"
  );
  const goToSimulation = I18n.t(
    "bonus.bonusVacanza.eligibility.iseeNotEligible.goToNewSimulation"
  );
  const cancelRequest = I18n.t("bonus.bonusVacanza.cta.cancelRequest");

  useHardwareBackButton(() => {
    abortBonusRequest(props.onCancel);
    return true;
  });

  return (
    <>
      <InfoScreenComponent
        image={renderRasterImage(props.image)}
        title={props.title}
        body={props.body}
      />
      <FooterStackButton
        buttons={[
          confirmButtonProps(() => openLink(inpsDsuHomeUrl), goToDsu),
          confirmButtonProps(() => openLink(inpsSimulationUrl), goToSimulation),
          cancelButtonProps(
            () => abortBonusRequest(props.onCancel),
            cancelRequest
          )
        ]}
      />
    </>
  );
};
