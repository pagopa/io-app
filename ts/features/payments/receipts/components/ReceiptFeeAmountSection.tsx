import { Body, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import I18n from "../../../../i18n";
import { InfoNotice } from "../../../../../definitions/pagopa/biz-events/InfoNotice";
import { formatAmountText, isValidPspName } from "../utils";

type Props = {
  loading: boolean;
  transactionInfo?: InfoNotice;
};

const ReceiptFeeAmountSection = (props: Props) => {
  const { loading, transactionInfo } = props;

  if (loading) {
    return (
      <View style={IOStyles.flex} testID="loading-placeholder">
        <VSpacer size={4} />
        <Placeholder.Line width="100%" animate="fade" />
        <VSpacer size={8} />
        <Placeholder.Line width="50%" animate="fade" />
      </View>
    );
  }

  const pspName = transactionInfo?.pspName;

  if (transactionInfo?.fee !== undefined) {
    const formattedFee = formatAmountText(transactionInfo.fee);
    return (
      <Body>
        {I18n.t("transaction.details.totalFee")}{" "}
        <Body weight="Semibold">{formattedFee}</Body>{" "}
        {isValidPspName(pspName)
          ? // we want to make sure no empty string is passed either
            I18n.t("transaction.details.totalFeePsp", {
              pspName
            })
          : I18n.t("transaction.details.totalFeeNoPsp")}
      </Body>
    );
  }

  return (
    <Body>
      {isValidPspName(pspName)
        ? I18n.t("features.payments.transactions.details.totalFeeUnknown", {
            pspName
          })
        : I18n.t("features.payments.transactions.details.totalFeeUnknownPsp")}
    </Body>
  );
};

export default ReceiptFeeAmountSection;
