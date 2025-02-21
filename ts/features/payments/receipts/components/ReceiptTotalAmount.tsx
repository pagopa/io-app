import Placeholder from "rn-placeholder";
import { View } from "react-native";
import { H3, H6, IOStyles, useIOTheme } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { formatAmountText } from "../utils";

type Props = {
  totalAmount?: string;
  loading?: boolean;
};

export const ReceiptTotalAmount = ({ totalAmount, loading }: Props) => {
  const theme = useIOTheme();

  return (
    <View
      style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter, IOStyles.flex]}
    >
      <H6 color={theme["textBody-tertiary"]}>
        {I18n.t("transaction.details.totalAmount")}
      </H6>
      {loading && (
        <View testID="loader">
          <Placeholder.Box width={72} height={34} animate="fade" radius={8} />
        </View>
      )}
      {!loading && totalAmount && (
        <H3 testID="total-amount">{formatAmountText(totalAmount)}</H3>
      )}
    </View>
  );
};
