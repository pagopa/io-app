import {
  Body,
  FooterActions,
  H4,
  IOButton,
  IOColors,
  useFooterActionsMeasurements,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { ModalBottomSheet } from "@swmansion/react-native-bottom-sheet";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

/**
 * Index into a `[closed, ...]` detents array: `0` keeps the sheet closed,
 * `1` snaps it to the first open detent.
 */
const CLOSED_INDEX = 0;
const FIRST_OPEN_INDEX = 1;

/**
 * Number of paragraphs rendered in the "long content" sheet, enough to exceed
 * the available screen height and force the inner `ScrollView` to scroll.
 */
const LONG_SHEET_PARAGRAPH_COUNT = 6;

/**
 * Fixed-height detent for the "percentage" sheet, expressed as a fraction of
 * the available screen height. The library has no native percentage support,
 * so the value is computed from the safe-area frame.
 */
const PERCENT_DETENT_RATIO = 0.6;

/**
 * Playground that exercises `@swmansion/react-native-bottom-sheet` inside the
 * classic (JS) `@react-navigation/stack` used by the Settings navigator, rather
 * than a native stack. It verifies that both the modal (portal-based) and the
 * inline sheet behave correctly when presented from a non-native stack screen.
 *
 * Modal sheets render through the app-level `BottomSheetProvider` (see
 * `ts/App.tsx`), whose portal host is mounted above the navigators so the sheet
 * overlays the navigation header.
 */
export const BottomSheetPlayground = () => {
  const theme = useIOTheme();
  const frame = useSafeAreaFrame();

  const [modalIndex, setModalIndex] = useState(CLOSED_INDEX);
  const [longModalIndex, setLongModalIndex] = useState(CLOSED_INDEX);
  const [percentModalIndex, setPercentModalIndex] = useState(CLOSED_INDEX);

  useHeaderSecondLevel({
    title: "Bottom Sheet (SWM)"
  });

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const surface = (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.surface,
        { backgroundColor: IOColors[theme["appBackground-primary"]] }
      ]}
    />
  );

  return (
    <>
      <IOScrollView>
        <VStack space={16}>
          <Body>
            This screen renders inside the classic JS stack (not a native
            stack). Use the buttons below to verify the Software Mansion bottom
            sheet snapping, dragging and scrim behaviour in this environment.
          </Body>

          <IOButton
            accessibilityLabel="Open modal sheet"
            fullWidth
            label="Open modal sheet"
            onPress={() => setModalIndex(FIRST_OPEN_INDEX)}
            variant="solid"
          />

          <IOButton
            accessibilityLabel="Open long scrollable sheet"
            fullWidth
            label="Open long (scrollable) sheet"
            onPress={() => setLongModalIndex(FIRST_OPEN_INDEX)}
            variant="solid"
          />

          <IOButton
            accessibilityLabel="Open 60 percent height sheet"
            fullWidth
            label="Open 60% sheet"
            onPress={() => setPercentModalIndex(FIRST_OPEN_INDEX)}
            variant="solid"
          />
        </VStack>
      </IOScrollView>

      {/* Modal sheet: auto-sizes to its content height, with a scrim. */}
      <ModalBottomSheet
        detents={[0, "content"]}
        index={modalIndex}
        onIndexChange={setModalIndex}
        scrimColor="rgba(0, 0, 0, 0.4)"
        surface={surface}
      >
        <View style={styles.content}>
          <H4>Modal bottom sheet</H4>
          <Body>
            The sheet auto-sizes to this content. Drag it down or tap the scrim
            to dismiss; closing keeps the controlled index in sync via
            onIndexChange.
          </Body>
        </View>
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: "Close",
              accessibilityLabel: "Close modal sheet",
              onPress: () => setModalIndex(CLOSED_INDEX)
            }
          }}
          fixed={false}
          onMeasure={handleFooterActionsMeasurements}
        />
      </ModalBottomSheet>

      {/*
        Long content: the `'content'` detent is capped at the available screen
        height (below the status bar by default), so the sheet stops growing and
        the inner ScrollView takes over. The library negotiates the gesture
        natively: scrolling reaches the list edge before a downward drag
        collapses the sheet.
      */}
      <ModalBottomSheet
        detents={[0, "content"]}
        index={longModalIndex}
        onIndexChange={setLongModalIndex}
        scrimColor="rgba(0, 0, 0, 0.4)"
        surface={surface}
      >
        <ScrollView
          contentContainerStyle={{
            ...styles.content,
            paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
          }}
        >
          <VStack space={8}>
            <H4>Long, scrollable content</H4>
            {Array.from({ length: LONG_SHEET_PARAGRAPH_COUNT }).map(
              (_, index) => (
                <Body key={index}>
                  {`Paragraph ${
                    index + 1
                  }: this sheet's content is taller than the screen, so it caps at the maximum height and scrolls instead of overflowing. Drag the content to the top, then keep dragging down to collapse the sheet.`}
                </Body>
              )
            )}
          </VStack>
        </ScrollView>
        {/*
            Footer pinned by the `flex: 1` ScrollView above it. `fixed={false}`
            keeps it in normal flow; FooterActions adds its own safe-area bottom
            margin.
          */}
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: "Close",
              accessibilityLabel: "Close long scrollable sheet",
              onPress: () => setLongModalIndex(CLOSED_INDEX)
            }
          }}
          fixed={true}
          onMeasure={handleFooterActionsMeasurements}
        />
      </ModalBottomSheet>

      {/*
        Percentage sheet: the library has no native percentage detent, so the
        60% height is computed from the screen frame. A scrollable child needs
        `'content'` as the largest detent: the library's examples always pair a
        scrollable with a `'content'` detent so its native gesture handling
        bounds the list and hands off the scroll. The sheet opens at 60% and can
        be dragged up to the full content height.
      */}
      <ModalBottomSheet
        detents={[0, frame.height * PERCENT_DETENT_RATIO, "content"]}
        index={percentModalIndex}
        onIndexChange={setPercentModalIndex}
        scrimColor="rgba(0, 0, 0, 0.4)"
        surface={surface}
      >
        <ScrollView
          contentContainerStyle={{
            ...styles.content,
            paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
          }}
        >
          <VStack space={8}>
            <H4>60% height sheet</H4>
            {Array.from({ length: LONG_SHEET_PARAGRAPH_COUNT }).map(
              (_, index) => (
                <Body key={index}>
                  {`Paragraph ${
                    index + 1
                  }: this sheet opens at 60% of the screen height. The list scrolls at that detent, and dragging up expands the sheet to the full content height.`}
                </Body>
              )
            )}
          </VStack>
        </ScrollView>
        {/* Fixed footer, pinned at the bottom of the 60% sheet. */}
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: "Close",
              accessibilityLabel: "Close 60 percent sheet",
              onPress: () => setPercentModalIndex(CLOSED_INDEX)
            }
          }}
          fixed={true}
          onMeasure={handleFooterActionsMeasurements}
        />
      </ModalBottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  surface: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24
  }
});
