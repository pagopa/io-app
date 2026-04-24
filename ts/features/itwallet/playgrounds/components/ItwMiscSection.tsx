import {
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemSwitch,
  ListItemSwitchProps
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { resetTourCompletedAction } from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";
import { ITW_TOUR_GROUP_ID } from "../../tour/utils/constants";
import { itwIsCatalogueEnabledForCredentialsList } from "../../credentialsCatalogue/store/selectors";
import { itwSetCatalogueEnabledForCredentialsList } from "../../credentialsCatalogue/store/actions";

export const ItwMiscSection = () => {
  const dispatch = useIODispatch();
  const isCatalogueEnabledForCredentialsList = useIOSelector(
    itwIsCatalogueEnabledForCredentialsList
  );

  const isTourCompleted = useIOSelector(state =>
    isTourCompletedSelector(state, ITW_TOUR_GROUP_ID)
  );

  const resetTourGuide = () => {
    dispatch(resetTourCompletedAction({ groupId: ITW_TOUR_GROUP_ID }));
  };

  const featureFlags: ReadonlyArray<ListItemSwitchProps> = [
    {
      label: "Lista credenziali da catalogo",
      description:
        "Se abilitato, la lista delle credenziali disponibili è ottenuta dal catalogo; altrimenti è una lista fissa.",
      value: isCatalogueEnabledForCredentialsList,
      onSwitchValueChange: value =>
        dispatch(itwSetCatalogueEnabledForCredentialsList(value))
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
        variant="solid"
        color="danger"
        label="Reset tour guide status"
        disabled={!isTourCompleted}
        onPress={resetTourGuide}
      />
      <ListItemHeader label="Feature flag" />
      {featureFlags.map(props => (
        <ListItemSwitch key={props.label} {...props} />
      ))}
    </View>
  );
};
