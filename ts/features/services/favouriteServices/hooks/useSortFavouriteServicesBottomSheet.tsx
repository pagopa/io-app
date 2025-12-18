import { AccessibilityInfo } from "react-native";
import { RadioGroup, RadioItem } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { favouriteServicesSortTypeSelector } from "../store/selectors";
import { setFavouriteServicesSortType } from "../store/actions";
import type { FavouriteServicesSortType } from "../types";

const useSortFavouriteServicesBottomSheet = () => {
  const dispatch = useIODispatch();
  const sortType = useIOSelector(favouriteServicesSortTypeSelector);

  const sortTypeOptions: Array<RadioItem<FavouriteServicesSortType>> = [
    {
      id: "name_asc",
      value: I18n.t("services.favouriteServices.bottomSheet.content.name_asc")
    },
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
    }
  ];

  const handlePress = (changedSortType: FavouriteServicesSortType) => {
    modal.dismiss();
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
        selectedItem={sortType}
        type="radioListItem"
        onPress={handlePress}
      />
    ),
    title: I18n.t("services.favouriteServices.bottomSheet.title")
  });

  return { ...modal, present };
};

export { useSortFavouriteServicesBottomSheet };
