import I18n from "i18next";
import { useCallback, useMemo, useRef } from "react";
import { IOVisualCostants, ListItemNav } from "@pagopa/io-app-design-system";
import { Alert, ListRenderItemInfo, View } from "react-native";
import { IOListViewWithLargeHeader } from "../../../../components/ui/IOListViewWithLargeHeader";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { favouriteServicesSelector } from "../store/selectors";
import ListItemSwipeAction from "../../../../components/ListItemSwipeAction";
import { removeFavouriteService } from "../store/actions";
import { FavouriteServiceType } from "../types";

export function FavouriteServicesScreen() {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

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

  const openedItemRef = useRef<(() => void) | null>(null);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FavouriteServiceType>) => (
      <View
        style={{ marginHorizontal: IOVisualCostants.appMarginDefault * -1 }}
      >
        <ListItemSwipeAction
          icon="starOff"
          color="contrast"
          openedItemRef={openedItemRef}
          accessibilityLabel={I18n.t("services.favouriteServices.remove")}
          onRightActionPressed={({
            triggerSwipeAction,
            resetSwipePosition
          }) => {
            Alert.alert(
              I18n.t("services.favouriteServices.removeAlert.title"),
              undefined,
              [
                {
                  text: I18n.t("global.buttons.cancel"),
                  style: "cancel",
                  onPress: () => {
                    setTimeout(() => {
                      resetSwipePosition();
                    }, 50);
                  }
                },
                {
                  text: I18n.t(
                    "services.favouriteServices.removeAlert.confirm"
                  ),
                  style: "destructive",
                  onPress() {
                    triggerSwipeAction();
                    dispatch(removeFavouriteService({ id: item.id }));
                  }
                }
              ]
            );
          }}
        >
          <ListItemNav
            value={item.name}
            description={item.institution.name}
            onPress={() => {
              navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
                screen: SERVICES_ROUTES.SERVICE_DETAIL,
                params: {
                  serviceId: item.id
                }
              });
            }}
          />
        </ListItemSwipeAction>
      </View>
    ),
    [dispatch, navigation]
  );

  return (
    <IOListViewWithLargeHeader
      headerActionsProp={{ showHelp: true }}
      title={{ label: I18n.t("services.favouriteServices.title") }}
      keyExtractor={service => service.id}
      data={favouriteServicesList}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={renderItem}
    />
  );
}
