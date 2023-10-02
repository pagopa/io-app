import * as React from "react";
import { SafeAreaView } from "react-native";
import {
  ButtonSolid,
  IOThemeContext,
  VSpacer,
  ContentWrapper,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import {
  useIOBottomSheetAutoresizableModal,
  useIOBottomSheetModal,
  useLegacyIOBottomSheetModal
} from "../../../utils/hooks/bottomSheet";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

export const DSBottomSheet = () => {
  const handlePressDismiss = () => {
    dismissStaticBottomSheet();
    dismissStaticBottomSheetWithFooter();
    dismissAutoresizableBottomSheet();
    dismissAutoresizableBottomSheetWithFooter();
    dismissVeryLongAutoresizableBottomSheetWithFooter();
    dismissVeryLongAutoresizableBottomSheetWithFooterFullScreen();
    dismissLegacyBottomSheet();
    dismissLegacyBottomSheetWithFooter();
  };

  const defaultFooter = (
    <ContentWrapper>
      <VSpacer size={16} />
      <ButtonSolid
        fullWidth
        accessibilityLabel="Tap to dismiss the bottom sheet"
        label={"Dismiss bottom sheet"}
        onPress={handlePressDismiss}
      />
      <VSpacer size={16} />
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
  } = useIOBottomSheetAutoresizableModal({
    title: "Autoresizable Bottom Sheet",
    component: <BottomSheetLongContentBody />
  });

  // Autoresizable bottom sheet hook with footer
  const {
    present: presentAutoresizableBottomSheetWithFooter,
    bottomSheet: autoResizableBottomSheetWithFooter,
    dismiss: dismissAutoresizableBottomSheetWithFooter
  } = useIOBottomSheetAutoresizableModal(
    {
      title: "Autoresizable Bottom Sheet",
      component: <BottomSheetLongContentBody />,
      footer: defaultFooter
    },
    150
  );

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
  } = useIOBottomSheetAutoresizableModal(
    {
      title: "Autoresizable Bottom Sheet",
      component: <BottomSheetVeryLongContentBody />,
      footer: defaultFooter
    },
    80
  );

  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooterFullScreen,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooterFullScreen,
    dismiss: dismissVeryLongAutoresizableBottomSheetWithFooterFullScreen
  } = useIOBottomSheetAutoresizableModal(
    {
      title: "Autoresizable Bottom Sheet, Full Screen",
      component: (
        <SafeAreaView>
          <BottomSheetVeryLongContentBody />
        </SafeAreaView>
      ),
      footer: defaultFooter,
      fullScreen: true
    },
    80
  );

  const {
    present: presentLegacyBottomSheet,
    bottomSheet: legacyBottomSheet,
    dismiss: dismissLegacyBottomSheet
  } = useLegacyIOBottomSheetModal(
    <BottomSheetContentBody />,
    "Legacy Bottom Sheet",
    250
  );

  const {
    present: presentLegacyBottomSheetWithFooter,
    bottomSheet: legacyBottomSheetWithFooter,
    dismiss: dismissLegacyBottomSheetWithFooter
  } = useLegacyIOBottomSheetModal(
    <BottomSheetContentBody />,
    "Legacy Bottom Sheet with footer",
    400,
    defaultFooter
  );

  return (
    <IOThemeContext.Consumer>
      {theme => (
        <DesignSystemScreen
          title={DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.title}
        >
          <H2
            color={theme["textHeading-default"]}
            weight={"SemiBold"}
            style={{ marginBottom: 16, marginTop: 16 }}
          >
            Available bottom sheets
          </H2>
          <ListItemNav
            value="Static bottom sheet"
            description="This bottom sheet has a static snap point of 300 hard coded in the hook declaration"
            accessibilityLabel="Static bottom sheet"
            onPress={presentStaticBottomSheet}
          />
          <ListItemNav
            value="Static bottom sheet with footer"
            description="This bottom sheet has a static snap point of 300 hard coded in the hook declaration with a footer"
            accessibilityLabel="Static bottom sheet"
            onPress={presentStaticBottomSheetWithFooter}
          />
          <ListItemNav
            value="Autoresizable bottom sheet"
            description="This bottom sheet has a snap point that is calculated based on the content height"
            accessibilityLabel="Autoresizable bottom sheet"
            onPress={presentAutoresizableBottomSheet}
          />
          <ListItemNav
            value="Autoresizable bottom sheet with footer"
            description="This bottom sheet has a snap point that is calculated based on the content height with a footer"
            accessibilityLabel="Autoresizable bottom sheet with footer"
            onPress={presentAutoresizableBottomSheetWithFooter}
          />
          <ListItemNav
            value="Autoresizable bottom sheet with very long content and a footer"
            description="This bottom sheet has a snap point that is calculated based on the content height with a footer, its content is very long  and the modal should snap below the upper safe area limit"
            accessibilityLabel="Static bottom sheet"
            onPress={presentVeryLongAutoresizableBottomSheetWithFooter}
          />
          <ListItemNav
            value="Autoresizable bottom sheet with very long content and a footer, full screen"
            description="This bottom sheet has a snap point that is calculated based on the content height with a footer, its content is very long and the modal takes the full screen"
            accessibilityLabel="Static bottom sheet"
            onPress={
              presentVeryLongAutoresizableBottomSheetWithFooterFullScreen
            }
          />
          <H2
            color={theme["textHeading-default"]}
            weight={"SemiBold"}
            style={{ marginBottom: 16, marginTop: 16 }}
          >
            Legacy
          </H2>

          <ListItemNav
            value="Legacy bottom sheet"
            accessibilityLabel="Legacy bottom sheet"
            onPress={presentLegacyBottomSheet}
          />
          <ListItemNav
            value="Legacy bottom sheet with footer"
            accessibilityLabel="Legacy bottom sheet with footer"
            onPress={presentLegacyBottomSheetWithFooter}
          />
          <VSpacer size={24} />
          {staticBottomSheet}
          {staticBottomSheetWithFooter}
          {autoResizableBottomSheet}
          {autoResizableBottomSheetWithFooter}
          {veryLongAutoResizableBottomSheetWithFooter}
          {veryLongAutoResizableBottomSheetWithFooterFullScreen}
          {legacyBottomSheet}
          {legacyBottomSheetWithFooter}
        </DesignSystemScreen>
      )}
    </IOThemeContext.Consumer>
  );
};
