import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView, View } from "react-native";
import {
  IOLogoPaymentType,
  LogoPayment
} from "../../../../components/core/logos";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import TypedI18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IDPayInitiativesList } from "../components/IDPayInitiativesListComponents";
import { idPayInitiativesFromInstrumentGet } from "../store/actions";
import {
  idPayAreInitiativesFromInstrumentErrorSelector,
  idPayInitiativesFromInstrumentSelector
} from "../store/reducers";
import { BaseHeader } from "../../../../components/screens/BaseHeader";

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
  const initiatives = useIOSelector(idPayInitiativesFromInstrumentSelector);
  const [idpayInitiatives, maskedPan, brand] = pipe(
    initiatives,
    pot.toOption,
    O.fold(
      () => undefined,
      res => [res.initiativeList, res.maskedPan, res.brand]
    )
  ) ?? [[], undefined, undefined];
  const dispatch = useIODispatch();
  const areInitiativesInError = useIOSelector(
    idPayAreInitiativesFromInstrumentErrorSelector
  );

  React.useEffect(() => {
    const timer = setInterval(
      () =>
        dispatch(
          idPayInitiativesFromInstrumentGet.request({
            idWallet,
            isRefreshCall: true
          })
        ),
      areInitiativesInError ? 6000 : 3000
    );
    return () => clearInterval(timer);
  }, [dispatch, idWallet, areInitiativesInError]);

  return (
    <>
      <BaseHeader
        headerTitle={TypedI18n.t("idpay.wallet.initiativePairing.navigation")}
        goBack={true}
      />
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
          <H1>{TypedI18n.t("idpay.wallet.initiativePairing.header")}</H1>
          <VSpacer size={16} />
          {maskedPan && (
            <View style={IOStyles.row}>
              <LogoPayment name={brandToLogoPaymentMap[brand]} />
              <HSpacer size={8} />
              <H4>•••• {maskedPan}</H4>
            </View>
          )}
          <VSpacer size={16} />
        </View>
        <View style={IOStyles.horizontalContentPadding}>
          <IDPayInitiativesList
            initiatives={idpayInitiatives}
            idWallet={idWallet}
          />
          <VSpacer size={24} />
        </View>
      </ScrollView>
    </>
  );
};
