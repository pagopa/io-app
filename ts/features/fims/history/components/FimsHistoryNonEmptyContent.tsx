import { Divider, IOStyles } from "@pagopa/io-app-design-system";
import { FlashList } from "@shopify/flash-list";
import { AccessHistoryPage } from "../../../../../definitions/fims_history/AccessHistoryPage";
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
  accesses,
  fetchMore
}: {
  accesses?: AccessHistoryPage;
  fetchMore: () => void;
}) => {
  const historyExportState = useIOSelector(fimsHistoryExportStateSelector);
  const isHistoryExporting = RemoteValue.isLoading(historyExportState);
  const isHistoryLoading = useIOSelector(isFimsHistoryLoadingSelector);

  const { handleExportOnPress } = useFimsHistoryExport();

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const LoadingFooter = () =>
    isHistoryLoading && (
      <LoadingFimsHistoryItemsFooter
        showFirstDivider={(accesses?.data.length ?? 0) > 0}
      />
    );
  const shouldHideFooter =
    isHistoryLoading && (accesses?.data.length ?? 0) === 0;

  return (
    <>
      <FlashList
        estimatedItemSize={117}
        ListHeaderComponent={FimsHistoryHeaderComponent}
        data={accesses?.data}
        contentContainerStyle={{
          ...IOStyles.horizontalContentPadding,
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
        ItemSeparatorComponent={Divider}
        keyExtractor={item => item.id}
        renderItem={item => <FimsHistoryListItem item={item.item} />}
        onEndReached={fetchMore}
        ListFooterComponent={LoadingFooter}
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
