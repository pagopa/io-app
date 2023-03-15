import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { View } from "react-native";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/RefundOperationDTO";
import { OperationTypeEnum as TransactionDetailOperationTypeEnum } from "../../../../../../definitions/idpay/TransactionDetailDTO";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { Pictogram } from "../../../../../components/core/pictograms";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import ButtonOutline from "../../../../../components/ui/ButtonOutline";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
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

  const contentComponent = pot.getOrElse(
    pot.map(detailsPot, details => {
      switch (details.operationType) {
        case TransactionDetailOperationTypeEnum.TRANSACTION:
        case TransactionDetailOperationTypeEnum.REVERSAL:
          return <TransactionDetailsComponent transaction={details} />;
        case RefundOperationTypeEnum.PAID_REFUND:
        case RefundOperationTypeEnum.REJECTED_REFUND:
          return <RefundDetailsComponent refund={details} />;
        default:
          // We don't show additional info for other operation types
          return null;
      }
    }),
    <TimelineDetailsErrorComponent />
  );

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
      {contentComponent}
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
    <ContentWrapper>
      <ButtonOutline
        label={I18n.t("global.buttons.close")}
        accessibilityLabel={I18n.t("global.buttons.close")}
        color="primary"
        onPress={() => modal.dismiss()}
        fullWidth={true}
      />
      <VSpacer size={24} />
    </ContentWrapper>
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
