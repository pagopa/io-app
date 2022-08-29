import * as React from "react";
import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { View } from "native-base";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import I18n from "../../../../../i18n";
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
  pspPrivacyUrl?: string;
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
        <Label color={"bluegreyDark"}>
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
      <View>
        <TouchableWithoutFeedback
          onPress={() => props.pspPrivacyUrl && openWebUrl(props.pspPrivacyUrl)}
        >
          <Link weight={"SemiBold"}>
            {I18n.t(
              "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row3Description1",
              { psp: props.pspName }
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
export const PspInfoBottomSheetContent = (props: Props) => (
  <View testID={"PspInfoBottomSheetContentTestID"}>
    {getItem(props).map((item, idx) => (
      <ItemLayout {...item} key={`info_row_${idx}`} />
    ))}
  </View>
);
