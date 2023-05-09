import { useBottomSheet } from "@gorhom/bottom-sheet";
import { CommonActions } from "@react-navigation/native";
import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import { RefundDetailDTO } from "../../../../../../definitions/idpay/RefundDetailDTO";
import { OperationTypeEnum } from "../../../../../../definitions/idpay/RefundOperationDTO";
import { Alert } from "../../../../../components/Alert";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { IOBadge } from "../../../../../components/core/IOBadge";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import NavigationService from "../../../../../navigation/NavigationService";
import { useIOSelector } from "../../../../../store/hooks";
import themeVariables from "../../../../../theme/variables";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";
import { idpayInitiativeIdSelector } from "../../details/store";
import { getRefundPeriodDateString } from "../utils/strings";

type Props = {
  refund: RefundDetailDTO;
};

const TimelineRefundDetailsComponent = (props: Props) => {
  const { refund } = props;

  const { close: closeBottomSheet } = useBottomSheet();
  const initiativeId = useIOSelector(idpayInitiativeIdSelector);

  const handleEditIbanPress = () => {
    closeBottomSheet();

    // The utilization of the NavigationService is imperative, as the library employed for presenting bottom sheets
    // utilizes its own NavigationContainer. Consequently, utilizing the "useNavigation" hook in this scenario
    // would result in an error.
    NavigationService.dispatchNavigationAction(
      CommonActions.navigate(
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN,
        {
          screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
          params: {
            initiativeId
          }
        }
      )
    );
  };

  const alertViewRef = React.createRef<View>();

  const rejectedAlertComponent = pipe(
    refund.operationType,
    O.of,
    O.filter(type => type === OperationTypeEnum.REJECTED_REFUND),
    O.map(() => (
      <>
        <Alert
          viewRef={alertViewRef}
          content={I18n.t(
            "idpay.initiative.operationDetails.refund.rejectedAdvice.text"
          )}
          action={I18n.t(
            "idpay.initiative.operationDetails.refund.rejectedAdvice.editIban"
          )}
          onPress={handleEditIbanPress}
          variant="error"
        />
        <VSpacer size={16} />
      </>
    )),
    O.toNullable
  );

  return (
    <>
      <VSpacer size={8} />
      {rejectedAlertComponent}
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.refund.iban")}</Body>
        <Body weight="SemiBold">{refund.iban}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.refund.amount")}</Body>
        <Body weight="SemiBold">{formatNumberAmount(refund.amount, true)}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.refund.resultLabel")}
        </Body>
        <IOBadge
          small
          variant={
            refund.operationType === OperationTypeEnum.REJECTED_REFUND
              ? "outline"
              : "solid"
          }
          color={
            refund.operationType === OperationTypeEnum.REJECTED_REFUND
              ? "red"
              : "aqua"
          }
          text={I18n.t(
            `idpay.initiative.operationDetails.refund.result.${refund.operationType}`
          )}
        />
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.refund.period")}</Body>
        <Body weight="SemiBold">{getRefundPeriodDateString(refund)}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>Data rimborso</Body>
        <Body weight="SemiBold">
          {format(refund.operationDate, "DD MMM YYYY, HH:mm")}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>CRO</Body>
        <HSpacer size={16} />
        <View style={[IOStyles.flex, IOStyles.row]}>
          <Body
            weight="SemiBold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={IOStyles.flex}
          >
            {refund.cro}
          </Body>
          <HSpacer size={8} />
          <CopyButtonComponent textToCopy={refund.cro || ""} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: themeVariables.spacerSmallHeight,
    paddingBottom: themeVariables.spacerSmallHeight
  }
});

export { TimelineRefundDetailsComponent };
