import * as pot from "@pagopa/ts-commons/lib/pot";
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
import { heightPercentageToDP } from "react-native-responsive-screen";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import customVariables from "../../../../../theme/variables";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { TimelineOperationCard } from "../components/TimelineTransactionCards";
import { IDPayDetailsParamsList } from "../navigation";
import { idpayTimelineSelector } from "../store";
import { idpayTimelinePageGet } from "../store/actions";

export type OperationsListScreenParams = { initiativeId: string };
type OperationsListScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_TIMELINE"
>;

const styles = StyleSheet.create({
  activityIndicator: {
    padding: 12
  },
  flatListContainer: {
    height: heightPercentageToDP(70) // forces the list to not overflow
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

const useTimelineFetcher = (initiativeId: string) => {
  const dispatch = useIODispatch();
  const timelineFromSelector = useIOSelector(idpayTimelineSelector);

  const isLoading = pot.isLoading(timelineFromSelector);
  const isError = pot.isError(timelineFromSelector);

  const timeline = pot.getOrElse(timelineFromSelector, {
    lastUpdate: new Date(),
    operationList: []
  });
  const page = React.useRef(0);

  const fetchNextPage = () => {
    if (!isError && !isLoading) {
      page.current = page.current + 1;
      dispatch(
        idpayTimelinePageGet.request({ initiativeId, page: page.current })
      );
    }
  };

  return {
    isLoading,
    timeline,
    fetchNextPage
  } as const;
};

export const OperationsListScreen = () => {
  const route = useRoute<OperationsListScreenRouteProps>();
  const { initiativeId } = route.params;

  const {
    isLoading,
    timeline,
    fetchNextPage: nextPage
  } = useTimelineFetcher(initiativeId);

  return (
    <BaseScreenComponent
      headerTitle={I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.header"
      )}
      goBack={true}
    >
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
        <View style={styles.flatListContainer}>
          <FlatList
            style={IOStyles.horizontalContentPadding}
            data={timeline.operationList}
            keyExtractor={item => item.operationId}
            renderItem={({ item }) =>
              TimelineOperationCard({ transaction: item })
            }
            onEndReached={nextPage}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => renderLoader(isLoading)}
          />
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
