import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../components/core/typography/Body";
import { GlobalState } from "../../../../../../store/reducers/types";
import { walletV2Selector } from "../../../../../../store/reducers/wallet/wallets";
import { PaymentMethodBpdList } from "../../../components/PaymentMethodBpdList";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Render all the wallet v2 as bpd toggle
 * TODO: temp implementation, raw list without loading and error state
 * @param props
 * @constructor
 */
const WalletPaymentMethodBpdList: React.FunctionComponent<Props> = props =>
  pot.isSome(props.potWallets) ? (
    <View>
      <H4>{I18n.t("wallet.paymentMethods")}</H4>
      <View spacer={true} />
      {props.potWallets.value.length > 0 ? (
        <PaymentMethodBpdList paymentList={props.potWallets.value} />
      ) : (
        <InfoBox>
          <Body>
            {I18n.t("bonus.bpd.details.paymentMethods.noPaymentMethods")}
          </Body>
        </InfoBox>
      )}
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
