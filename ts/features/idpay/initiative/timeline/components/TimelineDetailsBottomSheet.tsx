import * as pot from "@pagopa/ts-commons/lib/pot";
import { enumType } from "@pagopa/ts-commons/lib/types";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import React from "react";
import { LayoutChangeEvent, SafeAreaView, View } from "react-native";
import Placeholder from "rn-placeholder";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/RefundOperationDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../../definitions/idpay/TransactionDetailDTO";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { Pictogram } from "../../../../../components/core/pictograms";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ButtonOutline from "../../../../../components/ui/ButtonOutline";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  IOBottomSheetModal,
  useIOBottomSheetModal
} from "../../../../../utils/hooks/bottomSheet";
import { idpayTimelineDetailsSelector } from "../store";
import { idpayTimelineDetailsGet } from "../store/actions";
import { TimelineRefundDetailsComponent } from "./TimelineRefundDetailsComponent";
import { TimelineTransactionDetailsComponent } from "./TimelineTransactionDetailsComponent";

type OperationWithDetailsType = t.TypeOf<typeof OperationWithDetailsType>;

const OperationWithDetailsType = enumType<
  TransactionOperationTypeEnum | RefundOperationTypeEnum
>(
  { ...TransactionOperationTypeEnum, ...RefundOperationTypeEnum },
  "OperationWithDetails"
);

/**
 * Component displayed in the bottom sheet to show the details of a timeline operation.
 * The content of this component is retrieved from the store via selector.
 */
const TimelineDetailsBottomSheet = () => {
  const detailsPot = useIOSelector(idpayTimelineDetailsSelector);
  const isLoading = pot.isLoading(detailsPot);

  if (isLoading) {
    return <TimelineDetailsSkeleton />;
  }

  return pipe(
    detailsPot,
    pot.toOption,
    O.map(details => {
      switch (details.operationType) {
        case TransactionOperationTypeEnum.TRANSACTION:
        case TransactionOperationTypeEnum.REVERSAL:
          return <TimelineTransactionDetailsComponent transaction={details} />;
        case RefundOperationTypeEnum.PAID_REFUND:
        case RefundOperationTypeEnum.REJECTED_REFUND:
          return <TimelineRefundDetailsComponent refund={details} />;
        default:
          // We don't show additional info for other operation types
          return <></>;
      }
    }),
    O.getOrElse(() => (
      <View>
        <Pictogram name="error" />
      </View>
    ))
  );
};

type TimelineDetailsBottomSheetModal = Omit<IOBottomSheetModal, "present"> & {
  present: (operation: OperationListDTO) => void;
};

/**
 * This hook is used to show the bottom sheet with the details of a timeline operation
 * @param initiativeId ID of the initiative associated to the operation details
 */
const useTimelineDetailsBottomSheet = (
  initiativeId: InitiativeDTO["initiativeId"]
): TimelineDetailsBottomSheetModal => {
  const dispatch = useIODispatch();

  const handleContentOnLayout = (event: LayoutChangeEvent) => {
    const bottomPadding = 190;
    const { height } = event.nativeEvent.layout;
    setSnapPoint(bottomPadding + height);
  };

  const [title, setTitle] = React.useState<string>();
  const [snapPoint, setSnapPoint] = React.useState<number>(530);

  const modalContent = (
    <View onLayout={handleContentOnLayout}>
      <TimelineDetailsBottomSheet />
    </View>
  );

  const modoalFooter = (
    <SafeAreaView>
      <ContentWrapper>
        <VSpacer size={32} />
        <ButtonOutline
          label={I18n.t("global.buttons.close")}
          accessibilityLabel={I18n.t("global.buttons.close")}
          color="primary"
          onPress={() => modal.dismiss()}
          fullWidth={true}
        />
        <VSpacer size={32} />
      </ContentWrapper>
    </SafeAreaView>
  );

  const modal = useIOBottomSheetModal(
    modalContent,
    title,
    snapPoint,
    modoalFooter
  );

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

const TimelineDetailsSkeleton = () => (
  <View style={{ paddingTop: 8, paddingBottom: 10 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={{ paddingVertical: 8 }}>
        <View style={IOStyles.rowSpaceBetween}>
          <Placeholder.Box animate="fade" width={100} height={21} radius={4} />
          <Placeholder.Box animate="fade" width={150} height={21} radius={4} />
        </View>
      </View>
    ))}
  </View>
);

export type { TimelineDetailsBottomSheet };
export { useTimelineDetailsBottomSheet };
