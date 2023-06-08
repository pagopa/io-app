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
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ButtonOutline from "../../../../../components/ui/ButtonOutline";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  IOBottomSheetModal,
  useLegacyIOBottomSheetModal
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

  const detailsPot = useIOSelector(idpayTimelineDetailsSelector);
  const isLoading = pot.isLoading(detailsPot);
  const isError = pot.isError(detailsPot);

  const handleContentOnLayout = (event: LayoutChangeEvent) => {
    const bottomPadding = 200;
    const { height } = event.nativeEvent.layout;
    setSnapPoint(bottomPadding + height);
  };

  const [title, setTitle] = React.useState<string>();
  const [snapPoint, setSnapPoint] = React.useState<number>(530);

  const titleComponent = pipe(
    title,
    O.fromNullable,
    O.filter(_ => !isError),
    O.fold(
      () => null,
      title => (isLoading ? <TitleSkeleton /> : <H3>{title}</H3>)
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
          case TransactionOperationTypeEnum.REVERSAL:
            return (
              <TimelineTransactionDetailsComponent transaction={details} />
            );
          case RefundOperationTypeEnum.PAID_REFUND:
          case RefundOperationTypeEnum.REJECTED_REFUND:
            return <TimelineRefundDetailsComponent refund={details} />;
          default:
            // We don't show additional info for other operation types
            return <></>;
        }
      }),
      O.toUndefined
    );
  };

  const modalFooter = (
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

  const modal = useLegacyIOBottomSheetModal(
    <View onLayout={handleContentOnLayout}>{getModalContent()}</View>,
    titleComponent,
    snapPoint,
    modalFooter
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

const TitleSkeleton = () => (
  <Placeholder.Box animate="fade" width={100} height={21} radius={4} />
);

const ContentSkeleton = () => (
  <View style={{ paddingTop: 10, paddingBottom: 16 }}>
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

const ErrorComponent = () => (
  <View
    style={{ paddingTop: 16, justifyContent: "center", alignItems: "center" }}
  >
    <Pictogram name="attention" size={72} />
    <VSpacer size={16} />
    <H3>{I18n.t("idpay.initiative.operationDetails.errorBody")}</H3>
  </View>
);

export type { TimelineDetailsBottomSheetModal };
export { useTimelineDetailsBottomSheet };
