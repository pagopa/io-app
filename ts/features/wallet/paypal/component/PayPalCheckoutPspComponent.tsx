import * as React from "react";
import { ListItem, View } from "native-base";
import { StyleSheet } from "react-native";
import { H3 } from "../../../../components/core/typography/H3";
import { ImportoEuroCents } from "../../../../../definitions/backend/ImportoEuroCents";
import { H4 } from "../../../../components/core/typography/H4";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { Label } from "../../../../components/core/typography/Label";
import IconFont from "../../../../components/ui/IconFont";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";
import { Link } from "../../../../components/core/typography/Link";
import { openWebUrl } from "../../../../utils/url";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  pspContainer: {
    alignItems: "flex-start",
    flexDirection: "column"
  },
  pspHeader: {
    flexDirection: "row"
  },
  icon: {
    padding: 8
  }
});

type Props = {
  fee: ImportoEuroCents;
  pspName: string;
  privacyUrl?: string;
};

/**
 * this component shows the psp details (cost, name and privacy url) associated
 * to the current psp that is handling the payment addressed with Paypal
 * @constructor
 */
export const PayPalCheckoutPspComponent = (props: Props) => {
  const { privacyUrl } = props;
  return (
    <View style={styles.container}>
      <ListItem style={styles.pspContainer}>
        <View style={styles.pspHeader}>
          <IconFont
            name="io-transactions"
            size={24}
            color={IOColors.bluegrey}
          />
          <View hspacer small={true} />
          <H3 color={"bluegrey"}>
            {I18n.t("wallet.onboarding.paypal.paymentCheckout.transactionCost")}
          </H3>
        </View>
        <View spacer={true} />
        <H4>{formatNumberCentsToAmount(props.fee, true)}</H4>
        <Label color={"bluegrey"} weight={"Regular"}>
          {I18n.t("wallet.onboarding.paypal.paymentCheckout.pspHandler", {
            pspName: props.pspName
          })}
        </Label>
      </ListItem>
      {privacyUrl && (
        <>
          <View spacer={true} />
          <Label color={"bluegrey"} weight={"Regular"}>
            {I18n.t(
              "wallet.onboarding.paypal.paymentCheckout.privacyDisclaimer"
            )}
          </Label>
          <Link onPress={() => openWebUrl(privacyUrl)}>
            {I18n.t("wallet.onboarding.paypal.paymentCheckout.privacyTerms")}
          </Link>
        </>
      )}
    </View>
  );
};
