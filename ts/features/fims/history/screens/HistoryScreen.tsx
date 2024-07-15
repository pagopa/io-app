import {
  Body,
  Divider,
  H2,
  IOStyles,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Placeholder from "rn-placeholder";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { Consent } from "../../../../../definitions/fims/Consent";
import { ConsentsResponseDTO } from "../../../../../definitions/fims/ConsentsResponseDTO";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { dateToAccessibilityReadableFormat } from "../../../../utils/accessibility";
import { serviceByIdSelector } from "../../../services/details/store/reducers";
import { fimsHistoryGet } from "../store/actions";
import { fimsHistoryPotSelector } from "../store/selectors";
import I18n from "../../../../i18n";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();
  const historyPot = useIOSelector(fimsHistoryPotSelector);

  React.useEffect(() => {
    dispatch(fimsHistoryGet.request({ isFirstRequest: true }));
  }, [dispatch]);

  useHeaderSecondLevel({
    title: "History"
  });

  const isHistoryLoading = pot.isLoading(historyPot);

  if (historyPot.kind === "PotNoneLoading") {
    return <HistoryList isLoading />;
  }

  return pipe(
    historyPot,
    pot.toOption,
    O.fold(
      () => null,
      consents => (
        <HistoryList consents={consents} isLoading={isHistoryLoading} />
      )
    )
  );
};

// ----------------- components --------------

type HistoryListItemProps = {
  item: NonNullable<Consent>;
};

const HistoryListItem = ({ item }: HistoryListItemProps) => {
  const serviceData = useIOSelector(state =>
    serviceByIdSelector(state, item.service_id as ServiceId)
  );
  // return
  // serviceData !== undefined ? (
  return (
    <ListItemNav
      key={item.id}
      onPress={() => null}
      value={serviceData?.service_name ?? "MISSING_ORG_NAME"}
      topElement={{
        dateValue: dateToAccessibilityReadableFormat(item.timestamp)
      }}
      description={item.redirect?.display_name}
      hideChevron
    />
  );
  // ) : (
  //   <></>
  // );
};

type HistoryListProps = {
  consents?: ConsentsResponseDTO;
  isLoading?: boolean;
};
const HistoryList = ({ consents, isLoading }: HistoryListProps) => {
  const dispatch = useIODispatch();

  const fetchMore = () => {
    if (consents?.continuationToken) {
      dispatch(
        fimsHistoryGet.request({
          continuationToken: consents.continuationToken,
          isFirstRequest: false
        })
      );
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={IOStyles.horizontalContentPadding}>
        <H2>{I18n.t("FIMS.history.historyScreen.header")}</H2>
        <VSpacer size={16} />
        <Body>{I18n.t("FIMS.history.historyScreen.body")}</Body>
      </View>
      <VSpacer size={16} />
      <FlatList
        data={consents?.items}
        contentContainerStyle={IOStyles.horizontalContentPadding}
        ItemSeparatorComponent={Divider}
        renderItem={item => <HistoryListItem item={item.item} />}
        onEndReached={fetchMore}
        ListFooterComponent={() =>
          isLoading && (
            <LoadingItemsPlaceholder
              showFirstDivider={(consents?.items.length ?? 0) > 0}
            />
          )
        }
      />
    </SafeAreaView>
  );
};

const LoadingItemsPlaceholder = ({
  showFirstDivider
}: {
  showFirstDivider?: boolean;
}) => (
  <>
    {showFirstDivider && <Divider />}
    <LoadingListItem />
    <Divider />
    <LoadingListItem />
    <Divider />
    <LoadingListItem />
    <Divider />
    <LoadingListItem />
    <Divider />
    <LoadingListItem />
  </>
);

const LoadingListItem = () => (
  <View style={{ paddingVertical: 16 }}>
    <Placeholder.Box height={16} width={178} radius={8} animate="fade" />
  </View>
);
