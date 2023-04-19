import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H2 } from "../../../../components/core/typography/H2";

type Props = {
  organizationName: string;
  initiativeName: string;
  logoURL?: string;
};

const OnboardingServiceHeader = ({
  organizationName,
  initiativeName,
  logoURL
}: Props) => (
  <View style={styles.header}>
    <View>
      <H2>{initiativeName}</H2>
      <Body>{organizationName}</Body>
    </View>
    <Image style={styles.logo} source={{ uri: logoURL }} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    width: 48,
    height: 48
  }
});

export { OnboardingServiceHeader };
