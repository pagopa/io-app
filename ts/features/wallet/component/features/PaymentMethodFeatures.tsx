import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { PaymentMethod } from "../../../../types/pagopa";
import { idPayWalletInitiativeListSelector } from "../../../idpay/wallet/store/reducers";
import PaymentMethodInitiatives from "./PaymentMethodInitiatives";
import PaymentMethodSettings from "./PaymentMethodSettings";

type OwnProps = { paymentMethod: PaymentMethod };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  initiatives: {
    paddingBottom: 24
  }
});

/**
 * Display the features available for a payment method:
 * - vertical initiatives (eg: cashback, fa)
 * - global settings (payment capability, favourite, etc.)
 * @param props
 * @constructor
 */
const PaymentMethodFeatures: React.FunctionComponent<Props> = props => {
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);
  const initiativeListPot = useIOSelector(idPayWalletInitiativeListSelector);
  const namedInitiativesList = pot
    .getOrElse(initiativeListPot, [])
    .filter(initiative => initiative.initiativeName !== undefined);
  const shouldRenderIdPay = isIdPayEnabled && namedInitiativesList.length > 0;

  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const navigateToPairableInitiativesList = () =>
    navigation.navigate(ROUTES.WALLET_IDPAY_INITIATIVE_LIST, {
      initiatives: namedInitiativesList,
      idWallet: props.paymentMethod.idWallet
    });
  return (
    <>
      {shouldRenderIdPay ? (
        <>
          <ListItemComponent
            title="Configura iniziative IDPay"
            onPress={navigateToPairableInitiativesList}
          />
          <VSpacer size={24} />
        </>
      ) : null}
      <PaymentMethodInitiatives
        paymentMethod={props.paymentMethod}
        style={styles.initiatives}
      />
      <PaymentMethodSettings paymentMethod={props.paymentMethod} />
    </>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodFeatures);
