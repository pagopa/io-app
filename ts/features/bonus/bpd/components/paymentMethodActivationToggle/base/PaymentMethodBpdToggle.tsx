/* eslint-disable functional/immutable-data */
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
import * as React from "react";
import { useContext, useEffect, useRef } from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { NavigationContext } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../../components/core/typography/Body";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  bpdPaymentMethodActivation,
  BpdPaymentMethodActivation,
  BpdPmActivationStatus,
  bpdUpdatePaymentMethodActivation,
  HPan
} from "../../../store/actions/paymentMethods";
import { bpdPaymentMethodValueSelector } from "../../../store/reducers/details/paymentMethods";
import { BpdToggle } from "./BpdToggle";

// TODO: accept only hpan, read all the other information with a selector from payment methods
export type BpdToggleProps = {
  hPan: HPan;
  icon: ImageSourcePropType;
  caption: string;
  hasBpdCapability: boolean;
};

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  BpdToggleProps;

type GraphicalState = "loading" | "ready" | "update";

export type GraphicalValue = {
  state: GraphicalState;
  value: BpdPmActivationStatus | undefined;
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48
  },
  cardIcon: {
    width: 40,
    height: 25,
    overflow: "hidden",
    resizeMode: "contain"
  },
  leftSection: { flexDirection: "row", flex: 1 }
});

const retryTimeout = 5000 as Millisecond;
/**
 * This custom hook handles the load of the initial state and the retry in case of error.
 * TODO: refactor with  {@link useLoadPotValue}
 * @deprecated
 * @param props
 */
const useInitialValue = (props: Props) => {
  const timerRetry = useRef<number | undefined>(undefined);
  const navigation = useContext(NavigationContext);
  const retry = () => {
    timerRetry.current = undefined;
    props.loadActualValue(props.hPan);
  };

  /**
   * When the focus change, clear the timer (if any) and reset the value to undefined
   * focus: true  -> a new schedule is allowed
   * focus: false -> clear all the pending schedule
   */
  useEffect(() => {
    clearTimeout(timerRetry.current);
    timerRetry.current = undefined;
  }, [navigation.isFocused()]);

  useEffect(() => {
    // Initial state, request the state
    if (props.bpdPotActivation === pot.none) {
      props.loadActualValue(props.hPan);
    } else if (
      pot.isNone(props.bpdPotActivation) &&
      pot.isError(props.bpdPotActivation) &&
      timerRetry.current === undefined &&
      navigation.isFocused()
    ) {
      // If the pot is NoneError, the navigation focus is on the element
      // and no other retry are scheduled
      timerRetry.current = setTimeout(retry, retryTimeout);
    }
  }, [props.bpdPotActivation, timerRetry.current, navigation.isFocused()]);

  // Component unmount, clear scheduled
  useEffect(
    () => () => {
      clearTimeout(timerRetry.current);
    },
    []
  );
};

const loading: GraphicalValue = { state: "loading", value: undefined };

/**
 * Calculate the graphical state based on the pot possible states
 * @param potBpdActivation
 */
const calculateGraphicalState = (
  potBpdActivation: pot.Pot<BpdPaymentMethodActivation, Error>
): GraphicalValue =>
  pot.fold<BpdPaymentMethodActivation, Error, GraphicalValue>(
    potBpdActivation,
    () => loading,
    () => loading,
    _ => loading,
    _ => loading,
    value => ({ state: "ready", value: value.activationStatus }),
    value => ({ state: "loading", value: value.activationStatus }),
    (_, newValue) => ({
      state: "update",
      value: newValue.activationStatus
    }),
    value => ({ state: "ready", value: value.activationStatus })
  );

/**
 * This component represents the activation state of bpd on a payment method.
 * - Load the initial value (is bpd active on the payment method)
 * - The toggle allows the user to enable or disable bpd on the payment method
 * - Sync the remote communication with the graphical states
 * Bpd can also be "not activable" on the payment method:
 * - The payment method doesn't have the capability
 * - Bpd is already activate on the payment method by another user
 * @constructor
 */
const PaymentMethodActivationToggle: React.FunctionComponent<Props> = props => {
  // Calculate the graphical state based on the potActivation and capability
  const graphicalState: GraphicalValue = props.hasBpdCapability
    ? calculateGraphicalState(props.bpdPotActivation)
    : { state: "ready", value: "notActivable" };
  if (props.hasBpdCapability) {
    // trigger the initial loading / retry only if the method has the bpd capability
    useInitialValue(props);
  }

  return (
    <>
      <View style={styles.row}>
        <View style={styles.leftSection}>
          <Image source={props.icon} style={styles.cardIcon} />
          <View hspacer={true} />
          <Body>{props.caption}</Body>
        </View>
        <BpdToggle
          graphicalValue={graphicalState}
          // TODO: ask for user confirm when disable the bpd on payment method
          onValueChanged={b => props.updateValue(props.hPan, b)}
          // TODO: when onPress -> show bottomsheet explaining why the bpd cannot be activated
        />
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

const mapStateToProps = (state: GlobalState, props: BpdToggleProps) => ({
  bpdPotActivation: bpdPaymentMethodValueSelector(state, props.hPan)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodActivationToggle);
