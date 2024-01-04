import { useNavigation } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { FaultCategoryEnum } from "../../../../../definitions/pagopa/ecommerce/FaultCategory";
import { ValidationFaultEnum } from "../../../../../definitions/pagopa/ecommerce/ValidationFault";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { NetworkError } from "../../../../utils/errors";
import { WalletPaymentFailure } from "../types/failure";

type Props = {
  failure: NetworkError | WalletPaymentFailure;
};

const WalletPaymentFailureDetail = ({ failure }: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const handleClose = () => {
    navigation.pop();
  };

  const handleContactSupport = () => {
    navigation.pop();
  };

  const closeAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close"),
    onPress: handleClose
  };

  const contactSupportAction: OperationResultScreenContentProps["action"] = {
    label: "Contatta l’assistenza",
    accessibilityLabel: "Contatta l’assistenza",
    onPress: handleContactSupport
  };

  const genericErrorProps: OperationResultScreenContentProps = {
    pictogram: "umbrellaNew",
    title: "Si è verificato un errore imprevisto",
    subtitle: "Riprova, oppure contatta l’assistenza.",
    action: closeAction
  };

  const getPropsFromFailure = ({
    faultCodeCategory,
    faultCodeDetail
  }: WalletPaymentFailure): OperationResultScreenContentProps => {
    switch (faultCodeCategory) {
      case FaultCategoryEnum.PAYMENT_UNAVAILABLE:
        return {
          pictogram: "fatalError",
          title: "C’è un problema tecnico con questo avviso",
          action: contactSupportAction,
          secondaryAction: closeAction
        };
      case FaultCategoryEnum.PAYMENT_UNKNOWN:
        return {
          pictogram: "attention",
          title: "I dati dell’avviso non sono corretti",
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case FaultCategoryEnum.DOMAIN_UNKNOWN:
        return {
          pictogram: "comunicationProblem",
          title: "L’Ente Creditore sta avendo problemi nella risposta",
          action: contactSupportAction,
          secondaryAction: closeAction
        };
      case FaultCategoryEnum.PAYMENT_ONGOING:
        return {
          pictogram: "timing",
          title: "C’è già un pagamento in corso, riprova più tardi",
          subtitle: "Se il problema persiste, puoi aprire una segnalazione.",
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case FaultCategoryEnum.PAYMENT_EXPIRED:
        return {
          pictogram: "time",
          title: "L’avviso è scaduto e non è più possibile pagarlo",
          subtitle: "Contatta l’Ente per maggiori informazioni.",
          action: closeAction
        };
      case FaultCategoryEnum.PAYMENT_CANCELED:
        return {
          pictogram: "stopSecurity",
          title: "L’Ente Creditore ha revocato questo avviso",
          subtitle: "Contatta l’Ente per maggiori informazioni.",
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case FaultCategoryEnum.GENERIC_ERROR:
        if (faultCodeDetail === ValidationFaultEnum.PAA_PAGAMENTO_SCONOSCIUTO) {
          return {
            pictogram: "searchLens",
            title: "Non riusciamo a trovare l’avviso",
            subtitle:
              "L’avviso potrebbe essere stato già pagato. Per ricevere assistenza, contatta l’Ente Creditore che lo ha emesso.",
            action: closeAction
          };
        }
        return genericErrorProps;
      case FaultCategoryEnum.PAYMENT_DUPLICATED:
        return {
          pictogram: "moneyCheck",
          title: "Questo avviso è stato già pagato!",
          action: closeAction
        };
      default:
        return genericErrorProps;
    }
  };

  const contentProps: OperationResultScreenContentProps = pipe(
    failure,
    WalletPaymentFailure.decode,
    E.map(getPropsFromFailure),
    E.getOrElse(() => genericErrorProps)
  );

  return <OperationResultScreenContent {...contentProps} />;
};

export { WalletPaymentFailureDetail };
