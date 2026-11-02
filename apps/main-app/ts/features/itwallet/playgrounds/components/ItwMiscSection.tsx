import {
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemSwitch,
  ListItemSwitchProps
} from "@io-app/design-system";
import { View } from "react-native";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { resetTourCompletedAction } from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";
import { itwSetDiscoverMoreCEDEnabled } from "../../common/store/actions/preferences.ts";
import { itwDiscoverMoreCEDSelector } from "../../credentialsCatalogue/store/selectors";
import { ITW_TOUR_GROUP_ID } from "../../tour/utils/constants";

export const ItwMiscSection = () => {
  const dispatch = useIODispatch();
  const isDiscoverMoreCEDEnabled = useIOSelector(itwDiscoverMoreCEDSelector);

  const isTourCompleted = useIOSelector(state =>
    isTourCompletedSelector(state, ITW_TOUR_GROUP_ID)
  );

  const resetTourGuide = () => {
    dispatch(resetTourCompletedAction({ groupId: ITW_TOUR_GROUP_ID }));
  };

  const featureFlags: ReadonlyArray<ListItemSwitchProps> = [
    {
      label: "Scopri le opportunità della CED",
      description:
        "Se abilitato, l'utente visualizza la CTA nel dettaglio della CED per scoprire le opportunità della CED.",
      value: isDiscoverMoreCEDEnabled,
      onSwitchValueChange: value =>
        dispatch(itwSetDiscoverMoreCEDEnabled(value))
    }
  ];

  return (
    <View>
      <ListItemHeader label="Tour Guide" />
      <ListItemInfo
        label="Tour status"
        value={isTourCompleted ? "COMPLETED" : "NOT COMPLETED"}
      />
      <IOButton
        color="danger"
        disabled={!isTourCompleted}
        label="Reset tour guide status"
        onPress={resetTourGuide}
        variant="solid"
      />
      <ListItemHeader label="Feature flag" />
      {featureFlags.map(props => (
        <ListItemSwitch key={props.label} {...props} />
      ))}
    </View>
  );
};
