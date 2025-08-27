import {
  Divider,
  H3,
  H6,
  IOSkeleton,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "i18next";
import { formatNumberCurrencyCentsOrDefault } from "../../../idpay/common/utils/strings";

type TotalAmountSectionProps = {
  totalAmount?: number;
  loading?: boolean;
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
            <IOSkeleton shape="rectangle" width={72} height={34} radius={8} />
          </View>
        )}
        {!loading && <H3>{formatNumberCurrencyCentsOrDefault(totalAmount)}</H3>}
      </View>
      <Divider />
    </>
  );
};
