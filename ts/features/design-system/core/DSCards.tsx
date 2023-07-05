import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";

/* Types */
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { PaymentCard } from "../../../components/ui/PaymentCard";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  }
});

const onPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSCards = () => (
  <DesignSystemScreen title={"Cards"}>
    <DSComponentViewerBox name="size=small">
      <View style={styles.content}>
        <PaymentCard hpan="9999" isError={false} size="small" />
        <HSpacer size={16} />
        <PaymentCard
          cardIcon="payPal"
          hpan="9999"
          isError={false}
          size="small"
          onCardPress={onPress}
        />
      </View>
      <VSpacer size={16} />
      <View style={styles.content}>
        <PaymentCard
          hpan="9999"
          isError={true}
          size="small"
          onCardPress={onPress}
        />
        <HSpacer size={16} />
        <PaymentCard
          cardIcon="mastercard"
          hpan="9999"
          isError={true}
          size="small"
          onCardPress={onPress}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="size=big">
      <PaymentCard
        hpan="9999"
        cardType={"CREDIT"}
        holderName="Mario Rossi"
        size="big"
        cardIcon="mastercard"
        expirationDate={new Date()}
        onCardPress={onPress}
      />
      <VSpacer size={16} />
      <PaymentCard
        hpan="9999"
        cardType={"PAGOBANCOMAT"}
        expirationDate={new Date()}
        holderName="Mario Rossi"
        cardIcon="vPay"
        abiCode="12345"
        size="big"
      />
      <VSpacer size={16} />
      <PaymentCard
        hpan="9999"
        cardType={"PAYPAL"}
        holderEmail="userPaypalEmail@email.com"
        size="big"
      />
      <VSpacer size={16} />
      <PaymentCard
        hpan="9999"
        cardType={"COBADGE"}
        holderName="Mario Rossi"
        abiCode="12345"
        expirationDate={new Date()}
        cardIcon="visa"
        size="big"
      />
      <VSpacer size={16} />
      <PaymentCard
        hpan="9999"
        cardType={"BANCOMATPAY"}
        expirationDate={new Date()}
        holderName="Mario Rossi"
        cardIcon="vPay"
        phoneNumber="+39 1234567890"
        size="big"
      />
    </DSComponentViewerBox>
  </DesignSystemScreen>
);
