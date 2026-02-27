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
        <VSpacer size={16} />
        <H4 color={theme["textHeading-default"]}>Half screen (50%)</H4>
        <VSpacer size={8} />
        <ShortContent />
      </ContentWrapper>
      <View style={styles.footer}>
        <ContentWrapper>
          <IOButton
            fullWidth
            variant="solid"
            label="Dismiss"
            onPress={() => navigation.goBack()}
          />
          <VSpacer size={16} />
        </ContentWrapper>
      </View>
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

export const NativeSheetGrabber = () => {
  const theme = useIOTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ContentWrapper>
        <VSpacer size={16} />
        <H4 color={theme["textHeading-default"]}>With grabber (iOS)</H4>
        <VSpacer size={8} />
        <Body>
          This sheet has `sheetGrabberVisible: true`. The grabber is only
          visible on iOS.
        </Body>
        <VSpacer size={8} />
        <ShortContent />
        <VSpacer size={16} />
        <IOButton
          fullWidth
          variant="solid"
          label="Dismiss"
          onPress={() => navigation.goBack()}
        />
        <VSpacer size={16} />
      </ContentWrapper>
    </View>
  );
};

export const NativeSheetUndimmed = () => {
  const theme = useIOTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ContentWrapper>
        <VSpacer size={16} />
        <H4 color={theme["textHeading-default"]}>Undimmed background</H4>
        <VSpacer size={8} />
        <Body>
          This sheet has `sheetLargestUndimmedDetentIndex: 0` so the background
          is not dimmed.
        </Body>
        <VSpacer size={8} />
        <ShortContent />
        <VSpacer size={16} />
        <IOButton
          fullWidth
          variant="solid"
          label="Dismiss"
          onPress={() => navigation.goBack()}
        />
        <VSpacer size={16} />
      </ContentWrapper>
    </View>
  );
};

export const NativeSheetLongContent = () => {
  const theme = useIOTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView>
        <ContentWrapper>
          <VSpacer size={16} />
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
          <VSpacer size={16} />
        </ContentWrapper>
      </ScrollView>
    </View>
  );
};

export const NativeSheetWithFooter = () => {
  const theme = useIOTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ContentWrapper>
        <VSpacer size={16} />
        <H4 color={theme["textHeading-default"]}>With FooterActions</H4>
        <VSpacer size={8} />
        <Body>
          This sheet uses `fitToContents` with primary and secondary actions.
        </Body>
        <VSpacer size={8} />
        <ShortContent />
        <VSpacer size={16} />
        <IOButton
          fullWidth
          variant="solid"
          label="Confirm"
          onPress={() => navigation.goBack()}
        />
        <VSpacer size={8} />
        <IOButton
          fullWidth
          variant="outline"
          label="Cancel"
          onPress={() => navigation.goBack()}
        />
      </ContentWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  footer: {
    marginTop: "auto"
  }
});
