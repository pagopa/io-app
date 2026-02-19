import {
  Body,
  H6,
  IOButton,
  IOColors,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useScrollOffset
} from "react-native-reanimated";
import { useHeaderHeight } from "@react-navigation/elements";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { GuidedTour } from "../../../tour/components/GuidedTour";
import { useTourContext } from "../../../tour/components/TourProvider";
import {
  resetTourCompletedAction,
  startTourAction
} from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";

const PLAYGROUND_GROUP_ID = "playground";

export const GuidedTourPlayground = () => {
  const dispatch = useIODispatch();
  const theme = useIOTheme();
  const { registerScrollRef, unregisterScrollRef } = useTourContext();

  const cardBgColor = IOColors[theme["appBackground-secondary"]];
  const fillerBgColor = IOColors[theme["appBackground-primary"]];
  const isCompleted = useIOSelector(
    isTourCompletedSelector(PLAYGROUND_GROUP_ID)
  );

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useScrollOffset(scrollRef);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    registerScrollRef(PLAYGROUND_GROUP_ID, scrollRef, scrollY, headerHeight);
    return () => {
      unregisterScrollRef(PLAYGROUND_GROUP_ID);
    };
  }, [
    registerScrollRef,
    unregisterScrollRef,
    scrollRef,
    scrollY,
    headerHeight
  ]);

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: "Guided Tour Playground" }}
      animatedRef={scrollRef}
      includeContentMargins
    >
      <IOButton
        variant="solid"
        label="Start Tour"
        onPress={() =>
          dispatch(startTourAction({ groupId: PLAYGROUND_GROUP_ID }))
        }
      />
      <VSpacer size={8} />
      <IOButton
        variant="solid"
        color="danger"
        label="Reset Completed State"
        onPress={() =>
          dispatch(resetTourCompletedAction({ groupId: PLAYGROUND_GROUP_ID }))
        }
      />
      <VSpacer size={8} />
      <Body>{`Tour completed: ${isCompleted}`}</Body>

      <VSpacer size={32} />

      <GuidedTour
        groupId={PLAYGROUND_GROUP_ID}
        index={0}
        title="Welcome Card"
        description="This is the first item in the tour. It shows a welcome message."
      >
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <H6>Welcome Card</H6>
          <VSpacer size={4} />
          <Body>This is a sample card component.</Body>
        </View>
      </GuidedTour>

      <VSpacer size={24} />

      <GuidedTour
        groupId={PLAYGROUND_GROUP_ID}
        index={1}
        title="Action Button"
        description="This button performs an important action."
      >
        <IOButton
          variant="solid"
          color="primary"
          label="Sample Action"
          onPress={() => undefined}
        />
      </GuidedTour>

      <VSpacer size={24} />

      <GuidedTour
        groupId={PLAYGROUND_GROUP_ID}
        index={2}
        title="Info Section"
        description="This section contains useful information about the feature."
      >
        <View style={[styles.infoBox, { backgroundColor: cardBgColor }]}>
          <Body weight="Semibold">Info Section</Body>
          <VSpacer size={4} />
          <Body>Some helpful text that explains what this section does.</Body>
        </View>
      </GuidedTour>

      {/* Spacer to push items below the fold */}
      <VSpacer size={48} />
      <View style={[styles.filler, { backgroundColor: fillerBgColor }]} />
      <VSpacer size={48} />

      <GuidedTour
        groupId={PLAYGROUND_GROUP_ID}
        index={3}
        title="Below the Fold"
        description="This item is below the fold. The tour should auto-scroll to reveal it."
      >
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <H6>Below the Fold Card</H6>
          <VSpacer size={4} />
          <Body>You need to scroll to see this card.</Body>
        </View>
      </GuidedTour>

      <VSpacer size={24} />

      <GuidedTour
        groupId={PLAYGROUND_GROUP_ID}
        index={4}
        title="Bottom Item"
        description="This is the last item, far down the page."
      >
        <View style={[styles.infoBox, { backgroundColor: cardBgColor }]}>
          <Body weight="Semibold">Bottom Item</Body>
          <VSpacer size={4} />
          <Body>The very last tour stop at the bottom of the page.</Body>
        </View>
      </GuidedTour>

      <VSpacer size={48} />
    </IOScrollViewWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16
  },
  filler: {
    height: 600,
    borderRadius: 8
  },
  infoBox: {
    borderRadius: 8,
    padding: 16
  }
});
