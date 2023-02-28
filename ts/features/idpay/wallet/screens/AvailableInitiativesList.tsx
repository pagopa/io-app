import * as pot from "@pagopa/ts-commons/lib/pot";
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
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import TypedI18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { IDPayInitiativeListItem } from "../components/IDPayInitiativesListItem";
import {
  idPayWalletInitiativesWithInstrumentSelector,
  idpayInitiativesListSelector
} from "../store/reducers";
import { InitiativesWithInstrumentDTO } from "../../../../../definitions/idpay/wallet/InitiativesWithInstrumentDTO";

export type AvailableInitiativesListScreenNavigationParams = {
  capabilityItems: ReadonlyArray<React.ReactNode>;
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
  const { capabilityItems } = props.route.params;

  const idpayInitiatives = useIOSelector(idpayInitiativesListSelector);

  const idpayInitiativesComponentList = idpayInitiatives.map(item => (
    <IDPayInitiativeListItem item={item} key={item.initiativeId} />
  ));
  const { brand, maskedPan } = pot.getOrElse(
    useIOSelector(idPayWalletInitiativesWithInstrumentSelector),
    {} as InitiativesWithInstrumentDTO
  );

  const listItems = [...capabilityItems, ...idpayInitiativesComponentList];

  return (
    <BaseScreenComponent
      headerTitle={TypedI18n.t("idpay.wallet.initiativePairing.navigation")}
      goBack={true}
    >
      <View style={IOStyles.horizontalContentPadding}>
        <H1>{TypedI18n.t("idpay.wallet.initiativePairing.header")}</H1>
        <VSpacer size={16} />
        {maskedPan && (
          <View style={IOStyles.row}>
            {brand !== undefined ? (
              <LogoPayment name={brandToLogoPaymentMap[brand]} />
            ) : null}
            <HSpacer size={8} />
            <H4>•••• {maskedPan}</H4>
          </View>
        )}
        <VSpacer size={16} />
      </View>
      <ScrollView style={IOStyles.horizontalContentPadding}>
        {listItems}
        <VSpacer size={24} />
      </ScrollView>
    </BaseScreenComponent>
  );
};
