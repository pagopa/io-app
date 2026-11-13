import {
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  ListItemSwitch
} from "@io-app/design-system";
import { View } from "react-native";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { resetTourCompletedAction } from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";
import {
  itwResetEngagementScreenShown,
  itwSetDiscoverMoreCEDEnabled,
  itwSetWhatsNewLocallyEnabled
} from "../../common/store/actions/preferences.ts";
import {
  itwIsDiscoverMoreCEDLocallyEnabledSelector,
  itwIsWhatsNewLocallyEnabledSelector
} from "../../common/store/selectors/preferences";
import { itwIsEngagementScreenShownSelector } from "../../loginEngagement/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { ITW_TOUR_GROUP_ID } from "../../tour/utils/constants";

export const ItwMiscSection = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isEngagementScreenShown = useIOSelector(
    itwIsEngagementScreenShownSelector
  );
  const isDiscoverMoreCEDEnabled = useIOSelector(
    itwIsDiscoverMoreCEDLocallyEnabledSelector
  );
  const isWhatsNewLocallyEnabled = useIOSelector(
    itwIsWhatsNewLocallyEnabledSelector
  );

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
        color="danger"
        disabled={!isTourCompleted}
        label="Reset tour guide status"
        onPress={resetTourGuide}
        variant="solid"
      />
      <ListItemHeader label="What's New" />
      <ListItemSwitch
        description="Se abilitato, la schermata What's New viene mostrata al login anche con il flag remoto disattivato."
        label="What's New IT-Wallet"
        onSwitchValueChange={value =>
          dispatch(itwSetWhatsNewLocallyEnabled(value))
        }
        value={isWhatsNewLocallyEnabled}
      />
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
      <ListItemHeader label="CED" />
      <ListItemSwitch
        description="Se abilitato, l'utente visualizza la CTA nel dettaglio della CED per scoprire le opportunità della CED."
        label="Scopri le opportunità della CED"
        onSwitchValueChange={value =>
          dispatch(itwSetDiscoverMoreCEDEnabled(value))
        }
        value={isDiscoverMoreCEDEnabled}
      />
    </View>
  );
};
