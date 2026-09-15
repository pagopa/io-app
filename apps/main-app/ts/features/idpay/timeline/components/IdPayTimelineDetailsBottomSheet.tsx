import { InitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import { OperationListDTO } from "@io-app/api-types/generated/definitions/idpay/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "@io-app/api-types/generated/definitions/idpay/RefundOperationDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "@io-app/api-types/generated/definitions/idpay/TransactionDetailDTO";
import { ChannelEnum } from "@io-app/api-types/generated/definitions/idpay/TransactionOperationDTO";
import { H6, IOSkeleton, Pictogram, VSpacer } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { enumType } from "@pagopa/ts-commons/lib/types";
import I18n from "i18next";
import * as t from "io-ts";
import { useState } from "react";
import { View } from "react-native";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  IOBottomSheetModal,
  useIOBottomSheetModal
} from "../../../../utils/hooks/bottomSheet";
import { idpayTimelineDetailsSelector } from "../store";
import { idpayTimelineDetailsGet } from "../store/actions";
import { IdPayTimelineDiscountTransactionDetailsComponent } from "./IdPayTimelineDiscountTransactionDetailsComponent";
import { IdPayTimelineRefundDetailsComponent } from "./IdPayTimelineRefundDetailsComponent";
import { IdPayTimelineTransactionDetailsComponent } from "./IdPayTimelineTransactionDetailsComponent";

type OperationWithDetailsType = t.TypeOf<typeof OperationWithDetailsType>;

const OperationWithDetailsType = enumType<
  RefundOperationTypeEnum | TransactionOperationTypeEnum
>(
  { ...TransactionOperationTypeEnum, ...RefundOperationTypeEnum },
  "OperationWithDetails"
);

const getOperationDetailsTitle = (type: OperationWithDetailsType): string => {
  switch (type) {
    case RefundOperationTypeEnum.PAID_REFUND:
      return I18n.t("idpay.initiative.operationDetails.title.PAID_REFUND");
    case RefundOperationTypeEnum.REJECTED_REFUND:
      return I18n.t("idpay.initiative.operationDetails.title.REJECTED_REFUND");
    case TransactionOperationTypeEnum.REVERSAL:
      return I18n.t("idpay.initiative.operationDetails.title.REVERSAL");
    case TransactionOperationTypeEnum.TRANSACTION:
      return I18n.t("idpay.initiative.operationDetails.title.TRANSACTION");
  }
};

type IdPayTimelineDetailsBottomSheetModal = Omit<
  IOBottomSheetModal,
  "present"
> & {
  present: (operation: OperationListDTO) => void;
};

/**
 * This hook is used to show the bottom sheet with the details of a timeline operation
 * @param initiativeId ID of the initiative associated to the operation details
 */
const useIdPayTimelineDetailsBottomSheet = (
  initiativeId: InitiativeDTO["initiativeId"]
): IdPayTimelineDetailsBottomSheetModal => {
  const dispatch = useIODispatch();

  const detailsPot = useIOSelector(idpayTimelineDetailsSelector);
  const isLoading = pot.isLoading(detailsPot);
  const isError = pot.isError(detailsPot);

  const [title, setTitle] = useState<string>();

  const titleComponent =
    title && !isError ? isLoading ? <TitleSkeleton /> : <H6>{title}</H6> : null;

  const getModalContent = () => {
    if (isLoading) {
      return <ContentSkeleton />;
    }

    if (isError) {
      return <ErrorComponent />;
    }

    const details = pot.toUndefined(detailsPot);
    if (details === undefined) {
      return null;
    }

    return (() => {
      switch (details.operationType) {
        case RefundOperationTypeEnum.PAID_REFUND:

        case RefundOperationTypeEnum.REJECTED_REFUND:
          return <IdPayTimelineRefundDetailsComponent refund={details} />;
        case TransactionOperationTypeEnum.REVERSAL:
          return (
            <IdPayTimelineTransactionDetailsComponent transaction={details} />
          );
        case TransactionOperationTypeEnum.TRANSACTION:
          if (details.channel === ChannelEnum.RTD) {
            return (
              <IdPayTimelineTransactionDetailsComponent transaction={details} />
            );
          }
          return (
            <IdPayTimelineDiscountTransactionDetailsComponent
              transaction={details}
            />
          );
        default:
          // We don't show additional info for other operation types
          return <></>;
      }
    })();
  };
  const modal = useIOBottomSheetModal({
    component: getModalContent(),
    title: titleComponent
  });

  const present = (operation: OperationListDTO) => {
    const decodedOperation = OperationWithDetailsType.decode(
      operation.operationType
    );
    if ("right" in decodedOperation) {
      const type = decodedOperation.right;
      setTitle(getOperationDetailsTitle(type));
      dispatch(
        idpayTimelineDetailsGet.request({
          initiativeId,
          operationId: operation.operationId
        })
      );
      modal.present();
    }
  };

  return { ...modal, present };
};

const TitleSkeleton = () => (
  <IOSkeleton height={20} radius={4} shape="rectangle" width={100} />
);

const ContentSkeleton = () => (
  <View style={{ paddingTop: 10, paddingBottom: 16 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={{ paddingVertical: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <IOSkeleton height={21} radius={4} shape="rectangle" width={100} />
          <IOSkeleton height={21} radius={4} shape="rectangle" width={150} />
        </View>
      </View>
    ))}
  </View>
);

const ErrorComponent = () => (
  <View
    style={{ paddingTop: 16, justifyContent: "center", alignItems: "center" }}
  >
    <Pictogram name="attention" size={72} />
    <VSpacer size={16} />
    <H6>{I18n.t("idpay.initiative.operationDetails.errorBody")}</H6>
  </View>
);

export { useIdPayTimelineDetailsBottomSheet };
