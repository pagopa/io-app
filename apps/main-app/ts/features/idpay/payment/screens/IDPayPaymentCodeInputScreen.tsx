import { TextInput } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useState } from "react";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
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
  code: O.Option<E.Either<unknown, string>>;
  value?: string;
};

const IDPayPaymentCodeInputScreen = () => {
  const { useActorRef, useSelector } = IdPayPaymentMachineContext;
  const machine = useActorRef();

  const [inputState, setInputState] = useState<InputState>({
    value: undefined,
    code: O.none
  });

  const isInputValid = pipe(inputState.code, O.map(E.isRight), O.toUndefined);
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

  const navigateToPaymentAuthorization = () =>
    pipe(
      inputState.code,
      O.filter(E.isRight),
      O.map(trxCode => trxCode.right),
      O.map(trxCode => {
        trackIDPayDetailManualEntryConfirm({
          initiativeId,
          initiativeName
        });
        machine.send({
          type: "authorize-payment",
          trxCode,
          data_entry: "manual"
        });
      })
    );

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
      contextualHelp={emptyContextualHelp}
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
            code: pipe(
              value,
              O.fromNullable,
              O.filter(NonEmptyString.is),
              O.map(IDPayTransactionCode.decode)
            )
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
