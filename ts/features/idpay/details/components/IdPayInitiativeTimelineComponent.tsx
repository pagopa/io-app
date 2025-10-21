import {
  Body,
  BodySmall,
  Divider,
  H6,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, Fragment } from "react";
import { View } from "react-native";
import I18n from "i18next";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useIdPayTimelineDetailsBottomSheet } from "../../timeline/components/IdPayTimelineDetailsBottomSheet";
import { IDPayDetailsRoutes } from "../navigation";
import {
  idpayInitiativeDetailsSelector,
  idpayOperationListSelector,
  idpayPaginatedTimelineSelector
} from "../store";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import { IdPayTimelineOperationListItem } from "./IdPayTimelineOperationListItem";

type Props = {
  initiativeId: string;
  size?: number;
};

const IdPayInitiativeTimelineComponent = ({
  initiativeId,
  size = 3
}: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const detailsBottomSheet = useIdPayTimelineDetailsBottomSheet(initiativeId);

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
            <IdPayTimelineOperationListItem
              operation={operation}
              pressable={
                initiative?.initiativeRewardType !==
                InitiativeRewardTypeEnum.EXPENSE
              }
              onPress={() => detailsBottomSheet.present(operation)}
            />
            {index < size - 1 && index !== timeline.length - 1 ? (
              <Divider />
            ) : undefined}
          </Fragment>
        ))}
      </>
    );
  };

  const showAllCta: ComponentProps<typeof ListItemHeader>["endElement"] =
    timeline.length >= size
      ? {
          type: "buttonLink",
          componentProps: {
            label: I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
            ),
            onPress: navigateToOperationsList
          }
        }
      : undefined;

  return (
    <View testID="IDPayTimelineTestID">
      <VSpacer size={16} />
      <ListItemHeader
        label={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
        )}
        endElement={showAllCta}
      />
      {renderTimelineContent()}
      {detailsBottomSheet.bottomSheet}
    </View>
  );
};

const TimelineHeaderComponent = ({
  onShowMorePress
}: {
  onShowMorePress?: () => void;
}) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    <H6>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
      )}
    </H6>
    {onShowMorePress && (
      <Body weight="Semibold" asLink onPress={onShowMorePress}>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
        )}
      </Body>
    )}
  </View>
);

const TimelineComponentSkeleton = ({ size = 3 }: Pick<Props, "size">) => (
  <View testID="IDPayTimelineSkeletonTestID">
    {Array.from({ length: size }).map((_, index) => (
      <Fragment key={index}>
        <IdPayTimelineOperationListItem isLoading={true} />
        {index < size - 1 ? <Divider /> : undefined}
      </Fragment>
    ))}
  </View>
);

const EmptyTimelineComponent = () => (
  <BodySmall weight="Regular" testID="IDPayEmptyTimelineTestID">
    {I18n.t(
      "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
    )}
  </BodySmall>
);

const IdPayInitiativeTimelineComponentSkeleton = ({
  size = 3
}: Pick<Props, "size">) => (
  <>
    <TimelineHeaderComponent />
    <VSpacer size={8} />
    <TimelineComponentSkeleton size={size} />
  </>
);

export {
  IdPayInitiativeTimelineComponent,
  IdPayInitiativeTimelineComponentSkeleton
};
