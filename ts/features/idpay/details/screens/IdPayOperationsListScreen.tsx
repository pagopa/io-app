import {
  ContentWrapper,
  Divider,
  HSpacer,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/core";
import { RouteProp } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import Placeholder from "rn-placeholder";
import { OperationListDTO } from "../../../../../definitions/idpay/OperationListDTO";
import { IOToast } from "../../../../components/Toast";
import { Body } from "../../../../components/core/typography/Body";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { localeDateFormat } from "../../../../utils/locale";
import { useTimelineDetailsBottomSheet } from "../../timeline/components/TimelineDetailsBottomSheet";
import { TimelineOperationListItem } from "../components/TimelineOperationListItem";
import { useInitiativeTimelineFetcher } from "../hooks/useInitiativeTimelineFetcher";
import { IDPayDetailsParamsList } from "../navigation";

export type IdPayOperationsListScreenParams = { initiativeId: string };

type IdPayOperationsListScreenRouteProps = RouteProp<
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

export const IdPayOperationsListScreen = () => {
  const route = useRoute<IdPayOperationsListScreenRouteProps>();
  const { initiativeId } = route.params;

  const handleOnError = () => {
    IOToast.error("Errore nel caricamento, riprova.");
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
    O.map(date =>
      localeDateFormat(
        date,
        I18n.t("global.dateFormats.fullFormatFullMonthLiteral")
      )
    ),
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
      renderItem={() => <TimelineOperationListItem isLoading={true} />}
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
      ItemSeparatorComponent={() => <Divider />}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      onRefresh={refresh}
      refreshing={isRefreshing}
      ListFooterComponent={isUpdating ? <TimelineLoader /> : null}
    />
  );

  return (
    <RNavScreenWithLargeHeader
      title={I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.title"
      )}
    >
      <ContentWrapper>
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
      {detailsBottomSheet.bottomSheet}
    </RNavScreenWithLargeHeader>
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
