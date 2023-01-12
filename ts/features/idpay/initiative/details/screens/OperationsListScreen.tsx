import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useRoute } from "@react-navigation/core";
import { View as NBView } from "native-base";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import customVariables from "../../../../../theme/variables";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { pickTransactionCard } from "../components/TimelineTransactionCards";
import { idpayTimelinePageSelector, idpayTimelineSelector } from "../store";

export type OperationListRouteParams = { initiativeId: string };
type RouteProps = Route<"IDPAY_OPERATIONS_LIST", OperationListRouteParams>;

const styles = StyleSheet.create({
  activityIndicator: {
    padding: 12
  }
});

const shouldShowLoader = (isLoading: boolean) =>
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

import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as InstrumentOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { idpayTimelinePaginationGet } from "../store/actions";
// const mockData: TimelineDTO = {
//   lastUpdate: new Date(),
//   operationList: [
//     {
//       operationType: TransactionOperationTypeEnum.TRANSACTION,
//       operationDate: new Date(),
//       amount: 133.99,
//       brandLogo:
//         "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
//       circuitType: "MASTERCARD",
//       maskedPan: "1234",
//       operationId: "6"
//     },
//     {
//       operationType: TransactionOperationTypeEnum.REVERSAL,
//       operationDate: new Date(),
//       amount: 133.99,
//       brandLogo:
//         "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
//       circuitType: "MASTERCARD",
//       maskedPan: "1234",
//       operationId: "7"
//     },
//     {
//       operationType: OnboardingOperationTypeEnum.ONBOARDING,
//       operationDate: new Date(),
//       operationId: "0"
//     },
//     {
//       operationType: IbanOperationTypeEnum.ADD_IBAN,
//       operationDate: new Date(),
//       iban: "IT1234567890123456789012345",
//       operationId: "1",
//       channel: "APP"
//     },
//     {
//       operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
//       operationDate: new Date(),
//       brandLogo:
//         "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
//       maskedPan: "1234",
//       operationId: "2",
//       channel: "APP"
//     },
//     {
//       operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
//       operationDate: new Date(),
//       brandLogo:
//         "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_visa.png",
//       maskedPan: "1234",
//       operationId: "3",
//       channel: "APP"
//     },
//     {
//       operationType: InstrumentOperationTypeEnum.DELETE_INSTRUMENT,
//       operationDate: new Date(),
//       brandLogo:
//         "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
//       maskedPan: "1234",
//       operationId: "4",
//       channel: "APP"
//     },
//     {
//       operationType: InstrumentOperationTypeEnum.DELETE_INSTRUMENT,
//       operationDate: new Date(),
//       brandLogo:
//         "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_visa.png",
//       maskedPan: "1234",
//       operationId: "5",
//       channel: "APP"
//     }
//   ]
// };

export const OperationsListScreen = () => {
  const route = useRoute<RouteProps>();
  const { initiativeId } = route.params;
  const dispatch = useIODispatch();

  const timelineFromSelector = useIOSelector(idpayTimelineSelector);
  const timelinePageFromSelector = useIOSelector(idpayTimelinePageSelector);
  const isTimelineLoading = pot.isLoading(timelineFromSelector);
  const timelineSome = pot.getOrElse(timelineFromSelector, {
    lastUpdate: new Date(),
    operationList: []
  });
  const isTimelinePageLoading = pot.isLoading(timelinePageFromSelector);
  const fetchMoreItems = () => {
    if (!pot.isError(timelinePageFromSelector) && !isTimelinePageLoading) {
      dispatch(idpayTimelinePaginationGet.request({ initiativeId }));
    }
  };

  const renderContent = () => (
    <View style={IOStyles.horizontalContentPadding}>
      <H1>Lista operazioni</H1>
      <Body>
        Ultimo aggiornamento:{" "}
        <Body weight="SemiBold">
          {formatDateAsLocal(timelineSome.lastUpdate, true)}
        </Body>
      </Body>
      <NBView spacer large />
      <FlatList
        style={{ height: "100%" }}
        data={timelineSome.operationList}
        keyExtractor={item => item.operationId}
        renderItem={({ item }) => pickTransactionCard(item)}
        onEndReached={fetchMoreItems}
        onEndReachedThreshold={0.2}
        ListFooterComponent={() => shouldShowLoader(isTimelinePageLoading)}
      />
    </View>
  );

  return (
    <BaseScreenComponent headerTitle="Tutte le operazioni" goBack={true}>
      <LoadingSpinnerOverlay isLoading={isTimelineLoading} loadingOpacity={95}>
        {isTimelineLoading ? null : renderContent()}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};
