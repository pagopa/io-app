import {
  Divider,
  H3,
  H6,
  IOSkeleton,
  IOStyles
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { formatNumberCurrencyCentsOrDefault } from "../../../idpay/common/utils/strings";

type TotalAmountSectionProps = {
  totalAmount?: number;
  loading?: boolean;
};

const styles = StyleSheet.create({
  container: {
    ...IOStyles.rowSpaceBetween,
    ...IOStyles.alignCenter,
    ...IOStyles.flex,
    paddingVertical: 16
  }
});

export const WalletPaymentTotalAmount = ({
  totalAmount,
  loading
}: TotalAmountSectionProps) => (
  <>
    <View style={styles.container}>
      <H6 color="grey-700">{I18n.t("payment.confirm.totalAmount")}</H6>
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
