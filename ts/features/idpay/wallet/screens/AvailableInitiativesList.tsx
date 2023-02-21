import React from "react";
import { ScrollView, View } from "react-native";
import { InitiativeDTO } from "../../../../../definitions/idpay/wallet/InitiativeDTO";
import {
  IOLogoPaymentType,
  LogoPayment
} from "../../../../components/core/logos";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import TypedI18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { creditCardByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";

export type AvailableInitiativesListScreenNavigationParams = {
  initiatives: Array<React.ReactNode>;
  idWallet: number;
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
  const { initiatives, idWallet } = props.route.params;
  const maybeCreditCard = useIOSelector(state =>
    creditCardByIdSelector(state, idWallet)
  );

  return (
    <BaseScreenComponent
      headerTitle={TypedI18n.t("idpay.wallet.initiativePairing.navigation")}
      goBack={true}
    >
      <View style={IOStyles.horizontalContentPadding}>
        <H1>{TypedI18n.t("idpay.wallet.initiativePairing.header")}</H1>
        <VSpacer size={8} />
        {maybeCreditCard && (
          <CreditCardComponent creditCard={maybeCreditCard} />
        )}
        <VSpacer size={16} />
      </View>
      <ScrollView style={IOStyles.horizontalContentPadding}>
        {initiatives}
        <VSpacer size={24} />
      </ScrollView>
    </BaseScreenComponent>
  );
};

const CreditCardComponent = ({
  creditCard
}: {
  creditCard: CreditCardPaymentMethod;
}) => {
  const { brand } = creditCard.info;
  return (
    <View style={IOStyles.row}>
      {brand !== undefined ? (
        <LogoPayment name={brandToLogoPaymentMap[brand]} />
      ) : null}
      <HSpacer size={8} />
      <H4>•••• {creditCard.info.blurredNumber}</H4>
    </View>
  );
};
