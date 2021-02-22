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

type OwnProp = {
  outcomeCode: OutcomeCode;
  successComponent: React.FC;
  successFooter: React.FC;
  onClose: () => void;
};
type Props = OwnProp;

const blockingFooterWithButton = (onClose: () => void) => (
  <FooterWithButtons
    type={"SingleButton"}
    leftButton={cancelButtonProps(
      onClose,
      I18n.t("wallet.outcomeMessage.cta.close")
    )}
  />
);

/**
 * This component renders the message associated to the outcome code of a payment.
 * This component renders an image, a title and a description or a success component.
 *
 * Since there are 3 possible case for the outcomeCode.status and the footer buttons are
 * related to every case the choice of the footer is based on the outcomeCode.status props.
 *
 * @param props
 */
const OutcomeCodeMessageComponent: React.FC<Props> = (props: Props) => {
  const locale = I18n.currentLocale() === "en" ? "en-EN" : "it-IT";
  const title = props.outcomeCode.title ? props.outcomeCode.title[locale] : "";
  const description = props.outcomeCode.description
    ? props.outcomeCode.description[locale]
    : "";
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"OutcomeCode"}>
        {props.outcomeCode.status === "success" ? (
          <>
            <props.successComponent />
            <props.successFooter />
          </>
        ) : (
          <>
            <InfoScreenComponent
              image={renderInfoRasterImage(
                props.outcomeCode.icon as ImageSourcePropType
              )}
              title={title}
              body={description}
            />
            {props.outcomeCode.status === "errorBlocking" &&
              blockingFooterWithButton(props.onClose)}
          </>
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OutcomeCodeMessageComponent;
