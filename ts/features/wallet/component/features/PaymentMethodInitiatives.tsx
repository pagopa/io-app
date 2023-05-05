import * as React from "react";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Initiative from "../../../../../img/wallet/initiatives.svg";
import { HSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentMethod } from "../../../../types/pagopa";
import { IDPayInitiativesList } from "../../../idpay/wallet/components/IDPayInitiativesListComponents";
import {
  idPayInitiativesFromInstrumentRefreshStart,
  idPayInitiativesFromInstrumentRefreshStop
} from "../../../idpay/wallet/store/actions";
import { idPayEnabledInitiativesFromInstrumentSelector } from "../../../idpay/wallet/store/reducers";

type OwnProps = {
  paymentMethod: PaymentMethod;
} & Pick<React.ComponentProps<typeof View>, "style">;

type Props = ReturnType<typeof mapDispatchToProps> & OwnProps;

const styles = StyleSheet.create({
  icon: { alignSelf: "center" },
  row: { flex: 1, flexDirection: "row" }
});

/**
 * This component enlists the different initiatives active on the payment methods
 * @param props
 * @constructor
 */
const PaymentMethodInitiatives = (props: Props): React.ReactElement | null => {
  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const idWalletString = String(props.paymentMethod.idWallet);

  const dispatch = useIODispatch();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        idPayInitiativesFromInstrumentRefreshStart({
          idWallet: idWalletString,
          refreshEvery: 3000
        })
      );
    }, [idWalletString, dispatch])
  );

  React.useEffect(
    () => () => {
      // We stop thre fresh loop only when unmounting the component.
      // Stopping the loop when losing focus will lead to unexpected behaviours
      dispatch(idPayInitiativesFromInstrumentRefreshStop());
    },
    [dispatch]
  );

  const initiativesList = useIOSelector(
    idPayEnabledInitiativesFromInstrumentSelector
  );

  const navigateToPairableInitiativesList = () => {
    // Before navigate to the full list screen we need to stop the refresh logic
    dispatch(idPayInitiativesFromInstrumentRefreshStop());
    navigation.navigate(ROUTES.WALLET_IDPAY_INITIATIVE_LIST, {
      idWallet: idWalletString
    });
  };
  return initiativesList.length > 0 ? (
    <View testID="idPayInitiativesList" style={props.style}>
      <View style={styles.row}>
        <View style={styles.row}>
          <Initiative
            width={20}
            height={20}
            stroke={IOColors.bluegreyDark}
            style={styles.icon}
          />
          <HSpacer size={16} />
          <H3 color={"bluegrey"}>{I18n.t("wallet.capability.title")}</H3>
        </View>
        <Body
          weight="SemiBold"
          color="blue"
          onPress={navigateToPairableInitiativesList}
        >
          {I18n.t("idpay.wallet.preview.showAll")}
        </Body>
      </View>
      <IDPayInitiativesList
        idWallet={idWalletString}
        initiatives={initiativesList.slice(0, 3)}
      />
    </View>
  ) : null;
};

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(mapDispatchToProps)(PaymentMethodInitiatives);
