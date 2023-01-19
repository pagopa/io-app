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
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { showToast } from "../../../../../utils/showToast";
import { TimelineOperationListItem } from "../components/TimelineOperationListItem";
import { IDPayDetailsParamsList } from "../navigation";
import { useInitiativeTimelineFetcher } from "../utils/hooks";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
export type OperationsListScreenParams = { initiativeId: string };
type OperationsListScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_TIMELINE"
>;

const TimelineLoader = () => (
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

const renderItem = ({ item }: { item: OperationListDTO }) => (
  <TimelineOperationListItem operation={item} />
);

const keyExtractor = (operation: OperationListDTO) => operation.operationId;

export const OperationsListScreen = () => {
  const route = useRoute<OperationsListScreenRouteProps>();
  const { initiativeId } = route.params;

  const handleOnError = () => {
    showToast("Errore nel caricamento, riprova.");
  };

  const {
    isLoading,
    timeline,
    fetchNextPage,
    fetchPage,
    refresh,
    isRefreshing,
    lastUpdate
  } = useInitiativeTimelineFetcher(initiativeId, 10, handleOnError);

  const shouldRenderLoader = isLoading && !isRefreshing;

  // We need to know if this is the first rendering in order to show the loading spinner overlay
  const isFirstRenderDispatchedRef = React.useRef(false);

  useOnFirstRender(() => {
    fetchPage(0);
    // eslint-disable-next-line functional/immutable-data
    isFirstRenderDispatchedRef.current = true;
  });

  const isFirstLoading = isFirstRenderDispatchedRef.current
    ? timeline.length === 0 && shouldRenderLoader
    : true;

  const renderContent = () => (
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
              {lastUpdate && formatDateAsLocal(lastUpdate, true)}
            </Body>
          </Body>
        )}
      </View>
      <NBView spacer large />
      <FlatList
        style={IOStyles.horizontalContentPadding}
        contentContainerStyle={styles.listContainer}
        data={timeline}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={refresh}
        refreshing={isRefreshing}
        ListFooterComponent={shouldRenderLoader ? <TimelineLoader /> : null}
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
        {isFirstLoading ? null : renderContent()}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    padding: 12
  },
  listContainer: {
    paddingBottom: 120
  }
});
