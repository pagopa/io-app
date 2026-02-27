import {
  Body,
  ContentWrapper,
  H4,
  IOButton,
  IOVisualCostants,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ShortContent = () => (
  <Body>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris.
  </Body>
);

const LongContent = () => (
  <>
    {Array.from({ length: 15 }).map((_, i) => (
      <Body key={i}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </Body>
    ))}
  </>
);

export const NativeSheetFitToContents = () => {
  const theme = useIOTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ContentWrapper>
        <VSpacer size={24} />
        <H4 color={theme["textHeading-default"]}>Fit to contents</H4>
        <VSpacer size={8} />
        <ShortContent />
        <VSpacer size={16} />
        <IOButton
          fullWidth
          variant="solid"
          label="Dismiss"
          onPress={() => navigation.goBack()}
        />
      </ContentWrapper>
    </View>
  );
};

export const NativeSheetHalf = () => {
  const theme = useIOTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ContentWrapper>
        <VSpacer size={24} />
        <H4 color={theme["textHeading-default"]}>Half screen (50%)</H4>
        <VSpacer size={8} />
        <ShortContent />
        <VSpacer size={16} />
        <IOButton
          fullWidth
          variant="solid"
          label="Dismiss"
          onPress={() => navigation.goBack()}
        />
      </ContentWrapper>
    </View>
  );
};

export const NativeSheetTwoDetents = () => {
  const theme = useIOTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ContentWrapper>
        <VSpacer size={16} />
        <H4 color={theme["textHeading-default"]}>Two detents (30% / 70%)</H4>
        <VSpacer size={8} />
        <ShortContent />
        <IOButton
          fullWidth
          variant="solid"
          label="Dismiss"
          onPress={() => navigation.goBack()}
        />
      </ContentWrapper>
    </View>
  );
};

export const NativeSheetLongContent = () => {
  const theme = useIOTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <ContentWrapper>
        <VSpacer size={24} />
        <H4 color={theme["textHeading-default"]}>Long scrollable content</H4>
        <VSpacer size={8} />
        <LongContent />
        <VSpacer size={IOVisualCostants.appMarginDefault} />
        <IOButton
          fullWidth
          variant="solid"
          label="Dismiss"
          onPress={() => navigation.goBack()}
        />
      </ContentWrapper>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
