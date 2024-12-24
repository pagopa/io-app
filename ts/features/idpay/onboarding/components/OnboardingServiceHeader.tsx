import { Body, H4, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Image, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";

type Props = {
  initiative: O.Option<InitiativeDataDTO>;
};

const OnboardingServiceHeader = (props: Props) => {
  const { initiative } = props;

  return pipe(
    initiative,
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
            <H4>{initiativeName}</H4>
            <Body>{organizationName}</Body>
          </View>
          <Image
            accessibilityIgnoresInvertColors
            style={styles.logo}
            source={{ uri: logoURL }}
          />
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
