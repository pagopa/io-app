import {
  Divider,
  FooterActions,
  IOVisualCostants,
  useFooterActionsMeasurements
} from "@io-app/design-system";
import { FlashList } from "@shopify/flash-list";
import I18n from "i18next";

import { AccessHistoryPage } from "../../../../../definitions/fims_history/AccessHistoryPage";
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
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
        data={accesses?.data}
        ItemSeparatorComponent={Divider}
        keyExtractor={item => item.id}
        ListFooterComponent={LoadingFooter}
        ListHeaderComponent={FimsHistoryHeaderComponent}
        onEndReached={fetchMore}
        renderItem={item => <FimsHistoryListItemPicker item={item.item} />}
      />

      {!shouldHideFooter && (
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              loading: isHistoryExporting,
              label: I18n.t("FIMS.history.exportData.CTA"),
              onPress: handleExportOnPress,
              testID: "export-button"
            }
          }}
          onMeasure={handleFooterActionsMeasurements}
          testID="export-footer"
        />
      )}
    </>
  );
};
