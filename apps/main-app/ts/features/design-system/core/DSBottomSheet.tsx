import {
  Body,
  ContentWrapper,
  Divider,
  H4,
  IOButton,
  ListItemNav,
  useIOTheme,
  VSpacer,
  VStack
} from "@io-app/design-system";
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
        accessibilityLabel="Tap to dismiss the bottom sheet"
        fullWidth
        label={"Dismiss bottom sheet"}
        onPress={handlePressDismiss}
        variant="solid"
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
              accessibilityLabel="Static bottom sheet"
              description="This bottom sheet has a static snap point of 300 hard coded in the hook declaration"
              onPress={presentStaticBottomSheet}
              value="Static bottom sheet"
            />
            <Divider />
            <ListItemNav
              accessibilityLabel="Static bottom sheet"
              description="This bottom sheet has a static snap point of 300 hard coded in the hook declaration with a footer"
              onPress={presentStaticBottomSheetWithFooter}
              value="Static bottom sheet with footer"
            />
            <Divider />
            <ListItemNav
              accessibilityLabel="Autoresizable bottom sheet"
              description="This bottom sheet has a snap point that is calculated based on the content height"
              onPress={presentAutoresizableBottomSheet}
              value="Autoresizable bottom sheet"
            />
            <Divider />
            <ListItemNav
              accessibilityLabel="Autoresizable bottom sheet with footer"
              description="This bottom sheet has a snap point that is calculated based on the content height with a footer"
              onPress={presentAutoresizableBottomSheetWithFooter}
              value="Autoresizable bottom sheet with footer"
            />
            <Divider />
            <ListItemNav
              accessibilityLabel="Static bottom sheet"
              description="This bottom sheet has a snap point that is calculated based on the content height with a footer, its content is very long  and the modal should snap below the upper safe area limit"
              onPress={presentVeryLongAutoresizableBottomSheetWithFooter}
              value="Autoresizable bottom sheet with very long content and a footer"
            />
            <Divider />
            <ListItemNav
              accessibilityLabel="Static bottom sheet"
              description="This bottom sheet has a snap point that is calculated based on the content height with a footer, its content is very long and the modal takes the full screen"
              onPress={
                presentVeryLongAutoresizableBottomSheetWithFooterFullScreen
              }
              value="Autoresizable bottom sheet with very long content and a footer, full screen"
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
