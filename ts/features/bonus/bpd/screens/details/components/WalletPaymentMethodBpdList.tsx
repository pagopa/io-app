import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import { GlobalState } from "../../../../../../store/reducers/types";
import { walletV2Selector } from "../../../../../../store/reducers/wallet/wallets";
import { PaymentMethodBpdList } from "../../../components/PaymentMethodBpdList";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render all the wallet v2 as bpd toggle
 * TODO: temp implementation, raw list without loding and error state
 * @param props
 * @constructor
 */
const WalletPaymentMethodBpdList: React.FunctionComponent<Props> = props =>
  pot.isSome(props.potWallets) ? (
    <View>
      <H4>{I18n.t("wallet.paymentMethods")}</H4>
      <View spacer={true} />
      <PaymentMethodBpdList paymentList={props.potWallets.value} />
    </View>
  ) : null;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  potWallets: walletV2Selector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletPaymentMethodBpdList);
