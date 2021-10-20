import * as React from "react";
import { StyleSheet } from "react-native";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { View } from "native-base";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import { BottomSheetContent } from "../../../../components/bottomSheet/BottomSheetContent";
import MoneyDownIcon from "../../../../../img/wallet/payment-methods/paypal/money_down.svg";
import LabelIcon from "../../../../../img/wallet/payment-methods/paypal/label.svg";
import EditIcon from "../../../../../img/wallet/payment-methods/paypal/edit.svg";
import Markdown from "../../../../components/ui/Markdown";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
const styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: 12
  },
  rowIcon: { marginTop: 6, marginRight: 16 }
});

type Props = {
  pspName: string;
  pspFee: NonNegativeNumber;
  pspPrivacyUrl: string;
  onButtonPress: () => void;
};

const InfoRow = (props: {
  icon: JSX.Element;
  description: string;
  extraBodyHeight?: number;
}) => (
  <View style={styles.rowContainer}>
    <View style={styles.rowIcon}>{props.icon}</View>
    <Markdown
      avoidTextSelection={true}
      extraBodyHeight={props.extraBodyHeight ?? 0}
    >
      {props.description}
    </Markdown>
  </View>
);

const iconSize = 24;
const infoItems = (props: Props) => [
  {
    icon: <MoneyDownIcon width={iconSize} height={iconSize} />,
    description: I18n.t(
      "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row1Description"
    )
  },
  {
    icon: <LabelIcon width={iconSize} height={iconSize} />,
    description: I18n.t(
      "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row2Description",
      { pspFee: formatNumberCentsToAmount(props.pspFee, true) }
    ),
    extraBodyHeight: -20
  },
  {
    icon: <EditIcon width={iconSize} height={iconSize} />,
    description: I18n.t(
      "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row3Description",
      { pspPrivacyUrl: props.pspPrivacyUrl, pspName: props.pspName }
    )
  }
];

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
      {infoItems(props).map((item, idx) => (
        <InfoRow {...item} key={`info_row_${idx}`} />
      ))}
    </BottomSheetContent>
  );
};
