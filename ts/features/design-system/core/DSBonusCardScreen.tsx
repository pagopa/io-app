import { H2 } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert } from "react-native";
import { BonusCardScreenComponent } from "../../../components/BonusCard";

const DSBonusCardScreen = () => (
  <BonusCardScreenComponent
    logoUri={{
      uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
    }}
    name="18app"
    organizationName="Ministero della Cultura"
    status="PAUSED"
    endDate={new Date()}
    counters={[
      {
        type: "ValueWithProgress",
        label: "Disponibile",
        value: "9.999,99 €",
        progress: 0.2
      },
      {
        type: "Value",
        label: "Da rimborsare",
        value: "9.999,99 €"
      }
    ]}
    secondAction={{
      icon: "info",
      onPress: () => {
        Alert.alert("info");
      },
      accessibilityLabel: "info"
    }}
  >
    <H2>Hello</H2>
  </BonusCardScreenComponent>
);

export { DSBonusCardScreen };
