import { Divider, IOStyles } from "@pagopa/io-app-design-system";
import * as React from "react";
import { FlatList } from "react-native";
import { ConsentsResponseDTO } from "../../../../../definitions/fims/ConsentsResponseDTO";
import * as RemoteValue from "../../../../common/model/RemoteValue";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useFooterActionsMeasurements } from "../../../../hooks/useFooterActionsMeasurements";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { FimsHistoryListItem } from "../components/FimsHistoryListItem";
import { LoadingFimsHistoryItemsFooter } from "../components/FimsHistoryLoaders";
import { useFimsHistoryExport } from "../hooks/useFimsHistoryResultToasts";
import {
  fimsHistoryExportStateSelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";
import { FimsHistoryHeaderComponent } from "./FimsHistoryHeaderComponent";

export const FimsHistoryNonEmptyContent = ({
  consents,
  fetchMore
}: {
  consents?: ConsentsResponseDTO;
  fetchMore: () => void;
}) => {
  const historyExportState = useIOSelector(fimsHistoryExportStateSelector);
  const isHistoryExporting = RemoteValue.isLoading(historyExportState);
  const isHistoryLoading = useIOSelector(isFimsHistoryLoadingSelector);

  const { handleExportOnPress } = useFimsHistoryExport();

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const renderLoadingFooter = () => (
    <>
      {isHistoryLoading && (
        <LoadingFimsHistoryItemsFooter
          showFirstDivider={(consents?.items.length ?? 0) > 0}
        />
      )}
    </>
  );
  const shouldHideFooter =
    isHistoryLoading && (consents?.items.length ?? 0) === 0;

  return (
    <>
      <FlatList
        ListHeaderComponent={FimsHistoryHeaderComponent}
        data={consents?.items}
        contentContainerStyle={[
          IOStyles.horizontalContentPadding,
          {
            paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
          }
        ]}
        ItemSeparatorComponent={Divider}
        keyExtractor={item => item.id}
        renderItem={item => <FimsHistoryListItem item={item.item} />}
        onEndReached={fetchMore}
        ListFooterComponent={renderLoadingFooter}
      />
      {!shouldHideFooter && (
        <FooterActions
          onMeasure={handleFooterActionsMeasurements}
          actions={{
            type: "SingleButton",
            primary: {
              loading: isHistoryExporting,
              label: I18n.t("FIMS.history.exportData.CTA"),
              onPress: handleExportOnPress
            }
          }}
        />
      )}
    </>
  );
};
