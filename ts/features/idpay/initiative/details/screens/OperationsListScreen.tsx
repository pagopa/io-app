import { useRoute } from "@react-navigation/core";
import { RouteProp } from "@react-navigation/native";
import { View as NBView } from "native-base";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { showToast } from "../../../../../utils/showToast";
import { TimelineOperationListItem } from "../components/TimelineOperationListItem";
import { IDPayDetailsParamsList } from "../navigation";
import { useInitiativeTimelineFetcher } from "../utils/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { constantPollingFetch } from "../../../../../utils/fetch";
export type OperationsListScreenParams = { initiativeId: string };
type OperationsListScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_TIMELINE"
>;

const styles = StyleSheet.create({
  activityIndicator: {
    padding: 12
  },
  listContainer: {
    paddingBottom: 120
  }
});

const loader = () => (
  <ActivityIndicator
    animating={true}
    size={"large"}
    style={styles.activityIndicator}
    color={customVariables.brandPrimary}
    accessible={true}
    accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
    accessibilityLabel={I18n.t("global.accessibility.activityIndicator.label")}
    importantForAccessibility={"no-hide-descendants"}
    testID={"activityIndicator"}
  />
);
const renderItem = ({ item }: { item: OperationListDTO }) =>
  TimelineOperationListItem({ operation: item });

const keyExtractor = (operation: OperationListDTO) => operation.operationId;
const toast = () => showToast("Errore nel caricamento, riprova.");

export const OperationsListScreen = () => {
  const route = useRoute<OperationsListScreenRouteProps>();
  const { initiativeId } = route.params;

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const isFirstRenderDispatchedRef = React.useRef(false);
  const { isLoading, timeline, fetchNextPage, resetTimeline, currentPage } =
    useInitiativeTimelineFetcher(initiativeId, 10, toast);

  const shouldRenderLoader = isLoading && !isRefreshing;
  const isFirstLoading = isFirstRenderDispatchedRef.current
    ? timeline.operationsRecord.length === 0 && shouldRenderLoader
    : true;

  const refreshTimeline = () => {
    if (isRefreshing) {
      return;
    }
    setIsRefreshing(true);
    resetTimeline();
  };
  const renderLoader = () => (shouldRenderLoader ? loader() : null);

  useOnFirstRender(() => {
    resetTimeline();
    // eslint-disable-next-line functional/immutable-data
    isFirstRenderDispatchedRef.current = true;
  });
  React.useEffect(() => {
    if (currentPage >= 0 && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [currentPage, isRefreshing]);
  const pageContent = (
    <SafeAreaView>
      <View style={IOStyles.horizontalContentPadding}>
        <H1>
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.title"
          )}
        </H1>
        {isRefreshing ? null : (
          <Body>
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.lastUpdated"
            )}
            <Body weight="SemiBold">
              {formatDateAsLocal(timeline.lastUpdate, true)}
            </Body>
          </Body>
        )}
      </View>
      <NBView spacer large />
      <FlatList
        style={IOStyles.horizontalContentPadding}
        contentContainerStyle={styles.listContainer}
        data={timeline.operationsRecord}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={refreshTimeline}
        refreshing={isRefreshing}
        ListFooterComponent={renderLoader}
      />
    </SafeAreaView>
  );

  return (
    <BaseScreenComponent
      headerTitle={I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.header"
      )}
      goBack={true}
    >
      <LoadingSpinnerOverlay isLoading={isFirstLoading} loadingOpacity={100}>
        {isFirstLoading ? null : pageContent}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};
