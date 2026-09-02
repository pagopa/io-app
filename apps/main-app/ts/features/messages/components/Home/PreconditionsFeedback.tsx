import { BodySmall, H3, useIOTheme, VSpacer } from "@io-app/design-system";
import { StyleSheet, View } from "react-native";

import {
  AnimatedPictogram,
  IOAnimatedPictograms
} from "../../../../components/ui/AnimatedPictogram";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    marginHorizontal: 16
  }
});

type Props = {
  pictogram: IOAnimatedPictograms;
  subtitle?: string;
  title: string;
};

export const PreconditionsFeedback = ({
  pictogram,
  title,
  subtitle
}: Props) => {
  const theme = useIOTheme();

  return (
    <View style={styles.container}>
      <AnimatedPictogram name={pictogram} size={120} />
      <VSpacer size={24} />
      <H3
        color={theme["textHeading-secondary"]}
        style={{ textAlign: "center" }}
      >
        {title}
      </H3>
      {subtitle && (
        <>
          <VSpacer size={8} />
          <BodySmall
            color={theme["textBody-tertiary"]}
            style={{ textAlign: "center" }}
            weight="Regular"
          >
            {subtitle}
          </BodySmall>
        </>
      )}
    </View>
  );
};
