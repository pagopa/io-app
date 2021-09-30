import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RemoteSwitch } from "../../../../components/core/selection/RemoteSwitch";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyleVariables } from "../../../../components/core/variables/IOStyleVariables";
import IconFont from "../../../../components/ui/IconFont";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import {
  fetchWalletsRequestWithExpBackoff,
  updatePaymentStatus,
  UpdatePaymentStatusPayload
} from "../../../../store/actions/wallet/wallets";
import { GlobalState } from "../../../../store/reducers/types";
import { getPaymentStatusById } from "../../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../../types/pagopa";
import { showToast } from "../../../../utils/showToast";

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
    (oldValue, newValue) =>
      oldValue !== undefined && newValue !== undefined
        ? some(pot.someUpdating(oldValue, newValue))
        : none,
    (value, error) =>
      value !== undefined ? some(pot.someError(value, error)) : none
  );

/**
 * This should never happens, track the error and display a close icon
 * @constructor
 */
const Fallback = () => {
  void mixpanelTrack("PAYMENT_STATUS_SWITCH_ID_NOT_IN_WALLET_LIST");
  return (
    <View style={{ paddingLeft: IOStyleVariables.switchWidth - 24 }}>
      <IconFont name={"io-close"} size={24} color={IOColors.blue} />
    </View>
  );
};
/**
 * A switch that represent the current Payment status (enabled to payments) for a payment method.
 * The user can change the setting using this Switch.
 * @param props
 * @constructor
 */
const PaymentStatusSwitch = (props: Props): React.ReactElement | null => {
  // Should never be none, this will happens only if the idWallet is not in the walletList
  const maybePaymentMethod = props.paymentStatus(props.paymentMethod.idWallet);
  const paymentMethodExists = toOptionPot(maybePaymentMethod);

  const isError = pot.isError(maybePaymentMethod);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (!isFirstRender.current) {
      if (isError) {
        showToast(I18n.t("global.actions.retry"), "danger");
      }
    } else {
      // eslint-disable-next-line functional/immutable-data
      isFirstRender.current = false;
    }
  }, [isError]);

  return paymentMethodExists.fold(<Fallback />, val => (
    <RemoteSwitch
      testID={"PaymentStatusSwitch"}
      value={val}
      onRetry={props.loadWallets}
      onValueChange={newVal =>
        props.updatePaymentStatus({
          paymentEnabled: newVal,
          idWallet: props.paymentMethod.idWallet
        })
      }
    />
  ));
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff()),
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
