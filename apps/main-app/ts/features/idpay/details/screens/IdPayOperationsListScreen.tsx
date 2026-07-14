import {
  Body,
  Divider,
  HSpacer,
  IOSkeleton,
  IOToast,
  IOVisualCostants,
  LoadingSpinner,
  VSpacer
} from "@io-app/design-system";
import { useRoute } from "@react-navigation/core";
import { RouteProp } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useRef } from "react";
import { View } from "react-native";
import { OperationListDTO } from "../../../../../definitions/idpay/OperationListDTO";
import { IOListViewWithLargeHeader } from "../../../../components/ui/IOListViewWithLargeHeader";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIdPayTimelineDetailsBottomSheet } from "../../timeline/components/IdPayTimelineDetailsBottomSheet";
import { IdPayTimelineOperationListItem } from "../components/IdPayTimelineOperationListItem";
import { useInitiativeTimelineFetcher } from "../hooks/useInitiativeTimelineFetcher";
import { IDPayDetailsParamsList } from "../navigation";

export type IdPayOperationsListScreenParams = { initiativeId: string };

type IdPayOperationsListScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_TIMELINE"
>;

const TimelineLoader = () => (
  <View style={{ paddingVertical: 16, alignItems: "center" }}>
    <LoadingSpinner
      size={48}
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      testID={"activityIndicator"}
    />
  </View>
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
  const isFirstRenderDispatchedRef = useRef(false);

  useOnFirstRender(() => {
    fetchPage(0);
    // eslint-disable-next-line functional/immutable-data
    isFirstRenderDispatchedRef.current = true;
  });

  const isFirstLoading = isFirstRenderDispatchedRef.current
    ? timeline.length === 0 && isLoading
    : true;

  const detailsBottomSheet = useIdPayTimelineDetailsBottomSheet(initiativeId);

  const showOperationDetailsBottomSheet = (operation: OperationListDTO) =>
    detailsBottomSheet.present(operation);

  const lastUpdateComponent = pipe(
    lastUpdate,
    O.fromNullable,
    O.map(date =>
      new Intl.DateTimeFormat("it", {
        year: "numeric",
        month: "long",
        day: "2-digit"
      }).format(date)
    ),
    O.fold(
      () => <IOSkeleton shape="rectangle" height={18} width={70} radius={4} />,
      dateString => <Body weight="Semibold">{dateString}</Body>
    )
  );

  return (
    <IOListViewWithLargeHeader
      skeleton={<IdPayTimelineOperationListItem isLoading />}
      data={timeline}
      loading={isFirstLoading}
      keyExtractor={item => item.operationId}
      renderItem={({ item }) => (
        <IdPayTimelineOperationListItem
          operation={item}
          onPress={() => showOperationDetailsBottomSheet(item)}
        />
      )}
      ListHeaderComponent={
        <>
          <Body>
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.lastUpdated"
            )}
            <HSpacer size={4} />
            {lastUpdateComponent}
          </Body>
          <VSpacer size={16} />
        </>
      }
      contentContainerStyle={{
        paddingBottom: 120,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      ItemSeparatorComponent={() => <Divider />}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      onRefresh={refresh}
      refreshing={isRefreshing}
      ListFooterComponent={isUpdating ? <TimelineLoader /> : null}
      title={{
        label: I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.title"
        )
      }}
    >
      {detailsBottomSheet.bottomSheet}
    </IOListViewWithLargeHeader>
  );
};
