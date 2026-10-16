import { RadioGroup, RadioItem } from "@io-app/design-system";
import I18n from "i18next";
import { AccessibilityInfo } from "react-native";

import type { FavouriteServicesSortType } from "../types";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import * as analytics from "../../common/analytics";
import { setFavouriteServicesSortType } from "../store/actions";
import { favouriteServicesSortTypeSelector } from "../store/selectors";

const useSortFavouriteServicesBottomSheet = () => {
  const dispatch = useIODispatch();

  const sortType = useIOSelector(favouriteServicesSortTypeSelector);

  const sortTypeOptions: Array<RadioItem<FavouriteServicesSortType>> = [
    {
      id: "addedAt_desc",
      value: I18n.t(
        "services.favouriteServices.bottomSheet.content.addedAt_desc"
      )
    },
    {
      id: "addedAt_asc",
      value: I18n.t(
        "services.favouriteServices.bottomSheet.content.addedAt_asc"
      )
    },
    {
      id: "name_asc",
      value: I18n.t("services.favouriteServices.bottomSheet.content.name_asc")
    }
  ];

  const handlePress = (changedSortType: FavouriteServicesSortType) => {
    modal.dismiss();
    analytics.trackServicesFavouritesSortSelected(changedSortType);
    dispatch(setFavouriteServicesSortType(changedSortType));
  };

  const present = () => {
    modal.present();
    AccessibilityInfo.announceForAccessibility(
      I18n.t("services.favouriteServices.bottomSheet.a11y")
    );
  };

  const modal = useIOBottomSheetModal({
    component: (
      <RadioGroup<FavouriteServicesSortType>
        items={sortTypeOptions}
        onPress={handlePress}
        selectedItem={sortType}
        type="radioListItem"
      />
    ),
    title: I18n.t("services.favouriteServices.bottomSheet.title")
  });

  return { ...modal, present };
};

export { useSortFavouriteServicesBottomSheet };
