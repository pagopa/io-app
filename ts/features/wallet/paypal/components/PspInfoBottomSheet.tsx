import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import I18n from "../../../../i18n";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { Body } from "../../../../components/core/typography/Body";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import { BottomSheetContent } from "../../../../components/bottomSheet/BottomSheetContent";

const styles = StyleSheet.create({
  link: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.white,
    paddingRight: 0,
    paddingLeft: 0
  }
});

const findOutMore = "https://io.italia.it/cashback/faq/#n3_11";
type Props = {
  pspName: string;
  pspFee: NonNegativeNumber;
  onButtonPress: () => void;
};
/**
 * Explains why there are other cards
 * @constructor
 */
export const PspInfoBottomSheetContent = (props: Props) => {
  const continueButtonProps: BlockButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPressWithGestureHandler: true,
    // TODO replace with the effective handler
    onPress: props.onButtonPress,
    title: I18n.t("global.buttons.continue")
  };
  return (
    <BottomSheetContent
      footer={
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      }
    >
      <Body>
        {I18n.t(
          "bonus.bpd.details.paymentMethods.activateOnOthersChannel.whyOtherCards.body"
        )}
      </Body>
    </BottomSheetContent>
  );
};
