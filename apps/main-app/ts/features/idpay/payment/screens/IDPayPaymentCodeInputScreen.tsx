import { TextInput } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import I18n from "i18next";
import { useState } from "react";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { isLoadingSelector } from "../../common/machine/selectors";
import {
  trackIDPayDetailManualEntryConfirm,
  trackIDPayDetailManualEntryLanding
} from "../../details/analytics";
import { idpayInitiativeDetailsSelector } from "../../details/store";
import { IDPayTransactionCode } from "../common/types";
import { IdPayPaymentMachineContext } from "../machine/provider";

type InputState = {
  code: ReturnType<typeof IDPayTransactionCode.decode> | undefined;
  value?: string;
};

const IDPayPaymentCodeInputScreen = () => {
  const { useActorRef, useSelector } = IdPayPaymentMachineContext;
  const machine = useActorRef();

  const [inputState, setInputState] = useState<InputState>({
    value: undefined,
    code: undefined
  });

  const isInputValid =
    inputState.code !== undefined && "right" in inputState.code;
  const isLoading = useSelector(isLoadingSelector);

  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);

  const initiativeId = pot.getOrElse(
    pot.map(initiativeDataPot, initiative => initiative.initiativeId),
    undefined
  );

  const initiativeName = pot.getOrElse(
    pot.map(initiativeDataPot, initiative => initiative.initiativeName),
    undefined
  );

  useOnFirstRender(() => {
    trackIDPayDetailManualEntryLanding({
      initiativeId,
      initiativeName
    });
  });

  const navigateToPaymentAuthorization = () => {
    if (inputState.code !== undefined && "right" in inputState.code) {
      const trxCode = inputState.code.right;
      trackIDPayDetailManualEntryConfirm({
        initiativeId,
        initiativeName
      });
      machine.send({
        type: "authorize-payment",
        trxCode,
        data_entry: "manual"
      });
    }
  };

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("idpay.payment.manualInput.button"),
          disabled: !isInputValid || isLoading,
          onPress: navigateToPaymentAuthorization,
          loading: isLoading
        }
      }}
      description={I18n.t("idpay.payment.manualInput.subtitle")}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins
      title={{
        label: I18n.t("idpay.payment.manualInput.title")
      }}
    >
      <TextInput
        accessibilityLabel={I18n.t("idpay.payment.manualInput.input")}
        counterLimit={8}
        icon="barcode"
        onChangeText={value => {
          setInputState({
            value,
            code: NonEmptyString.is(value)
              ? IDPayTransactionCode.decode(value)
              : undefined
          });
        }}
        placeholder={I18n.t("idpay.payment.manualInput.input")}
        textInputProps={{
          inputMode: "text",
          autoCapitalize: "characters",
          autoCorrect: false
        }}
        value={inputState.value ?? ""}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export { IDPayPaymentCodeInputScreen };
