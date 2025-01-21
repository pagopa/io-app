import {
  H3,
  IOPictograms,
  BodySmall,
  Pictogram,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";

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
  pictogram: IOPictograms;
  title: string;
  subtitle?: string;
};

export const PreconditionsFeedback = ({
  pictogram,
  title,
  subtitle
}: Props) => {
  const theme = useIOTheme();

  return (
    <View style={styles.container}>
      <Pictogram name={pictogram} size={120} />
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
            style={{ textAlign: "center" }}
            color={theme["textBody-tertiary"]}
            weight="Regular"
          >
            {subtitle}
          </BodySmall>
        </>
      )}
    </View>
  );
};
