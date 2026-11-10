import {
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  ListItemSwitch,
  ListItemSwitchProps
} from "@io-app/design-system";
import { View } from "react-native";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { hashedProfileFiscalCodeSelector } from "../../../../store/reducers/crossSessions";
import { resetTourCompletedAction } from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";
import {
  itwResetEngagementScreenShown,
  itwSetDiscoverMoreCEDEnabled
} from "../../common/store/actions/preferences.ts";
import { itwIsDiscoverMoreCEDLocallyEnabledSelector } from "../../common/store/selectors/preferences";
import { ITW_ROUTES } from "../../navigation/routes";
import { ITW_TOUR_GROUP_ID } from "../../tour/utils/constants";

export const ItwMiscSection = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isEngagementScreenShown = useIOSelector(state => {
    const user = hashedProfileFiscalCodeSelector(state);
    return (
      user !== undefined &&
      state.features.itWallet.preferences.engagementScreenShownByUser?.[
        user
      ] === true
    );
  });
  const isDiscoverMoreCEDEnabled = useIOSelector(
    itwIsDiscoverMoreCEDLocallyEnabledSelector
  );

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
      <ListItemHeader label="What's New" />
      <ListItemNav
        description="Navigate to the IT-Wallet What's New screen"
        label="IT-Wallet What's New"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ENGAGEMENT
          })
        }
      />
      <ListItemInfo
        label="Shown to current user"
        value={isEngagementScreenShown ? "YES" : "NO"}
      />
      <IOButton
        color="danger"
        disabled={!isEngagementScreenShown}
        label="Reset What's New visibility"
        onPress={() => dispatch(itwResetEngagementScreenShown())}
        variant="solid"
      />
      <ListItemHeader label="Feature flag" />
      {featureFlags.map(props => (
        <ListItemSwitch key={props.label} {...props} />
      ))}
    </View>
  );
};
