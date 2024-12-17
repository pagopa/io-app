import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";

import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { H2, H6, HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { LogoPaymentWithFallback } from "../../../../components/ui/utils/components/LogoPaymentWithFallback";
import TypedI18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import customVariables from "../../../../theme/variables";
import { IdPayInstrumentInitiativesList } from "../components/IdPayInstrumentInitiativesList";
import {
  idPayInitiativesFromInstrumentRefreshStart,
  idPayInitiativesFromInstrumentRefreshStop
} from "../store/actions";
import { idPayInitiativesFromInstrumentSelector } from "../store/reducers";

export type IdPayInstrumentInitiativesScreenRouteParams = {
  idWallet: string;
};

export const IdPayInstrumentInitiativesScreen = () => {
  const { idWallet } =
    useRoute<
      Route<
        "WALLET_IDPAY_INITIATIVE_LIST",
        IdPayInstrumentInitiativesScreenRouteParams
      >
    >().params;
  const dispatch = useIODispatch();
  const initiatives = useIOSelector(idPayInitiativesFromInstrumentSelector);

  useEffect(() => {
    dispatch(
      idPayInitiativesFromInstrumentRefreshStart({
        idWallet
      })
    );
    return () => {
      dispatch(idPayInitiativesFromInstrumentRefreshStop());
    };
  }, [idWallet, dispatch]);

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
        <H2>{TypedI18n.t("idpay.wallet.initiativePairing.header")}</H2>
        <VSpacer size={16} />
        {maskedPan && (
          <View style={[IOStyles.row, { paddingVertical: 8 }]}>
            <LogoPaymentWithFallback brand={brand} />
            <HSpacer size={8} />
            <H6>•••• {maskedPan}</H6>
          </View>
        )}
        <VSpacer size={16} />
        <IdPayInstrumentInitiativesList
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
