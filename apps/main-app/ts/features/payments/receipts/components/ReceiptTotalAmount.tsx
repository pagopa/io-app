import { H3, H6, IOSkeleton, useIOTheme } from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import { formatAmountText } from "../utils";

type Props = {
  loading?: boolean;
  totalAmount?: string;
};

export const ReceiptTotalAmount = ({ totalAmount, loading }: Props) => {
  const theme = useIOTheme();

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <H6 color={theme["textBody-tertiary"]}>
        {I18n.t("transaction.details.totalAmount")}
      </H6>
      {loading && (
        <View testID="loader">
          <IOSkeleton height={34} radius={8} shape="rectangle" width={72} />
        </View>
      )}
      {!loading && totalAmount && (
        <H3 testID="total-amount">{formatAmountText(totalAmount)}</H3>
      )}
    </View>
  );
};
