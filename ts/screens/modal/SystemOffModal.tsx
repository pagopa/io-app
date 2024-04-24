/**
 * this modal shows a warning to the user that some IO systems (backend side) could
 * not work properly. This is due to avoid user tries to access features or services potentially can't work
 * as expected
 */
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Modal } from "react-native";
import { useSelector } from "react-redux";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
import I18n from "../../i18n";
import { backendStatusSelector } from "../../store/reducers/backendStatus";
import { getFullLocale } from "../../utils/locale";

const SystemOffModal = () => {
  const backendStatus = useSelector(backendStatusSelector);
  const locale = getFullLocale();

  const subtitle = React.useMemo(() => {
    const message = pipe(
      backendStatus,
      O.fold(
        () => undefined,
        s => pipe(s, NonEmptyString.decode, () => s.message[locale])
      )
    );

    return `${message ? message + "\n" : ""}${I18n.t("systemsOff.closeApp")}`;
  }, [locale, backendStatus]);

  return (
    <Modal>
      <OperationResultScreenContent
        pictogram="umbrellaNew"
        title={I18n.t("systemsOff.title")}
        subtitle={subtitle}
      />
    </Modal>
  );
};

export default React.memo(SystemOffModal);
