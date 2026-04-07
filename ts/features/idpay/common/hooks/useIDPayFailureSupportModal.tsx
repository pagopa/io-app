import {
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  addTicketCustomField,
  appendLog,
  resetCustomFields
} from "@pagopa/io-react-native-zendesk";
import I18n from "i18next";
import { JSX, useState } from "react";

import { useIODispatch } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  defaultZendeskBonusesCategory,
  defaultZendeskIDPayCategory,
  zendeskBonusAndInitiativeCategoryId,
  zendeskCategoryId
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { OnboardingFailureEnum } from "../../onboarding/types/OnboardingFailure";
import { PaymentFailureEnum } from "../../payment/types/PaymentFailure";

type IDPayFailureSupportModal = {
  bottomSheet: JSX.Element;
  present: (failure: OnboardingFailureEnum | PaymentFailureEnum) => void;
};

const useIDPayFailureSupportModal = (
  serviceId: string,
  initiativeId?: string
): IDPayFailureSupportModal => {
  const dispatch = useIODispatch();
  const prefix = "IDPAY_";
  const [currentFaultCodeDetail, setCurrentFaultCodeDetail] =
    useState<string>("");

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    // attach the main zendesk category to the ticket
    addTicketCustomField(
      zendeskBonusAndInitiativeCategoryId,
      defaultZendeskIDPayCategory.value
    );

    addTicketCustomField(
      zendeskCategoryId,
      defaultZendeskBonusesCategory.value
    );

    appendLog(
      JSON.stringify({
        serviceId,
        initiativeId,
        faultCode: currentFaultCodeDetail
      })
    );

    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceType: {
          idPay: true
        }
      })
    );
    dispatch(zendeskSelectedCategory(defaultZendeskIDPayCategory));
  };

  const handleCopyAllToClipboard = () => {
    const data = initiativeId
      ? `${I18n.t("idpay.support.errorCode")}: ${currentFaultCodeDetail}
    ${I18n.t("idpay.support.serviceId")}: ${serviceId}
    ${I18n.t("idpay.support.initiativeId")}: ${initiativeId}`
      : `${I18n.t("idpay.support.errorCode")}: ${currentFaultCodeDetail}
    ${I18n.t("idpay.support.serviceId")}: ${serviceId}`;

    clipboardSetStringWithFeedback(data);
  };

  const {
    bottomSheet,
    present: presentModal,
    dismiss
  } = useIOBottomSheetModal({
    component: (
      <>
        <ListItemHeader label={I18n.t("idpay.support.supportTitle")} />
        <ListItemAction
          accessibilityLabel={I18n.t("idpay.support.chat")}
          icon="chat"
          label={I18n.t("idpay.support.chat")}
          onPress={() => {
            dismiss();
            zendeskAssistanceLogAndStart();
          }}
          variant="primary"
        />
        <VSpacer size={24} />
        <ListItemHeader
          endElement={{
            type: "buttonLink",
            componentProps: {
              label: I18n.t("idpay.support.copyAll"),
              onPress: handleCopyAllToClipboard
            }
          }}
          label={I18n.t("idpay.support.additionalDataTitle")}
        />
        <ListItemInfoCopy
          accessibilityLabel={I18n.t("idpay.support.errorCode")}
          icon="ladybug"
          label={I18n.t("idpay.support.errorCode")}
          onPress={() => clipboardSetStringWithFeedback(currentFaultCodeDetail)}
          value={currentFaultCodeDetail}
        />
        <ListItemInfoCopy
          icon="pinOff"
          label={I18n.t("idpay.support.serviceId")}
          onPress={() => clipboardSetStringWithFeedback(serviceId)}
          value={serviceId}
        />
        {initiativeId && (
          <ListItemInfoCopy
            icon="bonus"
            label={I18n.t("idpay.support.initiativeId")}
            onPress={() =>
              initiativeId && clipboardSetStringWithFeedback(initiativeId)
            }
            value={initiativeId}
          />
        )}
        <VSpacer size={24} />
      </>
    ),
    title: ""
  });

  const formatFaultCode = (
    failure: OnboardingFailureEnum | PaymentFailureEnum
  ) => {
    const code = failure ?? OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR;
    return `${prefix}${code}`;
  };

  const present = (failure: OnboardingFailureEnum | PaymentFailureEnum) => {
    setCurrentFaultCodeDetail(formatFaultCode(failure));
    presentModal();
  };

  return {
    bottomSheet,
    present
  };
};

export default useIDPayFailureSupportModal;
