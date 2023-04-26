import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H2 } from "../../../../components/core/typography/H2";

type Props = {
  initiative?: InitiativeDataDTO;
};

const OnboardingServiceHeader = (props: Props) => {
  const { initiative } = props;

  return pipe(
    initiative,
    O.fromNullable,
    O.map(initiative => ({
      organizationName: initiative.organizationName,
      initiativeName: initiative.initiativeName,
      logoURL: initiative.logoURL
    })),
    O.fold(
      () => <Skeleton />,
      ({ organizationName, initiativeName, logoURL }) => (
        <View style={styles.header}>
          <View>
            <H2>{initiativeName}</H2>
            <Body>{organizationName}</Body>
          </View>
          <Image style={styles.logo} source={{ uri: logoURL }} />
        </View>
      )
    )
  );
};

const Skeleton = () => (
  <View style={styles.header}>
    <View>
      <Placeholder.Box animate={"fade"} width={110} height={16} radius={4} />
      <VSpacer size={8} />
      <Placeholder.Box animate={"fade"} width={150} height={21} radius={4} />
    </View>
    <Placeholder.Box animate={"fade"} width={48} height={48} radius={48} />
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
