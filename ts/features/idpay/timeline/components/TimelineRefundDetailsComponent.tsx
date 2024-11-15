import { useBottomSheet } from "@gorhom/bottom-sheet";
import { Alert, Body, HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import { CommonActions } from "@react-navigation/native";
import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import { RefundDetailDTO } from "../../../../../definitions/idpay/RefundDetailDTO";
import { OperationTypeEnum } from "../../../../../definitions/idpay/RefundOperationDTO";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import { IOBadge } from "../../../../components/core/IOBadge";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import NavigationService from "../../../../navigation/NavigationService";
import { useIOSelector } from "../../../../store/hooks";
import themeVariables from "../../../../theme/variables";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { idpayInitiativeIdSelector } from "../../details/store";
import { getRefundPeriodDateString } from "../utils/strings";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";

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
        IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
        {
          screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
          params: {
            initiativeId
          }
        }
      )
    );
  };

  const rejectedAlertComponent = pipe(
    refund.operationType,
    O.of,
    O.filter(type => type === OperationTypeEnum.REJECTED_REFUND),
    O.map(() => (
      <>
        <Alert
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

  const formattedAmount = pipe(
    refund.amountCents,
    O.fromNullable,
    O.map(amount => formatNumberCentsToAmount(amount, true)),
    O.getOrElse(() => "-")
  );

  return (
    <>
      {rejectedAlertComponent}
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.refund.iban")}</Body>
        <Body weight="Semibold">{refund.iban}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.refund.amount")}</Body>
        <Body weight="Semibold">{formattedAmount}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.refund.resultLabel")}
        </Body>
        {refund.operationType === OperationTypeEnum.REJECTED_REFUND ? (
          <IOBadge
            small
            variant="outline"
            color="red"
            text={I18n.t(
              `idpay.initiative.operationDetails.refund.result.${refund.operationType}`
            )}
          />
        ) : (
          <IOBadge
            small
            variant="solid"
            color="aqua"
            text={I18n.t(
              `idpay.initiative.operationDetails.refund.result.${refund.operationType}`
            )}
          />
        )}
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.refund.period")}</Body>
        <Body weight="Semibold">{getRefundPeriodDateString(refund)}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>Data rimborso</Body>
        <Body weight="Semibold">
          {format(refund.operationDate, "DD MMM YYYY, HH:mm")}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>CRO</Body>
        <HSpacer size={16} />
        <View style={[IOStyles.flex, IOStyles.row]}>
          <Body
            weight="Semibold"
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
