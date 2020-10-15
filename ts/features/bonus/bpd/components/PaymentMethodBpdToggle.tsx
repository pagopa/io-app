import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../img/wallet/cards-icons/pagobancomat.png";
import { Body } from "../../../../components/core/typography/Body";
import { IOColors } from "../../../../components/core/variables/IOColors";
import IconFont from "../../../../components/ui/IconFont";
import Switch from "../../../../components/ui/Switch";
import { GlobalState } from "../../../../store/reducers/types";
import { fold, getValue, isUndefined, RemoteValue } from "../model/RemoteValue";
import {
  bpdPaymentMethodActivation,
  BpdPaymentMethodActivation,
  BpdPmActivationStatus,
  bpdUpdatePaymentMethodActivation,
  HPan
} from "../store/actions/paymentMethods";
import {
  bpdPaymentMethodActualValueSelector,
  bpdPaymentMethodUpsertValueSelector
} from "../store/reducers/details/paymentMethods";

type OwnProps = { hpan: HPan };

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48
  },
  cardIcon: {
    width: 40,
    height: 25
  }
});

type GraphicalState = "loading" | "ready" | "notActivable" | "update";

const calculateGraphicalState = (
  actualValue: RemoteValue<BpdPaymentMethodActivation, Error>,
  upsertValue: RemoteValue<null, any>
): GraphicalState =>
  fold<BpdPaymentMethodActivation, Error, GraphicalState>(
    () => "loading",
    () => "loading",
    value =>
      value.activationStatus === "notActivable" ? "notActivable" : "ready",
    _ => "loading"
  )(actualValue);

const renderToggle = (
  state: GraphicalState,
  value: BpdPmActivationStatus | undefined,
  onValueChanged: (b: boolean) => void
) => {
  switch (state) {
    case "loading":
      return (
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
        />
      );

    case "notActivable":
      return <IconFont name={"io-notice"} size={24} color={IOColors.blue} />;
    case "ready":
    case "update":
      return (
        <Switch
          value={value === "active"}
          disabled={state === "update"}
          onValueChange={onValueChanged}
        />
      );
  }
};

/**
 * This component represents the activation state of bpd on a payment method.
 * - Load the initial value (is bpd active on the payment method)
 * - The toggle allows the user to enable or disable bpd on the payment method
 * - Sync the remote communication with the graphical states
 * @constructor
 */
const PaymentMethodBpdToggle: React.FunctionComponent<Props> = props => {
  const remoteValue = props.remoteValue;
  const upsertValue = props.upsertValue;
  const value = fromNullable(getValue(remoteValue))
    .map(v => v.activationStatus)
    .toUndefined();
  const graphicalState = calculateGraphicalState(remoteValue, upsertValue);
  useEffect(() => {
    if (isUndefined(remoteValue)) {
      props.loadActualValue(props.hpan);
    }
  }, [props.remoteValue]);

  return (
    <>
      <View style={styles.row}>
        <View style={{ flexDirection: "row", flex: 1 }}>
          <Image source={image} style={styles.cardIcon} />
          <View hspacer={true} />
          <Body>Intesa San Paolo </Body>
        </View>
        {renderToggle(graphicalState, value, b =>
          props.updateValue(props.hpan, b)
        )}
      </View>
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadActualValue: (hPan: HPan) =>
    dispatch(bpdPaymentMethodActivation.request(hPan)),
  updateValue: (hPan: HPan, value: boolean) =>
    dispatch(bpdUpdatePaymentMethodActivation.request({ hPan, value }))
});

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  remoteValue: bpdPaymentMethodActualValueSelector(state, props.hpan),
  upsertValue: bpdPaymentMethodUpsertValueSelector(state, props.hpan)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodBpdToggle);
