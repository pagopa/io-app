import {
  H6,
  IOSkeleton,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { enumType } from "@pagopa/ts-commons/lib/types";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { useState } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { OperationListDTO } from "../../../../../definitions/idpay/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../definitions/idpay/RefundOperationDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../definitions/idpay/TransactionDetailDTO";
import { ChannelEnum } from "../../../../../definitions/idpay/TransactionOperationDTO";
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
  TransactionOperationTypeEnum | RefundOperationTypeEnum
>(
  { ...TransactionOperationTypeEnum, ...RefundOperationTypeEnum },
  "OperationWithDetails"
);

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

  const titleComponent = pipe(
    title,
    O.fromNullable,
    O.filter(_ => !isError),
    O.fold(
      () => null,
      title => (isLoading ? <TitleSkeleton /> : <H6>{title}</H6>)
    )
  );

  const getModalContent = () => {
    if (isLoading) {
      return <ContentSkeleton />;
    }

    if (isError) {
      return <ErrorComponent />;
    }

    return pipe(
      detailsPot,
      pot.toOption,
      O.map(details => {
        switch (details.operationType) {
          case TransactionOperationTypeEnum.TRANSACTION:
            if (details.channel === ChannelEnum.RTD) {
              return (
                <IdPayTimelineTransactionDetailsComponent
                  transaction={details}
                />
              );
            }
            return (
              <IdPayTimelineDiscountTransactionDetailsComponent
                transaction={details}
              />
            );

          case TransactionOperationTypeEnum.REVERSAL:
            return (
              <IdPayTimelineTransactionDetailsComponent transaction={details} />
            );
          case RefundOperationTypeEnum.PAID_REFUND:
          case RefundOperationTypeEnum.REJECTED_REFUND:
            return <IdPayTimelineRefundDetailsComponent refund={details} />;
          default:
            // We don't show additional info for other operation types
            return <></>;
        }
      }),
      O.toUndefined
    );
  };
  const modal = useIOBottomSheetModal({
    component: getModalContent(),
    title: titleComponent
  });

  const present = (operation: OperationListDTO) =>
    pipe(
      OperationWithDetailsType.decode(operation.operationType),
      E.map(type => {
        setTitle(I18n.t(`idpay.initiative.operationDetails.title.${type}`));
        dispatch(
          idpayTimelineDetailsGet.request({
            initiativeId,
            operationId: operation.operationId
          })
        );
        modal.present();
      })
    );

  return { ...modal, present };
};

const TitleSkeleton = () => (
  <IOSkeleton shape="rectangle" width={100} height={20} radius={4} />
);

const ContentSkeleton = () => (
  <View style={{ paddingTop: 10, paddingBottom: 16 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={{ paddingVertical: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <IOSkeleton shape="rectangle" width={100} height={21} radius={4} />
          <IOSkeleton shape="rectangle" width={150} height={21} radius={4} />
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
