import { useRoute } from "@react-navigation/core";
import { RouteProp } from "@react-navigation/native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../../definitions/idpay/TransactionOperationDTO";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
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
import { useTimelineDetailsBottomSheet } from "../components/TimelineDetailsBottomSheet";
import { TimelineOperationListItem } from "../components/TimelineOperationListItem";
import { IDPayDetailsParamsList } from "../navigation";
import { useInitiativeTimelineFetcher } from "../utils/hooks";
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

  const detailsBottomSheet = useTimelineDetailsBottomSheet(initiativeId);

  const showOperationDetailsBottomSheet = (operation: OperationListDTO) => {
    if (operation.operationType === TransactionOperationTypeEnum.TRANSACTION) {
      // Currently we only show details for transaction operations
      detailsBottomSheet.present(operation.operationId);
    }
  };

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
      <VSpacer size={24} />
      <FlatList
        style={IOStyles.horizontalContentPadding}
        contentContainerStyle={styles.listContainer}
        data={timeline}
        keyExtractor={item => item.operationId}
        renderItem={({ item }) => (
          <TimelineOperationListItem
            operation={item}
            onPress={() => showOperationDetailsBottomSheet(item)}
          />
        )}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={refresh}
        refreshing={isRefreshing}
        ListFooterComponent={shouldRenderLoader ? <TimelineLoader /> : null}
      />
    </SafeAreaView>
  );

  return (
    <>
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
      {detailsBottomSheet.bottomSheet}
    </>
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
