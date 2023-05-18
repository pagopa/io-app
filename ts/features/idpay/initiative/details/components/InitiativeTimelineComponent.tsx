import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { useTimelineDetailsBottomSheet } from "../../timeline/components/TimelineDetailsBottomSheet";
import { IDPayDetailsRoutes } from "../navigation";
import {
  idpayOperationListSelector,
  idpayPaginatedTimelineSelector
} from "../store";
import {
  TimelineOperationListItem,
  TimelineOperationListItemSkeleton
} from "./TimelineOperationListItem";

const styles = StyleSheet.create({
  spaceBetween: {
    justifyContent: "space-between"
  }
});

type Props = {
  initiativeId: string;
  size?: number;
};

const InitiativeTimelineComponent = ({ initiativeId, size = 3 }: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const detailsBottomSheet = useTimelineDetailsBottomSheet(initiativeId);

  const paginatedTimelinePot = useIOSelector(idpayPaginatedTimelineSelector);
  const timeline = useIOSelector(idpayOperationListSelector);
  const isLoading = pot.isLoading(paginatedTimelinePot);

  const navigateToOperationsList = () => {
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE,
      params: {
        initiativeId
      }
    });
  };

  const showOperationDetailsBottomSheet = (operation: OperationListDTO) =>
    detailsBottomSheet.present(operation);

  const renderTimelineContent = () => {
    if (isLoading) {
      return <InitiativeTimelineComponentSkeleton size={size} />;
    }

    if (timeline.length === 0) {
      return (
        <LabelSmall weight="Regular" color="bluegreyDark">
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
          )}
          <LabelSmall weight="SemiBold">
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsLink"
            )}
          </LabelSmall>
        </LabelSmall>
      );
    }

    return (
      <>
        {timeline.slice(0, size).map(operation => (
          <TimelineOperationListItem
            key={operation.operationId}
            operation={operation}
            onPress={() => showOperationDetailsBottomSheet(operation)}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <View style={[IOStyles.row, styles.spaceBetween]}>
        <H3>
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
          )}
        </H3>
        <Body weight="SemiBold" color="blue" onPress={navigateToOperationsList}>
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
          )}
        </Body>
      </View>
      <VSpacer size={8} />
      {renderTimelineContent()}
      {detailsBottomSheet.bottomSheet}
    </>
  );
};

type SkeletonProps = {
  size?: number;
};

const InitiativeTimelineComponentSkeleton = ({ size = 3 }: SkeletonProps) => (
  <>
    <View style={[IOStyles.row, styles.spaceBetween]}>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
        )}
      </H3>
      <Body weight="SemiBold" color="blue">
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
        )}
      </Body>
    </View>
    <VSpacer size={8} />
    {Array.from({ length: size }).map((_, index) => (
      <TimelineOperationListItemSkeleton key={index} />
    ))}
  </>
);

export { InitiativeTimelineComponent, InitiativeTimelineComponentSkeleton };
