import {
  Body,
  H6,
  IOButton,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { GuidedTour } from "../../../tour/components/GuidedTour";
import {
  resetTourCompletedAction,
  startTourAction
} from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";

const PLAYGROUND_GROUP_ID = "playground";

export const GuidedTourPlayground = () => {
  const dispatch = useIODispatch();
  const isCompleted = useIOSelector(
    isTourCompletedSelector(PLAYGROUND_GROUP_ID)
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: "Guided Tour Playground" }}
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
        <View style={styles.card}>
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
        <View style={styles.infoBox}>
          <Body weight="Semibold">Info Section</Body>
          <VSpacer size={4} />
          <Body>Some helpful text that explains what this section does.</Body>
        </View>
      </GuidedTour>
    </IOScrollViewWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    padding: 16
  },
  infoBox: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    padding: 16
  }
});
