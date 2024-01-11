import { Divider, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useTimelineDetailsBottomSheet } from "../../timeline/components/TimelineDetailsBottomSheet";
import { IDPayDetailsRoutes } from "../navigation";
import {
  idpayOperationListSelector,
  idpayPaginatedTimelineSelector
} from "../store";
import { TimelineOperationListItem } from "./TimelineOperationListItem";

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
    navigation.push(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE,
      params: {
        initiativeId
      }
    });
  };

  const renderTimelineContent = () => {
    if (isLoading) {
      return <TimelineComponentSkeleton size={size} />;
    }

    if (timeline.length === 0) {
      return <EmptyTimelineComponent />;
    }

    return (
      <>
        {timeline.slice(0, size).map((operation, index) => (
          <React.Fragment key={operation.operationId}>
            <TimelineOperationListItem
              operation={operation}
              onPress={() => detailsBottomSheet.present(operation)}
            />
            {index < size - 1 ? <Divider /> : undefined}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <View testID="IDPayTimelineTestID">
      <TimelineHeaderComponent onShowMorePress={navigateToOperationsList} />
      <VSpacer size={8} />
      {renderTimelineContent()}
      {detailsBottomSheet.bottomSheet}
    </View>
  );
};

const TimelineHeaderComponent = (props: { onShowMorePress?: () => void }) => (
  <View style={[IOStyles.row, IOStyles.rowSpaceBetween]}>
    <H3>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
      )}
    </H3>
    <Body weight="SemiBold" color="blue" onPress={props.onShowMorePress}>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
      )}
    </Body>
  </View>
);

const TimelineComponentSkeleton = ({ size = 3 }: Pick<Props, "size">) => (
  <View testID="IDPayTimelineSkeletonTestID">
    {Array.from({ length: size }).map((_, index) => (
      <React.Fragment key={index}>
        <TimelineOperationListItem isLoading={true} />
        {index < size - 1 ? <Divider /> : undefined}
      </React.Fragment>
    ))}
  </View>
);

const EmptyTimelineComponent = () => (
  <LabelSmall
    weight="Regular"
    color="bluegreyDark"
    testID="IDPayEmptyTimelineTestID"
  >
    {I18n.t(
      "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
    )}
  </LabelSmall>
);

const InitiativeTimelineComponentSkeleton = ({
  size = 3
}: Pick<Props, "size">) => (
  <>
    <TimelineHeaderComponent />
    <VSpacer size={8} />
    <TimelineComponentSkeleton size={size} />
  </>
);

export { InitiativeTimelineComponent, InitiativeTimelineComponentSkeleton };
