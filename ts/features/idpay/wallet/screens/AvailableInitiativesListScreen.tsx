import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";

import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import {
  IOLogoPaymentType,
  LogoPayment
} from "../../../../components/core/logos";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  idpayInitiativesFromInstrumentRefreshEnd,
  idpayInitiativesFromInstrumentRefreshStart
} from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";

import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { IDPayInitiativesList } from "../components/IDPayInitiativesListComponents";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import React from "react";
import TypedI18n from "../../../../i18n";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import customVariables from "../../../../theme/variables";
import { idPayInitiativesFromInstrumentSelector } from "../store/reducers";
import { pipe } from "fp-ts/lib/function";
import { useFocusEffect } from "@react-navigation/native";
import { useIDPayInitiativesFromInstrument } from "../hooks/useIDPayInitiativesFromInstrument";

export type AvailableInitiativesListScreenNavigationParams = {
  idWallet: string;
};

type Props = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_IDPAY_INITIATIVE_LIST"
>;

const brandToLogoPaymentMap: Record<string, IOLogoPaymentType> = {
  MASTERCARD: "mastercard",
  VISA: "visa",
  AMEX: "amex",
  DINERS: "diners",
  MAESTRO: "maestro",
  VISAELECTRON: "visa",
  POSTEPAY: "postepay",
  UNIONPAY: "unionPay",
  DISCOVER: "discover",
  JCB: "jcb",
  JCB15: "jcb"
};

export const IdPayInitiativeListScreen = (props: Props) => {
  const { idWallet } = props.route.params;
  // const idpayInitiatives =useIOSelector(idPayInitiativesFromInstrumentSelector)
  const dispatch = useIODispatch();
  useFocusEffect(
    React.useCallback(() => {
      console.log("CALLBACK HOOOOK!!!!!");
      dispatch(
        idpayInitiativesFromInstrumentRefreshStart({
          idWallet,
          isRefreshCall: false
        })
      );
      return () => {
        dispatch(idpayInitiativesFromInstrumentRefreshEnd);
      };
    }, [idWallet, dispatch])
  );
  // useIDPayInitiativesFromInstrument(idWallet).initiativesList;
  const initiatives = useIOSelector(idPayInitiativesFromInstrumentSelector);
  const [maskedPan, brand, idpayInitiatives] = pipe(
    initiatives,
    pot.toOption,
    O.fold(
      () => undefined,
      res => [res.maskedPan, res.brand, res.initiativeList]
    )
  ) ?? [undefined, undefined, []];

  return (
    <BaseScreenComponent
      headerTitle={TypedI18n.t("idpay.wallet.initiativePairing.navigation")}
      goBack={true}
    >
      <ScrollView style={styles.container}>
        <H1>{TypedI18n.t("idpay.wallet.initiativePairing.header")}</H1>
        <VSpacer size={16} />
        {maskedPan && (
          <View style={[IOStyles.row, { paddingVertical: 8 }]}>
            <LogoPayment name={brandToLogoPaymentMap[brand]} />
            <HSpacer size={8} />
            <H4>•••• {maskedPan}</H4>
          </View>
        )}
        <VSpacer size={16} />
        <IDPayInitiativesList
          initiatives={idpayInitiatives}
          idWallet={idWallet}
        />
        <VSpacer size={24} />
      </ScrollView>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: customVariables.contentPadding
  }
});
