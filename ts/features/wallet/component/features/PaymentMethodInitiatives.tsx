import * as React from "react";

import { StyleSheet, View } from "react-native";
import {
  idPayInitiativesFromInstrumentGet,
  idpayInitiativesFromInstrumentRefreshEnd,
  idpayInitiativesFromInstrumentRefreshStart
} from "../../../idpay/wallet/store/actions";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";

import { Body } from "../../../../components/core/typography/Body";
import { Dispatch } from "redux";
import { H3 } from "../../../../components/core/typography/H3";
import { HSpacer } from "../../../../components/core/spacer/Spacer";
import I18n from "../../../../i18n";
import { IDPayInitiativesList } from "../../../idpay/wallet/components/IDPayInitiativesListComponents";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import Initiative from "../../../../../img/wallet/initiatives.svg";
import { PaymentMethod } from "../../../../types/pagopa";
import ROUTES from "../../../../navigation/routes";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { connect } from "react-redux";
import { idPayEnabledInitiativesFromInstrumentSelector } from "../../../idpay/wallet/store/reducers";
import { useIDPayInitiativesFromInstrument } from "../../../idpay/wallet/hooks/useIDPayInitiativesFromInstrument";

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
    console.log("CALLBACK HOOOOK!!!!!");
    dispatch(
      idpayInitiativesFromInstrumentRefreshStart({
        idWallet: idWalletString,
        isRefreshCall: false
      })
    );
    return () => {
      dispatch(idpayInitiativesFromInstrumentRefreshEnd);
    };
  }, [idWalletString, dispatch])
);

const initiativesList = useIOSelector(
  idPayEnabledInitiativesFromInstrumentSelector
);

  const navigateToPairableInitiativesList = () =>
    navigation.navigate(ROUTES.WALLET_IDPAY_INITIATIVE_LIST, {
      idWallet: idWalletString
    });
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadIdpayInitiatives: (idWallet: string, isRefreshCall?: boolean) =>
    dispatch(
      idPayInitiativesFromInstrumentGet.request({
        idWallet,
        isRefreshCall
      })
    )
});

export default connect(mapDispatchToProps)(PaymentMethodInitiatives);
