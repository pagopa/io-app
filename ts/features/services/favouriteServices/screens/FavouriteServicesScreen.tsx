import I18n from "i18next";
import { Fragment, useCallback, useMemo } from "react";
import { IOListViewWithLargeHeader } from "../../../../components/ui/IOListViewWithLargeHeader";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { favouriteServicesSelector } from "../store/selectors";

export function FavouriteServicesScreen() {
  const navigation = useIONavigation();
  const favouriteServices = useIOSelector(favouriteServicesSelector);
  const favouriteServicesList = useMemo(
    () => Object.values(favouriteServices),
    [favouriteServices]
  );

  const ListEmptyComponent = useCallback(
    () => (
      <OperationResultScreenContent
        pictogram="empty"
        title={I18n.t("services.favouriteServices.emptyList.title")}
        subtitle={I18n.t("services.favouriteServices.emptyList.subtitle")}
        action={{
          label: I18n.t("services.favouriteServices.emptyList.searchAction"),
          icon: "search",
          onPress() {
            navigation.navigate(SERVICES_ROUTES.SEARCH);
          }
        }}
      />
    ),
    [navigation]
  );

  return (
    <IOListViewWithLargeHeader
      headerActionsProp={{
        showHelp: true
      }}
      title={{
        label: I18n.t("services.favouriteServices.title")
      }}
      keyExtractor={service => service.id}
      data={favouriteServicesList}
      renderItem={() => <Fragment />}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}
