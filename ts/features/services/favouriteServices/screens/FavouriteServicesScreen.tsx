import I18n from "i18next";
import { Fragment, useMemo } from "react";
import { IOListViewWithLargeHeader } from "../../../../components/ui/IOListViewWithLargeHeader";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { favouriteServicesSelector } from "../store/selectors";

export function FavouriteServicesScreen() {
  const favouriteServices = useIOSelector(favouriteServicesSelector);
  const favouriteServicesList = useMemo(
    () => Object.values(favouriteServices),
    [favouriteServices]
  );

  return (
    <IOListViewWithLargeHeader
      headerActionsProp={{
        showHelp: true
        // TODO QUESTION, should show options icon button? if yes, to what screen it should navigate?
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

// TODO QUESTION, should go in own file?
function ListEmptyComponent() {
  const navigation = useIONavigation();
  return (
    <OperationResultScreenContent
      pictogram="empty"
      title={I18n.t("services.favouriteServices.emptyList.title")}
      subtitle={I18n.t("services.favouriteServices.emptyList.subtitle")}
      action={{
        label: I18n.t("services.favouriteServices.emptyList.searchAction"),
        icon: "search", // TODO QUESTION, icon appears on the left with this code, it is on the right in the design
        onPress() {
          navigation.navigate(SERVICES_ROUTES.SEARCH);
        }
      }}
    />
  );
}
