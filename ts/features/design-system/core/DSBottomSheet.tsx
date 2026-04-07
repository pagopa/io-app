import {
  Body,
  ContentWrapper,
  Divider,
  H4,
  IOButton,
  ListItemNav,
  VSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

export const DSBottomSheet = () => {
  const theme = useIOTheme();

  const handlePressDismiss = () => {
    dismissStaticBottomSheet();
    dismissStaticBottomSheetWithFooter();
    dismissAutoresizableBottomSheet();
    dismissAutoresizableBottomSheetWithFooter();
    dismissVeryLongAutoresizableBottomSheetWithFooter();
    dismissVeryLongAutoresizableBottomSheetWithFooterFullScreen();
  };

  const defaultFooter = (
    <ContentWrapper>
      <VSpacer size={16} />
      <IOButton
        fullWidth
        variant="solid"
        accessibilityLabel="Tap to dismiss the bottom sheet"
        label={"Dismiss bottom sheet"}
        onPress={handlePressDismiss}
      />
    </ContentWrapper>
  );

  const BottomSheetContentBody = () => (
    <Body>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua.
    </Body>
  );

  const BottomSheetLongContentBody = () => (
    <Body>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit
      amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur
      adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
      do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum
      dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet,
      consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
      dolore magna aliqua.
    </Body>
  );

  const BottomSheetVeryLongContentBody = () => (
    <>
      {Array.from(Array(10).keys()).map((_, index) => (
        <Body key={index}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
          ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor
          sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit
          amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Body>
      ))}
    </>
  );

  // Autoresizable bottom sheet hook
  const {
    present: presentAutoresizableBottomSheet,
    bottomSheet: autoResizableBottomSheet,
    dismiss: dismissAutoresizableBottomSheet
  } = useIOBottomSheetModal({
    title: "Autoresizable Bottom Sheet",
    component: <BottomSheetLongContentBody />
  });

  // Autoresizable bottom sheet hook with footer
  const {
    present: presentAutoresizableBottomSheetWithFooter,
    bottomSheet: autoResizableBottomSheetWithFooter,
    dismiss: dismissAutoresizableBottomSheetWithFooter
  } = useIOBottomSheetModal({
    title: "Autoresizable Bottom Sheet",
    component: <BottomSheetLongContentBody />,
    footer: defaultFooter
  });

  // Static bottom sheet hook
  const {
    present: presentStaticBottomSheet,
    bottomSheet: staticBottomSheet,
    dismiss: dismissStaticBottomSheet
  } = useIOBottomSheetModal({
    title: "Static Bottom Sheet",
    component: <BottomSheetContentBody />,
    snapPoint: [300]
  });

  // Static bottom sheet hook with footer
  const {
    present: presentStaticBottomSheetWithFooter,
    bottomSheet: staticBottomSheetWithFooter,
    dismiss: dismissStaticBottomSheetWithFooter
  } = useIOBottomSheetModal({
    title: "Static Bottom Sheet",
    component: <BottomSheetContentBody />,
    snapPoint: [300],
    footer: defaultFooter
  });

  // Autoresizable bottom sheet hook with footer
  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooter,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooter,
    dismiss: dismissVeryLongAutoresizableBottomSheetWithFooter
  } = useIOBottomSheetModal({
    title: "Autoresizable Bottom Sheet",
    component: <BottomSheetVeryLongContentBody />,
    footer: defaultFooter
  });

  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooterFullScreen,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooterFullScreen,
    dismiss: dismissVeryLongAutoresizableBottomSheetWithFooterFullScreen
  } = useIOBottomSheetModal({
    title: "Autoresizable Bottom Sheet, Full Screen",
    component: (
      <SafeAreaView>
        <BottomSheetVeryLongContentBody />
      </SafeAreaView>
    ),
    footer: defaultFooter
  });

  const sectionTitleMargin = 16;
  const blockMargin = 48;

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.title}
    >
      <VStack space={blockMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Available bottom sheets</H4>
          <View>
            <ListItemNav
              value="Static bottom sheet"
              description="This bottom sheet has a static snap point of 300 hard coded in the hook declaration"
              accessibilityLabel="Static bottom sheet"
              onPress={presentStaticBottomSheet}
            />
            <Divider />
            <ListItemNav
              value="Static bottom sheet with footer"
              description="This bottom sheet has a static snap point of 300 hard coded in the hook declaration with a footer"
              accessibilityLabel="Static bottom sheet"
              onPress={presentStaticBottomSheetWithFooter}
            />
            <Divider />
            <ListItemNav
              value="Autoresizable bottom sheet"
              description="This bottom sheet has a snap point that is calculated based on the content height"
              accessibilityLabel="Autoresizable bottom sheet"
              onPress={presentAutoresizableBottomSheet}
            />
            <Divider />
            <ListItemNav
              value="Autoresizable bottom sheet with footer"
              description="This bottom sheet has a snap point that is calculated based on the content height with a footer"
              accessibilityLabel="Autoresizable bottom sheet with footer"
              onPress={presentAutoresizableBottomSheetWithFooter}
            />
            <Divider />
            <ListItemNav
              value="Autoresizable bottom sheet with very long content and a footer"
              description="This bottom sheet has a snap point that is calculated based on the content height with a footer, its content is very long  and the modal should snap below the upper safe area limit"
              accessibilityLabel="Static bottom sheet"
              onPress={presentVeryLongAutoresizableBottomSheetWithFooter}
            />
            <Divider />
            <ListItemNav
              value="Autoresizable bottom sheet with very long content and a footer, full screen"
              description="This bottom sheet has a snap point that is calculated based on the content height with a footer, its content is very long and the modal takes the full screen"
              accessibilityLabel="Static bottom sheet"
              onPress={
                presentVeryLongAutoresizableBottomSheetWithFooterFullScreen
              }
            />
          </View>
        </VStack>
        {staticBottomSheet}
        {staticBottomSheetWithFooter}
        {autoResizableBottomSheet}
        {autoResizableBottomSheetWithFooter}
        {veryLongAutoResizableBottomSheetWithFooter}
        {veryLongAutoResizableBottomSheetWithFooterFullScreen}
      </VStack>
    </DesignSystemScreen>
  );
};
