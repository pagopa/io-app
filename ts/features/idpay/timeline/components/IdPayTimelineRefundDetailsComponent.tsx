import { useBottomSheet } from "@gorhom/bottom-sheet";
import {
  Alert,
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import { CommonActions } from "@react-navigation/native";
import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { RefundDetailDTO } from "../../../../../definitions/idpay/RefundDetailDTO";
import { OperationTypeEnum } from "../../../../../definitions/idpay/RefundOperationDTO";
import NavigationService from "../../../../navigation/NavigationService";
import { useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";
import { idpayInitiativeIdSelector } from "../../details/store";
import { getRefundPeriodDateString } from "../utils/strings";

type Props = {
  refund: RefundDetailDTO;
};

const IdPayTimelineRefundDetailsComponent = (props: Props) => {
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
      <ListItemInfo
        label={I18n.t("idpay.initiative.operationDetails.refund.iban")}
        value={refund.iban}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.initiative.operationDetails.refund.amount")}
        value={formattedAmount}
      />
      <VSpacer size={8} />
      <ListItemHeader
        label={I18n.t("idpay.initiative.operationDetails.refund.resultLabel")}
        endElement={{
          type: "badge",
          componentProps: {
            variant:
              refund.operationType === OperationTypeEnum.REJECTED_REFUND
                ? "error"
                : "highlight",
            text: I18n.t(
              `idpay.initiative.operationDetails.refund.result.${refund.operationType}`
            )
          }
        }}
      />
      <ListItemInfo
        label={I18n.t("idpay.initiative.operationDetails.refund.period")}
        value={getRefundPeriodDateString(refund)}
      />
      <Divider />
      <ListItemInfo
        label={"Data rimborso"}
        value={format(refund.operationDate, "DD MMM YYYY, HH:mm")}
      />
      <Divider />
      <ListItemInfoCopy
        label={"CRO"}
        value={refund.cro}
        onPress={() => {
          clipboardSetStringWithFeedback(refund.cro || "");
        }}
      />
    </>
  );
};

export { IdPayTimelineRefundDetailsComponent };
