import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { StyleSheet, View } from "react-native";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/RefundOperationDTO";
import { OperationTypeEnum as TransactionDetailOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/TransactionDetailDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { Pictogram } from "../../../../../components/core/pictograms";
import { H4 } from "../../../../../components/core/typography/H4";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import themeVariables from "../../../../../theme/variables";
import {
  IOBottomSheetModal,
  useIOBottomSheetModal
} from "../../../../../utils/hooks/bottomSheet";
import { idpayTimelineDetailsSelector } from "../store";
import { idpayTimelineDetailsGet } from "../store/actions";
import { RefundDetailsComponent } from "./RefundDetailsComponent";
import { TransactionDetailsComponent } from "./TransactionDetailsComponent";

/**
 * Displays a generic error message
 * @returns {React.ReactElement}
 */
const TimelineDetailsErrorComponent = () => (
  <View>
    <Pictogram name="error" />
  </View>
);

/**
 * Component displayed in the bottom sheet to show the details of a timeline operation.
 * The content of this component is retrieved from the store via selector.
 * @returns {React.ReactElement}
 */
const TimelineDetailsBottomSheet = () => {
  const detailsPot = useIOSelector(idpayTimelineDetailsSelector);
  const isLoading = pot.isLoading(detailsPot);

  const renderContent = () => {
    if (pot.isError(detailsPot)) {
      return <TimelineDetailsErrorComponent />;
    } else if (pot.isSome(detailsPot)) {
      const operation = detailsPot.value;

      switch (operation.operationType) {
        case TransactionDetailOperationTypeEnum.TRANSACTION:
        case TransactionDetailOperationTypeEnum.REVERSAL:
          return <TransactionDetailsComponent transaction={operation} />;
        case RefundOperationTypeEnum.PAID_REFUND:
        case RefundOperationTypeEnum.REJECTED_REFUND:
          return <RefundDetailsComponent refund={operation} />;
        default:
          // We don't show additional info for other operation types
          return null;
      }
    }
    return null;
  };

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
      {renderContent()}
    </LoadingSpinnerOverlay>
  );
};

type TimelineDetailsBottomSheetConfiguration = {
  snapPoint: number;
  title: string;
};

type OperationWithDetailsTypeEnum =
  | TransactionDetailOperationTypeEnum
  | RefundOperationTypeEnum;

const bottomSheetConfigurations: Record<
  OperationWithDetailsTypeEnum,
  TimelineDetailsBottomSheetConfiguration
> = {
  PAID_REFUND: {
    snapPoint: 420,
    title: I18n.t("idpay.initiative.operationDetails.title.refund")
  },
  REJECTED_REFUND: {
    snapPoint: 540,
    title: I18n.t("idpay.initiative.operationDetails.title.refund")
  },
  TRANSACTION: {
    snapPoint: 530,
    title: I18n.t("idpay.initiative.operationDetails.title.transaction")
  },
  REVERSAL: {
    snapPoint: 650,
    title: I18n.t("idpay.initiative.operationDetails.title.transaction")
  }
};

export type TimelineDetailsBottomSheetModal = Omit<
  IOBottomSheetModal,
  "present"
> & {
  present: (operation: OperationListDTO) => void;
};

/**
 * This hook is used to show the bottom sheet with the details of a timeline operation
 * @param {InitiativeDTO["initiativeId"]} initiativeId
 * @returns {TimelineDetailsBottomSheetModal}
 */
export const useTimelineDetailsBottomSheet = (
  initiativeId: InitiativeDTO["initiativeId"]
): TimelineDetailsBottomSheetModal => {
  const dispatch = useIODispatch();

  const [modalConfig, setModalConfig] =
    React.useState<TimelineDetailsBottomSheetConfiguration>({
      snapPoint: 530,
      title: ""
    });

  const bottomSheetFooter = (
    <View style={styles.footer}>
      <ButtonDefaultOpacity
        block={true}
        bordered={true}
        onPress={() => modal.dismiss()}
      >
        <H4 color="blue">{I18n.t("global.buttons.close")}</H4>
      </ButtonDefaultOpacity>
    </View>
  );

  const modal = useIOBottomSheetModal(
    <TimelineDetailsBottomSheet />,
    modalConfig.title,
    modalConfig.snapPoint,
    bottomSheetFooter
  );

  const present = (operation: OperationListDTO) => {
    const config =
      bottomSheetConfigurations[
        operation.operationType as OperationWithDetailsTypeEnum
      ];

    if (config === undefined) {
      return;
    }

    setModalConfig(config);

    dispatch(
      idpayTimelineDetailsGet.request({
        initiativeId,
        operationId: operation.operationId
      })
    );
    modal.present();
  };

  return { ...modal, present };
};

const styles = StyleSheet.create({
  footer: {
    padding: themeVariables.contentPadding
  }
});
