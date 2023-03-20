import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { InfoBox } from "../../../../../../../components/box/InfoBox";
import { VSpacer } from "../../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../components/core/typography/H4";
import { Link } from "../../../../../../../components/core/typography/Link";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import I18n from "../../../../../../../i18n";
import { navigateToWalletAddPaymentMethod } from "../../../../../../../store/actions/navigation";
import { fetchWalletsRequestWithExpBackoff } from "../../../../../../../store/actions/wallet/wallets";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { showToast } from "../../../../../../../utils/showToast";
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
  }
});

const Spinner = () => (
  <ActivityIndicator
    color={"black"}
    accessible={false}
    importantForAccessibility={"no-hide-descendants"}
    accessibilityElementsHidden={true}
  />
);

const UpdateLabel = (props: Props & { caption: string }) =>
  pot.isLoading(props.potWallets) ? (
    <Spinner />
  ) : (
    <Link onPress={props.loadWallets}>{props.caption}</Link>
  );

/**
 * No payment methods are active
 * @constructor
 */
const NoPaymentMethodAreActiveWarning = () => (
  <View>
    <InfoBox>
      <Body>{I18n.t("bonus.bpd.details.paymentMethods.noActiveMethod")}</Body>
    </InfoBox>
    <VSpacer size={8} />
  </View>
);

/**
 * No payment methods are found
 * @constructor
 */
const NoPaymentMethodFound = () => (
  <View>
    <InfoBox>
      <Body>{I18n.t("bonus.bpd.details.paymentMethods.noPaymentMethods")}</Body>
    </InfoBox>
  </View>
);

/**
 * The wallet is none
 * @param props
 * @constructor
 */
const PaymentMethodNone = (props: Props) => (
  <>
    <View style={styles.row}>
      <H4>{I18n.t("wallet.paymentMethods")}</H4>
      <UpdateLabel
        {...props}
        caption={I18n.t("global.buttons.show").toLowerCase()}
      />
    </View>
  </>
);

/**
 * The wallet is error
 * @param props
 * @constructor
 */
const PaymentMethodError = (props: Props) => (
  <>
    <View style={styles.row}>
      <H4>{I18n.t("wallet.paymentMethods")}</H4>
      <UpdateLabel
        {...props}
        caption={I18n.t("global.buttons.update").toLowerCase()}
      />
    </View>
    <VSpacer size={16} />
    <InfoBox iconColor={IOColors.red}>
      <Body>{I18n.t("bonus.bpd.details.paymentMethods.error")}</Body>
    </InfoBox>
  </>
);

/**
 * The wallet is some
 * @param props
 * @constructor
 */
const PaymentMethodSome = (props: Props) =>
  pot.isSome(props.potWallets) ? (
    <View>
      <View style={styles.row}>
        <H4>{I18n.t("wallet.paymentMethods")}</H4>
        <UpdateLabel
          {...props}
          caption={I18n.t("global.buttons.update").toLowerCase()}
        />
      </View>
      <VSpacer size={16} />
      {!props.atLeastOnePaymentMethodActive &&
        props.potWallets.value.length > 0 && (
          <NoPaymentMethodAreActiveWarning />
        )}

      {props.potWallets.value.length > 0 ? (
        <PaymentMethodGroupedList paymentList={props.potWallets.value} />
      ) : (
        <NoPaymentMethodFound />
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
 * @param props
 * @constructor
 */
const WalletPaymentMethodBpdList: React.FunctionComponent<Props> = props => {
  const [potState, setPotCurrentState] = useState(props.potWallets.kind);
  const { potWallets } = props;

  useEffect(() => {
    if (potWallets.kind !== potState) {
      setPotCurrentState(potWallets.kind);
      if (pot.isError(potWallets)) {
        showToast(I18n.t("global.genericError"), "danger");
      }
    }
  }, [potWallets, potState]);

  return pot.fold(
    props.potWallets,
    () => <PaymentMethodNone {...props} />,
    () => <PaymentMethodNone {...props} />,
    _ => <PaymentMethodNone {...props} />,
    _ => <PaymentMethodError {...props} />,
    _ => <PaymentMethodSome {...props} />,
    _ => <PaymentMethodSome {...props} />,
    _ => <PaymentMethodSome {...props} />,
    _ => <PaymentMethodSome {...props} />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addPaymentMethod: () => {
    addPaymentMethod(() =>
      navigateToWalletAddPaymentMethod({ inPayment: O.none })
    );
  },
  loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff())
});

const mapStateToProps = (state: GlobalState) => ({
  potWallets: paymentMethodsWithActivationStatusSelector(state),
  atLeastOnePaymentMethodActive:
    atLeastOnePaymentMethodHasBpdEnabledSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletPaymentMethodBpdList);
