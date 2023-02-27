import { useBottomSheet } from "@gorhom/bottom-sheet";
import { CommonActions } from "@react-navigation/native";
import { format } from "date-fns";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import {
  OperationTypeEnum,
  RefundOperationDTO
} from "../../../../../../definitions/idpay/timeline/RefundOperationDTO";
import { Alert } from "../../../../../components/Alert";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import NavigationService from "../../../../../navigation/NavigationService";
import { useIOSelector } from "../../../../../store/hooks";
import themeVariables from "../../../../../theme/variables";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";
import { idpayInitiativeIdSelector } from "../store";

type ResultLabelProps = {
  type: OperationTypeEnum;
};

const ResultLabel = (props: ResultLabelProps) => {
  const { type } = props;

  const styleMap: Record<OperationTypeEnum, StyleProp<ViewStyle>> = {
    [OperationTypeEnum.PAID_REFUND]: {
      backgroundColor: IOColors.aqua
    },
    [OperationTypeEnum.REJECTED_REFUND]: {
      borderColor: IOColors.red,
      borderWidth: 1
    }
  };

  const textColor =
    type === OperationTypeEnum.REJECTED_REFUND ? "red" : "bluegreyDark";

  return (
    <View
      style={[
        {
          justifyContent: "center",
          paddingVertical: 3,
          paddingHorizontal: 8,
          borderRadius: 56
        },
        styleMap[type]
      ]}
    >
      <LabelSmall weight="SemiBold" fontSize="small" color={textColor}>
        {I18n.t(`idpay.initiative.operationDetails.result.${type}`)}
      </LabelSmall>
    </View>
  );
};

type RefundDetailsProps = {
  refund: RefundOperationDTO;
};

const RefundDetailsComponent = (props: RefundDetailsProps) => {
  const { refund } = props;

  const alertViewRef = React.createRef<View>();

  const { close: closeBottomSheet } = useBottomSheet();
  const initiativeId = useIOSelector(idpayInitiativeIdSelector);

  const isRejected = refund.operationType === OperationTypeEnum.REJECTED_REFUND;

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

  return (
    <>
      {isRejected && (
        <>
          <VSpacer size={16} />
          <Alert
            viewRef={alertViewRef}
            content={I18n.t(
              "idpay.initiative.operationDetails.rejectedAdvice.text"
            )}
            action={I18n.t(
              "idpay.initiative.operationDetails.rejectedAdvice.editIban"
            )}
            onPress={handleEditIbanPress}
            variant="error"
          />
          <VSpacer size={16} />
        </>
      )}
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.iban")}</Body>
        <Body weight="SemiBold">{/* TODO add iban */}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.refundAmount")}</Body>
        <Body weight="SemiBold">
          {formatNumberAmount(refund.amount || 0, true)}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.resultLabel")}</Body>
        <ResultLabel type={refund.operationType} />
      </View>
      <View style={styles.detailRow}>
        <Body>Periodo di riferimento</Body>
        <Body weight="SemiBold">
          {`${format(refund.operationDate, "DD/MM/YY")} - ${format(
            refund.operationDate,
            "DD/MM/YY"
          )}`}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>Data rimborso</Body>
        <Body weight="SemiBold">
          {format(refund.operationDate, "DD MMM YYYY, HH:mm")}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>TRN</Body>
        <HSpacer size={16} />
        <View style={[IOStyles.flex, IOStyles.row]}>
          <Body
            weight="SemiBold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={IOStyles.flex}
          >
            {/* TODO add TRN */}
          </Body>
          <HSpacer size={8} />
          <CopyButtonComponent textToCopy={/* TODO add TRN */ ""} />
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

export { RefundDetailsComponent };
