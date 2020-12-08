import { none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { InfoBox } from "../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../components/core/typography/H4";
import { Label } from "../../../../../../../components/core/typography/Label";
import { Link } from "../../../../../../../components/core/typography/Link";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import I18n from "../../../../../../../i18n";
import { navigateToWalletAddPaymentMethod } from "../../../../../../../store/actions/navigation";
import { fetchWalletsRequest } from "../../../../../../../store/actions/wallet/wallets";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { PaymentMethodGroupedList } from "../../../../components/paymentMethodActivationToggle/list/PaymentMethodGroupedList";
import {
  atLeastOnePaymentMethodHasBpdEnabledSelector,
  paymentMethodsWithActivationStatusSelector
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

const AddPaymentMethodButton = (props: { onPress: () => void }) => (
  <Button style={styles.addButton} onPress={props.onPress} bordered={true}>
    <Label color={"blue"}>
      {I18n.t("bonus.bpd.details.paymentMethods.add.cta")}
    </Label>
  </Button>
);

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
    <AddPaymentMethodButton onPress={props.addPaymentMethod} />
  </View>
);

const PaymentMethodNone = (props: Props) => (
  <>
    <View style={styles.row}>
      <H4>{I18n.t("wallet.paymentMethods")}</H4>
      <Link onPress={props.loadWallets}>
        {I18n.t("global.buttons.show").toLowerCase()}
      </Link>
    </View>

    <View spacer={true} large={true} />
    <View spacer={true} small={true} />
    <AddPaymentMethodButton onPress={props.addPaymentMethod} />
    <View spacer={true} small={true} />
  </>
);

const PaymentMethodError = (props: Props) => (
  <>
    <H4>{I18n.t("wallet.paymentMethods")}</H4>
    <View spacer={true} />
    <InfoBox iconColor={IOColors.red}>
      <Body>{I18n.t("bonus.bpd.details.paymentMethods.error")}</Body>
    </InfoBox>
    <View spacer={true} />
    <Button
      style={styles.addButton}
      onPress={props.loadWallets}
      bordered={true}
    >
      <Label color={"blue"}>{I18n.t("global.buttons.retry")}</Label>
    </Button>
  </>
);

const PaymentMethodSome = (props: Props) =>
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
      {!props.atLeastOnePaymentMethodActive &&
        props.potWallets.value.length > 0 && (
          <NoPaymentMethodAreActiveWarning />
        )}

      {props.potWallets.value.length > 0 ? (
        <PaymentMethodGroupedList paymentList={props.potWallets.value} />
      ) : (
        <NoPaymentMethodFound {...props} />
      )}
    </View>
  ) : null;

const addPaymentMethod = (action: () => void) =>
  Alert.alert(
    I18n.t("global.genericAlert"),
    I18n.t("bonus.bpd.details.paymentMethods.add.alertBody"),
    [
      {
        text: I18n.t("global.buttons.continue"),
        onPress: action
      },
      {
        text: I18n.t("global.buttons.cancel"),
        style: "cancel"
      }
    ]
  );

/**
 * Render all the wallet v2 as bpd toggle
 * TODO: temp implementation, raw list without loading and error state
 * @param props
 * @constructor
 */
const WalletPaymentMethodBpdList: React.FunctionComponent<Props> = props =>
  pot.fold(
    props.potWallets,
    () => <PaymentMethodNone {...props} />,
    () => (
      <>
        <View spacer={true} />
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
        />
        <View spacer={true} />
      </>
    ),
    _ => <PaymentMethodNone {...props} />,
    _ => <PaymentMethodError {...props} />,
    _ => <PaymentMethodSome {...props} />,
    _ => <PaymentMethodSome {...props} />,
    _ => <PaymentMethodSome {...props} />,
    _ => <PaymentMethodSome {...props} />
  );

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addPaymentMethod: () => {
    addPaymentMethod(() =>
      dispatch(navigateToWalletAddPaymentMethod({ inPayment: none }))
    );
  },
  loadWallets: () => dispatch(fetchWalletsRequest())
});

const mapStateToProps = (state: GlobalState) => ({
  potWallets: paymentMethodsWithActivationStatusSelector(state),
  atLeastOnePaymentMethodActive: atLeastOnePaymentMethodHasBpdEnabledSelector(
    state
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletPaymentMethodBpdList);
