import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RemoteSwitch } from "../../../../components/core/selection/RemoteSwitch";
import {
  updatePaymentStatus,
  UpdatePaymentStatusPayload
} from "../../../../store/actions/wallet/wallets";
import { GlobalState } from "../../../../store/reducers/types";
import { getPaymentStatusById } from "../../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../../types/pagopa";

type OwnProps = {
  paymentMethod: PaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

/**
 * TypeGuard to extract the good payment status some(pot)
 * @param p
 */
const toOptionPot = (
  p: pot.Pot<boolean | undefined, Error>
): Option<pot.Pot<boolean, Error>> =>
  pot.fold(
    p,
    () => some(pot.none) as Option<pot.Pot<boolean, Error>>,
    () => some(pot.noneLoading),
    newVal => (newVal !== undefined ? some(pot.noneUpdating(newVal)) : none),
    error => some(pot.noneError(error)),
    value => (value !== undefined ? some(pot.some(value)) : none),
    value => (value !== undefined ? some(pot.someLoading(value)) : none),
    (olddValue, newValue) =>
      olddValue !== undefined && newValue !== undefined
        ? some(pot.someUpdating(olddValue, newValue))
        : none,
    (value, error) =>
      value !== undefined ? some(pot.someError(value, error)) : none
  );

/**
 * A switch that represent the current Payment status (enabled to payments) for a payment method.
 * The user can change the setting using this Switch.
 * @param props
 * @constructor
 */
const PaymentStatusSwitch = (props: Props): React.ReactElement | null => {
  const paymentMethodExists = toOptionPot(
    props.paymentStatus(props.paymentMethod.idWallet)
  );

  return paymentMethodExists.fold(null, val => <RemoteSwitch value={val} />);
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updatePaymentStatus: (payload: UpdatePaymentStatusPayload) =>
    dispatch(updatePaymentStatus.request(payload))
});
const mapStateToProps = (state: GlobalState) => ({
  paymentStatus: (id: number) => getPaymentStatusById(state, id)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentStatusSwitch);
