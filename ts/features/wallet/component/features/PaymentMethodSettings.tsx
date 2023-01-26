import * as React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { HSpacer } from "../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../components/core/typography/H3";
import { IOColors } from "../../../../components/core/variables/IOColors";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import IconFont from "../../../../components/ui/IconFont";
import FavoritePaymentMethodSwitch from "../../../../components/wallet/FavoriteMethodSwitch";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { PaymentMethod } from "../../../../types/pagopa";
import { isEnabledToPay } from "../../../../utils/paymentMethodCapabilities";
import PagoPaPaymentCapability from "./PagoPaPaymentCapability";

type OwnProps = { paymentMethod: PaymentMethod };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  icon: { alignSelf: "center" },
  row: { flex: 1, flexDirection: "row" }
});

/**
 * This component allows the user to choose and change the common settings for a payment methods
 * The {@link FavoritePaymentMethodSwitch} should be rendered only if the payment method has the capability pagoPA and
 * the payment are active (paymentMethod.pagoPA === true)
 * @param props
 * @constructor
 */
const PaymentMethodSettings = (props: Props): React.ReactElement => (
  <>
    <View style={styles.row}>
      <IconFont
        name={"io-preferenze"}
        size={20}
        color={IOColors.bluegreyDark}
        style={styles.icon}
      />
      <HSpacer size={16} />
      <H3 color={"bluegrey"}>{I18n.t("global.buttons.settings")}</H3>
    </View>
    <PagoPaPaymentCapability paymentMethod={props.paymentMethod} />
    <ItemSeparatorComponent noPadded={true} />
    {isEnabledToPay(props.paymentMethod) && (
      <>
        <FavoritePaymentMethodSwitch paymentMethod={props.paymentMethod} />
        <ItemSeparatorComponent noPadded={true} />
      </>
    )}
  </>
);

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodSettings);
