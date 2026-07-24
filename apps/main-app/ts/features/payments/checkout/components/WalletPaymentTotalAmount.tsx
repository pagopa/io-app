import { Divider, H3, H6, IOSkeleton, useIOTheme } from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import { formatNumberCurrencyCentsOrDefault } from "../../../idpay/common/utils/strings";

type TotalAmountSectionProps = {
  loading?: boolean;
  totalAmount?: number;
};

export const WalletPaymentTotalAmount = ({
  totalAmount,
  loading
}: TotalAmountSectionProps) => {
  const theme = useIOTheme();

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          flex: 1,
          paddingVertical: 16
        }}
      >
        <H6 color={theme["textHeading-tertiary"]}>
          {I18n.t("payment.confirm.totalAmount")}
        </H6>
        {loading && (
          <View>
            <IOSkeleton height={34} radius={8} shape="rectangle" width={72} />
          </View>
        )}
        {!loading && <H3>{formatNumberCurrencyCentsOrDefault(totalAmount)}</H3>}
      </View>
      <Divider />
    </>
  );
};
