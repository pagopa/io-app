import {
  Body,
  Divider,
  H6,
  BodySmall,
  VSpacer,
  ListItemHeader
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { Fragment } from "react";
import { View } from "react-native";
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
  idpayInitiativeDetailsSelector,
  idpayOperationListSelector,
  idpayPaginatedTimelineSelector
} from "../store";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
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
  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);
  const initiative = pot.toUndefined(initiativeDataPot);

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
          <Fragment key={operation.operationId}>
            <TimelineOperationListItem
              operation={operation}
              pressable={
                initiative?.initiativeRewardType !==
                InitiativeRewardTypeEnum.EXPENSE
              }
              onPress={() => detailsBottomSheet.present(operation)}
            />
            {index < size - 1 ? <Divider /> : undefined}
          </Fragment>
        ))}
      </>
    );
  };

  return (
    <View testID="IDPayTimelineTestID">
      <ListItemHeader
        label={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
        )}
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
            ),
            onPress: navigateToOperationsList
          }
        }}
      />
      {renderTimelineContent()}
      {detailsBottomSheet.bottomSheet}
    </View>
  );
};

const TimelineHeaderComponent = (props: { onShowMorePress?: () => void }) => (
  <View style={[IOStyles.row, IOStyles.rowSpaceBetween]}>
    <H6>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
      )}
    </H6>
    <Body weight="Semibold" color="blue" onPress={props.onShowMorePress}>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
      )}
    </Body>
  </View>
);

const TimelineComponentSkeleton = ({ size = 3 }: Pick<Props, "size">) => (
  <View testID="IDPayTimelineSkeletonTestID">
    {Array.from({ length: size }).map((_, index) => (
      <Fragment key={index}>
        <TimelineOperationListItem isLoading={true} />
        {index < size - 1 ? <Divider /> : undefined}
      </Fragment>
    ))}
  </View>
);

const EmptyTimelineComponent = () => (
  <BodySmall
    weight="Regular"
    color="bluegreyDark"
    testID="IDPayEmptyTimelineTestID"
  >
    {I18n.t(
      "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
    )}
  </BodySmall>
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
