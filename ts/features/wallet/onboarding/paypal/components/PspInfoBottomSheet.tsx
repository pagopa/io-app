import * as React from "react";
import { StyleSheet } from "react-native";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { View } from "native-base";
import { ReactNode } from "react";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import I18n from "../../../../../i18n";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import { BottomSheetContent } from "../../../../../components/bottomSheet/BottomSheetContent";
import MoneyDownIcon from "../../../../../../img/wallet/payment-methods/paypal/money_down.svg";
import LabelIcon from "../../../../../../img/wallet/payment-methods/paypal/label.svg";
import EditIcon from "../../../../../../img/wallet/payment-methods/paypal/edit.svg";
import { formatNumberCentsToAmount } from "../../../../../utils/stringBuilder";
import { Body } from "../../../../../components/core/typography/Body";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { Label } from "../../../../../components/core/typography/Label";
import { Link } from "../../../../../components/core/typography/Link";
import { openWebUrl } from "../../../../../utils/url";

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
  pspTosUrl: string;
  onButtonPress: () => void;
};

const iconSize = 24;
// items to be displayed inside the bottom sheet content
// icon and description
const getItem = (props: Props) => [
  {
    icon: <MoneyDownIcon width={iconSize} height={iconSize} />,
    description: (
      <Body>
        {I18n.t(
          "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row1Description"
        )}
      </Body>
    )
  },
  {
    icon: <LabelIcon width={iconSize} height={iconSize} />,
    description: (
      <Body>
        {I18n.t(
          "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row2Description1"
        )}
        <Label color={"bluegrey"}>
          {formatNumberCentsToAmount(props.pspFee, true)}
        </Label>
        {I18n.t(
          "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row2Description2"
        )}
      </Body>
    )
  },
  {
    icon: <EditIcon width={iconSize} height={iconSize} />,
    description: (
      <View style={{ flexDirection: "column" }}>
        <TouchableWithoutFeedback
          onPress={() => openWebUrl(props.pspPrivacyUrl)}
        >
          <Link weight={"SemiBold"}>
            {I18n.t(
              "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row3Description1"
            )}
          </Link>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => openWebUrl(props.pspTosUrl)}>
          <Link weight={"SemiBold"}>
            {I18n.t(
              "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row3Description2"
            )}
          </Link>
        </TouchableWithoutFeedback>
      </View>
    )
  }
];

/**
 * row layout
 * icon + textual body
 * @param props
 * @constructor
 */
const ItemLayout = (props: { icon: JSX.Element; description: ReactNode }) => (
  <View style={styles.rowContainer}>
    <View style={styles.rowIcon}>{props.icon}</View>
    <View style={IOStyles.flex}>{props.description}</View>
  </View>
);

/**
 * bottom sheet content used to show info about PayPal psp
 * @param props
 * @constructor
 */
export const PspInfoBottomSheetContent = (props: Props) => {
  const continueButtonProps: BlockButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPressWithGestureHandler: true,
    onPress: props.onButtonPress,
    title: I18n.t("wallet.onboarding.paypal.selectPsp.infoBottomSheet.ctaTitle")
  };
  return (
    <BottomSheetContent
      testID={"PspInfoBottomSheetContentTestID"}
      footer={
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      }
    >
      {getItem(props).map((item, idx) => (
        <ItemLayout {...item} key={`info_row_${idx}`} />
      ))}
    </BottomSheetContent>
  );
};
