import { ContentWrapper, H2, VSpacer } from "@pagopa/io-app-design-system";
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
    headerAction={{
      icon: "info",
      onPress: () => {
        Alert.alert("info");
      },
      accessibilityLabel: "info"
    }}
    footerCta={{
      label: "Ciao",
      accessibilityLabel: "Ciao",
      onPress: () => Alert.alert("Hello world!")
    }}
  >
    <VSpacer size={16} />
    <ContentWrapper>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
      <H2>Hello world!</H2>
    </ContentWrapper>
  </BonusCardScreenComponent>
);

export { DSBonusCardScreen };
