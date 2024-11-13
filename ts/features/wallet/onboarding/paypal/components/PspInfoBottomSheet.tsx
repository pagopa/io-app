import { Body, Icon, Label, VSpacer } from "@pagopa/io-app-design-system";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import * as React from "react";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { formatNumberCentsToAmount } from "../../../../../utils/stringBuilder";
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
    icon: <Icon name="psp" size={iconSize} color="blue" />,
    description: (
      <Body>
        {I18n.t(
          "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row1Description"
        )}
      </Body>
    )
  },
  {
    icon: <Icon name="tag" size={iconSize} color="blue" />,
    description: (
      <Body>
        {I18n.t(
          "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row2Description1"
        )}
        <Label color={"grey-700"}>
          {formatNumberCentsToAmount(props.pspFee, true)}
        </Label>
        {I18n.t(
          "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row2Description2"
        )}
      </Body>
    )
  },
  {
    icon: <Icon name="security" size={iconSize} color="blue" />,
    description: (
      <Label
        asLink
        weight={"Semibold"}
        onPress={() => props.pspPrivacyUrl && openWebUrl(props.pspPrivacyUrl)}
      >
        {I18n.t(
          "wallet.onboarding.paypal.selectPsp.infoBottomSheet.row3Description1",
          { psp: props.pspName }
        )}
      </Label>
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
    <VSpacer size={16} />
  </View>
);
