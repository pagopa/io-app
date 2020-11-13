import { none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { InfoBox } from "../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../components/core/typography/H4";
import { Label } from "../../../../../../../components/core/typography/Label";
import { Link } from "../../../../../../../components/core/typography/Link";
import I18n from "../../../../../../../i18n";
import { navigateToWalletAddPaymentMethod } from "../../../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { PaymentMethodGroupedList } from "../../../../components/paymentMethodActivationToggle/list/PaymentMethodGroupedList";
import {
  atLeastOnePaymentMethodHasBpdEnabledSelector,
  walletV2WithActivationStatusSelector
} from "../../../../store/reducers/details/combiner";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  addButton: {
    width: "100%"
  }
});

const NoPaymentMethodAreActiveWarning = () => (
  <View>
    <InfoBox>
      <Body>{I18n.t("bonus.bpd.details.paymentMethods.noActiveMethod")}</Body>
    </InfoBox>
    <View spacer={true} small={true} />
  </View>
);

const NoPaymentMethodFound = (props: Props) => (
  <View>
    <InfoBox>
      <Body>{I18n.t("bonus.bpd.details.paymentMethods.noPaymentMethods")}</Body>
    </InfoBox>
    <View spacer={true} />
    <Button style={styles.addButton} onPress={props.addPaymentMethod}>
      <Label color={"white"}>{I18n.t("wallet.addPaymentMethodTitle")}</Label>
    </Button>
  </View>
);

/**
 * Render all the wallet v2 as bpd toggle
 * TODO: temp implementation, raw list without loading and error state
 * @param props
 * @constructor
 */
const WalletPaymentMethodBpdList: React.FunctionComponent<Props> = props =>
  pot.isSome(props.potWallets) ? (
    <View>
      <View style={styles.row}>
        <H4>{I18n.t("wallet.paymentMethods")}</H4>
        {props.potWallets.value.length > 0 && (
          <Link onPress={props.addPaymentMethod}>
            {I18n.t("global.buttons.add").toLowerCase()}
          </Link>
        )}
      </View>
      <View spacer={true} />
      {!props.atLeastOnePaymentMethodActive && (
        <NoPaymentMethodAreActiveWarning />
      )}

      {props.potWallets.value.length > 0 ? (
        <PaymentMethodGroupedList paymentList={props.potWallets.value} />
      ) : (
        <NoPaymentMethodFound {...props} />
      )}
    </View>
  ) : null;

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addPaymentMethod: () => {
    dispatch(navigateToWalletAddPaymentMethod({ inPayment: none }));
  }
});

const mapStateToProps = (state: GlobalState) => ({
  potWallets: walletV2WithActivationStatusSelector(state),
  atLeastOnePaymentMethodActive: atLeastOnePaymentMethodHasBpdEnabledSelector(
    state
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletPaymentMethodBpdList);
