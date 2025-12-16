import { H3, H6, IOSkeleton, useIOTheme } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "i18next";
import { formatAmountText } from "../utils";

type Props = {
  totalAmount?: string;
  loading?: boolean;
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
          <IOSkeleton shape="rectangle" width={72} height={34} radius={8} />
        </View>
      )}
      {!loading && totalAmount && (
        <H3 testID="total-amount">{formatAmountText(totalAmount)}</H3>
      )}
    </View>
  );
};
