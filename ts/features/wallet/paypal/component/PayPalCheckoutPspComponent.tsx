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
  column: {
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
  rowCentered: { flex: 1, flexDirection: "row", alignItems: "center" }
});

type Props = {
  fee: ImportoEuroCents;
  pspName: string;
  privacyUrl?: string;
  onEditPress: () => void;
};

// temporary feature flag since this feature is still WIP (missing task to complete https://pagopa.atlassian.net/browse/IA-684?filter=10121)
export const editPspEnabled = false;
/**
 * this component shows the psp details (cost, name and privacy url) associated
 * to the current psp that is handling the payment addressed with Paypal
 * It also shows an edit label to navigate to the psp list to pick a new one
 * @constructor
 */
export const PayPalCheckoutPspComponent = (props: Props) => {
  const { privacyUrl } = props;
  return (
    <View style={styles.column}>
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
        <View style={styles.rowCentered}>
          <View style={styles.column}>
            <H4>{formatNumberCentsToAmount(props.fee, true)}</H4>
            <Label color={"bluegrey"} weight={"Regular"}>
              {I18n.t("wallet.onboarding.paypal.paymentCheckout.pspHandler", {
                pspName: props.pspName
              })}
            </Label>
          </View>
          {editPspEnabled && (
            <Label onPress={props.onEditPress} testID={"editLabelTestID"}>
              {I18n.t("global.buttons.edit").toUpperCase()}
            </Label>
          )}
        </View>
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
