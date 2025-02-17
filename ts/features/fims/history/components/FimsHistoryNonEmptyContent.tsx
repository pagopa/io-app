import { Divider, FooterActions, IOStyles } from "@pagopa/io-app-design-system";
import { FlashList } from "@shopify/flash-list";
import { AccessHistoryPage } from "../../../../../definitions/fims_history/AccessHistoryPage";
import { useFooterActionsMeasurements } from "../../../../hooks/useFooterActionsMeasurements";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { useFimsHistoryExport } from "../hooks/useFimsHistoryResultToasts";
import {
  isFimsHistoryExportingSelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";
import { FimsHistoryHeaderComponent } from "./FimsHistoryHeaderComponent";
import { FimsHistoryListItemPicker } from "./FimsHistoryListItemPicker";
import { LoadingFimsHistoryItemsFooter } from "./FimsHistoryLoaders";

export type FimsHistoryNonEmptyContentProps = {
  accesses?: AccessHistoryPage;
  fetchMore: () => void;
};

export const FimsHistoryNonEmptyContent = ({
  accesses,
  fetchMore
}: FimsHistoryNonEmptyContentProps) => {
  const isHistoryExporting = useIOSelector(isFimsHistoryExportingSelector);
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
        renderItem={item => <FimsHistoryListItemPicker item={item.item} />}
        onEndReached={fetchMore}
        ListFooterComponent={LoadingFooter}
      />

      {!shouldHideFooter && (
        <FooterActions
          onMeasure={handleFooterActionsMeasurements}
          testID="export-footer"
          actions={{
            type: "SingleButton",
            primary: {
              loading: isHistoryExporting,
              label: I18n.t("FIMS.history.exportData.CTA"),
              onPress: handleExportOnPress,
              testID: "export-button"
            }
          }}
        />
      )}
    </>
  );
};
