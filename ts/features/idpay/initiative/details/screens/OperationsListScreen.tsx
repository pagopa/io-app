import { useRoute } from "@react-navigation/core";
import { RouteProp } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import Placeholder from "rn-placeholder";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { showToast } from "../../../../../utils/showToast";
import { useTimelineDetailsBottomSheet } from "../../timeline/components/TimelineDetailsBottomSheet";
import {
  TimelineOperationListItem,
  TimelineOperationListItemSkeleton
} from "../components/TimelineOperationListItem";
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
    isUpdating,
    isRefreshing,
    timeline,
    fetchNextPage,
    fetchPage,
    refresh,
    lastUpdate
  } = useInitiativeTimelineFetcher(initiativeId, 10, handleOnError);

  // We need to know if this is the first rendering in order to show the loading spinner overlay
  const isFirstRenderDispatchedRef = React.useRef(false);

  useOnFirstRender(() => {
    fetchPage(0);
    // eslint-disable-next-line functional/immutable-data
    isFirstRenderDispatchedRef.current = true;
  });

  const isFirstLoading = isFirstRenderDispatchedRef.current
    ? timeline.length === 0 && isLoading
    : true;

  const detailsBottomSheet = useTimelineDetailsBottomSheet(initiativeId);

  const showOperationDetailsBottomSheet = (operation: OperationListDTO) =>
    detailsBottomSheet.present(operation);

  const lastUpdateComponent = pipe(
    lastUpdate,
    O.fromNullable,
    O.map(date => formatDateAsLocal(date, true)),
    O.fold(
      () => (
        <Placeholder.Box animate="fade" height={18} width={70} radius={4} />
      ),
      dateString => <Body weight="SemiBold">{dateString}</Body>
    )
  );

  const operationList = isFirstLoading ? (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={Array.from({ length: 10 })}
      keyExtractor={(_, index) => `placeholder${index}`}
      renderItem={() => <TimelineOperationListItemSkeleton />}
      onRefresh={refresh}
      refreshing={isRefreshing}
    />
  ) : (
    <FlatList
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
      ListFooterComponent={isUpdating ? <TimelineLoader /> : null}
    />
  );

  return (
    <>
      <BaseScreenComponent
        headerTitle={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.header"
        )}
        goBack={true}
      >
        <ContentWrapper>
          <H1>
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.title"
            )}
          </H1>
          <VSpacer size={8} />
          <Body>
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.lastUpdated"
            )}
            <HSpacer size={4} />
            {lastUpdateComponent}
          </Body>
        </ContentWrapper>
        <VSpacer size={16} />
        {operationList}
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
    paddingBottom: 120,
    paddingHorizontal: customVariables.contentPadding
  }
});
