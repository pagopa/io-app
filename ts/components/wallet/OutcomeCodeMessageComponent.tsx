import React from "react";
import { ImageSourcePropType, SafeAreaView } from "react-native";
import I18n from "../../i18n";
import View from "../ui/TextWithIcon";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { IOStyles } from "../core/variables/IOStyles";
import BaseScreenComponent from "../screens/BaseScreenComponent";
import { InfoScreenComponent } from "../infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../infoScreen/imageRendering";
import FooterWithButtons from "../ui/FooterWithButtons";
import { cancelButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { OutcomeCode } from "../../types/outcomeCode";

type PossibleFlow = "addCreditCard" | "payment";
type OwnProp = {
  outcomeCode: OutcomeCode;
  onClose: () => void;
  onSuccess: () => void;
  flow: PossibleFlow;
};
type Props = OwnProp;

const blockingFooterWithButton = (onClose: () => void) => (
  <FooterWithButtons
    type={"SingleButton"}
    leftButton={cancelButtonProps(onClose, "Chiudi")}
  />
);

const successFooterWithButton = (onSuccess: () => void) => (
  <FooterWithButtons
    type={"SingleButton"}
    leftButton={cancelButtonProps(onSuccess, "Visualizza carta")}
  />
);

const loadSuccessLocales = (flow: PossibleFlow) => {
  switch (flow) {
    case "addCreditCard":
      return {
        title: "pippo",
        description: "",
        image: ""
      };
    case "payment":
      return {
        title: "",
        description: "",
        image: ""
      };
  }
};
/**
 * This component renders the message associated to the outcome code of a payment.
 * This component renders an image, a title and a description.
 *
 * Since there are 3 possible case for the outcomeCode.status and the footer buttons are
 * related to every case the choice of the footer is based on the outcomeCode.status props.
 *
 * This component manages differently the success message for the addCreditCard or Payment state.
 * @param props
 */
const OutcomeCodeMessageComponent: React.FC<Props> = (props: Props) => {
  const locale = I18n.currentLocale() === "en" ? "en-EN" : "it-IT";
  const successLocales = loadSuccessLocales(props.flow);
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"OutcomeCode"}>
        {props.outcomeCode.status === "success" ? (
          <InfoScreenComponent
            image={renderInfoRasterImage(
              successLocales.image as ImageSourcePropType
            )}
            title={successLocales.title}
            body={successLocales.description}
          />
        ) : (
          <InfoScreenComponent
            image={renderInfoRasterImage(
              props.outcomeCode.icon as ImageSourcePropType
            )}
            title={props.outcomeCode.title[locale]}
            body={props.outcomeCode.description[locale]}
          />
        )}
        {props.onClose &&
          props.outcomeCode.status === "errorBlocking" &&
          blockingFooterWithButton(props.onClose)}
        {props.onSuccess &&
          props.outcomeCode.status === "success" &&
          successFooterWithButton(props.onSuccess)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OutcomeCodeMessageComponent;
