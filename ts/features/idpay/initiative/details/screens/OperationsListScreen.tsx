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
import { TimelineOperationCard } from "../components/TimelineOperationListItem";
import { IDPayDetailsParamsList } from "../navigation";
import { useInitiativeTimelineFetcher } from "../utils/hooks";

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

const renderLoader = (isLoading: boolean) =>
  isLoading ? (
    <ActivityIndicator
      animating={true}
      size={"large"}
      style={styles.activityIndicator}
      color={customVariables.brandPrimary}
      accessible={true}
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      importantForAccessibility={"no-hide-descendants"}
      testID={"activityIndicator"}
    />
  ) : null;

export const OperationsListScreen = () => {
  const route = useRoute<OperationsListScreenRouteProps>();
  const { initiativeId } = route.params;

  const { isLoading, isFirstLoading, timeline, fetchNextPage } =
    useInitiativeTimelineFetcher(initiativeId, 10);

  const pageContent = (
    <SafeAreaView>
      <View style={IOStyles.horizontalContentPadding}>
        <H1>
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.title"
          )}
        </H1>
        <Body>
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.lastUpdated"
          )}
          <Body weight="SemiBold">
            {formatDateAsLocal(timeline.lastUpdate, true)}
          </Body>
        </Body>
      </View>
      <NBView spacer large />
      <FlatList
        style={IOStyles.horizontalContentPadding}
        contentContainerStyle={styles.listContainer}
        data={timeline.operationList}
        keyExtractor={item => item.operationId}
        renderItem={({ item }) => TimelineOperationCard({ transaction: item })}
        onEndReached={() => fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => renderLoader(isLoading)}
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
