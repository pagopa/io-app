import { FooterWithButtons } from "@pagopa/io-app-design-system";
import React from "react";
import { ImageSourcePropType, SafeAreaView, View } from "react-native";
import I18n from "../../i18n";
import { OutcomeCode } from "../../types/outcomeCode";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { getFullLocale } from "../../utils/locale";
import { IOStyles } from "../core/variables/IOStyles";
import { InfoScreenComponent } from "../infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../infoScreen/imageRendering";
import BaseScreenComponent from "../screens/BaseScreenComponent";

type OwnProp = {
  hideContextualHelp?: true;
  outcomeCode: OutcomeCode;
  successComponent: React.FC;
  onClose: () => void;
  successFooter?: React.FC;
  onLearnMore?: () => void;
};
type Props = OwnProp;

const blockingFooterWithButton = (
  onClose: () => void,
  onLearnMore: (() => void) | undefined
) =>
  onLearnMore ? (
    <FooterWithButtons
      type={"TwoButtonsInlineThird"}
      primary={{
        type: "Outline",
        buttonProps: {
          label: I18n.t("wallet.outcomeMessage.cta.close"),
          accessibilityLabel: I18n.t("wallet.outcomeMessage.cta.close"),
          onPress: onClose
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          label: I18n.t("wallet.outcomeMessage.cta.learnMore"),
          accessibilityLabel: I18n.t("wallet.outcomeMessage.cta.learnMore"),
          onPress: onLearnMore
        }
      }}
    />
  ) : (
    <FooterWithButtons
      type="SingleButton"
      primary={{
        type: "Outline",
        buttonProps: {
          label: I18n.t("wallet.outcomeMessage.cta.close"),
          accessibilityLabel: I18n.t("wallet.outcomeMessage.cta.close"),
          onPress: onClose
        }
      }}
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
  const locale = getFullLocale();
  const title = props.outcomeCode.title
    ? props.outcomeCode.title[locale]
    : undefined;
  const description = props.outcomeCode.description
    ? props.outcomeCode.description[locale]
    : undefined;
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      contextualHelp={
        props.hideContextualHelp === true ? undefined : emptyContextualHelp
      }
    >
      {props.outcomeCode.status === "success" ? (
        <View style={IOStyles.flex} testID={"OutcomeCode"}>
          <props.successComponent />
          {props.successFooter && <props.successFooter />}
        </View>
      ) : (
        <>
          <SafeAreaView style={IOStyles.flex} testID={"OutcomeCode"}>
            {/* Since the description can be undefined only the title is used for the conditional rendering condition */}
            {title && (
              <InfoScreenComponent
                image={renderInfoRasterImage(
                  props.outcomeCode.icon as ImageSourcePropType
                )}
                title={title}
                body={description}
              />
            )}
          </SafeAreaView>
          {props.outcomeCode.status === "errorBlocking" &&
            blockingFooterWithButton(props.onClose, props.onLearnMore)}
        </>
      )}
    </BaseScreenComponent>
  );
};

export default OutcomeCodeMessageComponent;
