import I18n from "i18next";
import { useCallback, useMemo, useRef } from "react";
import {
  IOVisualCostants,
  ListItemHeader,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { Alert, ListRenderItemInfo, StyleSheet, View } from "react-native";
import { IOListViewWithLargeHeader } from "../../../../components/ui/IOListViewWithLargeHeader";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { sortedFavouriteServicesSelector } from "../store/selectors";
import ListItemSwipeAction from "../../../../components/ListItemSwipeAction";
import { removeFavouriteService } from "../store/actions";
import type { FavouriteServiceType } from "../types";
import { useSortFavouriteServicesBottomSheet } from "../hooks/useSortFavouriteServicesBottomSheet";

const styles = StyleSheet.create({
  listItemWrapper: {
    marginHorizontal: IOVisualCostants.appMarginDefault * -1
  }
});

export const FavouriteServicesScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const sortedServices = useIOSelector(sortedFavouriteServicesSelector);

  const { bottomSheet, present } = useSortFavouriteServicesBottomSheet();

  const ListHeaderComponent = useMemo(() => {
    if (sortedServices.length === 0) {
      return null;
    }

    return (
      <ListItemHeader
        label=""
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("services.favouriteServices.sortButton"),
            onPress: present
          }
        }}
      />
    );
  }, [present, sortedServices.length]);

  const ListEmptyComponent = useCallback(
    () => (
      <OperationResultScreenContent
        pictogram="empty"
        title={I18n.t("services.favouriteServices.emptyList.title")}
        subtitle={I18n.t("services.favouriteServices.emptyList.subtitle")}
        action={{
          label: I18n.t("services.favouriteServices.emptyList.searchAction"),
          icon: "search",
          onPress: () => navigation.navigate(SERVICES_ROUTES.SEARCH)
        }}
      />
    ),
    [navigation]
  );

  const openedItemRef = useRef<(() => void) | null>(null);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FavouriteServiceType>) => (
      <View style={styles.listItemWrapper}>
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
                  onPress: () => {
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
    <>
      <IOListViewWithLargeHeader
        headerActionsProp={{ showHelp: true }}
        title={{ label: I18n.t("services.favouriteServices.title") }}
        keyExtractor={service => service.id}
        data={sortedServices}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
      />
      {bottomSheet}
    </>
  );
};
