import * as React from "react";
import { ComponentProps } from "react";
import { ImageSourcePropType, SafeAreaView } from "react-native";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import { openLink } from "../../../../../../components/ui/Markdown/handlers/link";
import I18n from "../../../../../../i18n";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../components/buttons/ButtonConfigurations";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";

const inpsDsuHomeUrl =
  "https://www.inps.it/nuovoportaleinps/default.aspx?itemdir=49961";

type OwnProps = {
  image: ImageSourcePropType;
  ctaText: string;
  onCancel: () => void;
};

type Props = OwnProps &
  Exclude<ComponentProps<typeof InfoScreenComponent>, "image">;

/**
 * A generic component used to display the possible ISEE errors during the check eligibility phase.
 * @param props
 * @constructor
 */
export const BaseIseeErrorComponent: React.FunctionComponent<Props> = props => {
  const cancelRequest = I18n.t("global.buttons.close");

  useHardwareBackButton(() => {
    props.onCancel();
    return true;
  });

  return (
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(props.image)}
        title={props.title}
        body={props.body}
      />
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps(props.onCancel, cancelRequest)}
        rightButton={confirmButtonProps(
          () => openLink(inpsDsuHomeUrl),
          props.ctaText
        )}
      />
    </SafeAreaView>
  );
};
