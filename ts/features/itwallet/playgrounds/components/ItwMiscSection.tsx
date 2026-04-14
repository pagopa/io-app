import {
  IOButton,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { resetTourCompletedAction } from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";
import { ITW_TOUR_GROUP_ID } from "../../tour/utils/constants";

export const ItwMiscSection = () => {
  const dispatch = useIODispatch();

  const isTourCompleted = useIOSelector(state =>
    isTourCompletedSelector(state, ITW_TOUR_GROUP_ID)
  );

  const resetTourGuide = () => {
    dispatch(resetTourCompletedAction({ groupId: ITW_TOUR_GROUP_ID }));
  };

  return (
    <View>
      <ListItemHeader label="Tour Guide" />
      <ListItemInfo
        label="Tour status"
        value={isTourCompleted ? "COMPLETED" : "NOT COMPLETED"}
      />
      <IOButton
        variant="solid"
        color="danger"
        label="Reset tour guide status"
        disabled={!isTourCompleted}
        onPress={resetTourGuide}
      />
    </View>
  );
};
