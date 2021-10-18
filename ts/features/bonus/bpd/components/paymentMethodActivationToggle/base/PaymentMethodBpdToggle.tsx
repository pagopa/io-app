/* eslint-disable functional/immutable-data */
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { fetchPaymentManagerLongTimeout } from "../../../../../../config";
import { GlobalState } from "../../../../../../store/reducers/types";
import { useNavigationContext } from "../../../../../../utils/hooks/useOnFocus";
import {
  bpdPaymentMethodActivation,
  BpdPaymentMethodActivation,
  BpdPmActivationStatus,
  bpdUpdatePaymentMethodActivation,
  HPan
} from "../../../store/actions/paymentMethods";
import { bpdPaymentMethodValueSelector } from "../../../store/reducers/details/paymentMethods";
import { useChangeActivationConfirmationBottomSheet } from "../bottomsheet/BpdChangeActivationConfirmationScreen";
import {
  NotActivableType,
  useNotActivableInformationBottomSheet
} from "../bottomsheet/BpdNotActivableInformation";
import { BpdToggle } from "./BpdToggle";
import { PaymentMethodRepresentationComponent } from "./PaymentMethodRepresentationComponent";

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

/**
 * This custom hook handles the load of the initial state and the retry in case of error.
 * TODO: refactor with  {@link useLoadPotValue}
 * @deprecated
 * @param props
 */
const useInitialValue = (props: Props) => {
  const timerRetry = useRef<number | undefined>(undefined);
  const navigation = useNavigationContext();
  const isFocused = navigation.isFocused();
  const { bpdPotActivation, hPan, loadActualValue, hasBpdCapability } = props;

  const retry = useCallback(() => {
    timerRetry.current = undefined;
    if (hasBpdCapability) {
      loadActualValue(hPan);
    }
  }, [loadActualValue, hPan, hasBpdCapability]);

  /**
   * When the focus change, clear the timer (if any) and reset the value to undefined
   * focus: true  -> a new schedule is allowed
   * focus: false -> clear all the pending schedule
   */

  useEffect(() => {
    clearTimeout(timerRetry.current);
    timerRetry.current = undefined;
  }, [isFocused]);

  useEffect(() => {
    if (!hasBpdCapability) {
      return;
    }
    // Initial state, request the state
    if (bpdPotActivation === pot.none) {
      loadActualValue(hPan);
    } else if (
      pot.isNone(bpdPotActivation) &&
      pot.isError(bpdPotActivation) &&
      timerRetry.current === undefined &&
      isFocused
    ) {
      // If the pot is NoneError, the navigation focus is on the element
      // and no other retry are scheduled
      timerRetry.current = setTimeout(retry, fetchPaymentManagerLongTimeout);
    }
  }, [
    bpdPotActivation,
    hPan,
    loadActualValue,
    retry,
    isFocused,
    hasBpdCapability
  ]);

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
export const calculateBpdToggleGraphicalState = (
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
    ? calculateBpdToggleGraphicalState(props.bpdPotActivation)
    : { state: "ready", value: "notActivable" };

  // trigger the initial loading / retry
  useInitialValue(props);

  // a simplification because the onPress is dispatched only when is not activable / compatible
  const notActivableType: NotActivableType = !props.hasBpdCapability
    ? "NotCompatible"
    : "NotActivable";

  const askConfirmation =
    useChangeActivationConfirmationBottomSheet(props).present;

  const showExplanation = useNotActivableInformationBottomSheet(props).present;

  return (
    <>
      <View style={styles.row}>
        <PaymentMethodRepresentationComponent
          icon={props.icon}
          caption={props.caption}
        />
        <BpdToggle
          graphicalValue={graphicalState}
          onValueChanged={newVal =>
            askConfirmation(newVal, () => props.updateValue(props.hPan, newVal))
          }
          onPress={() => showExplanation(notActivableType)}
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
