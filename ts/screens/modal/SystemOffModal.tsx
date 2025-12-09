/**
 * this modal shows a warning to the user that some IO systems (backend side) could
 * not work properly. This is due to avoid user tries to access features or services potentially can't work
 * as expected
 */
import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import _ from "lodash";
import { memo, useMemo } from "react";
import { Modal } from "react-native";
import { useSelector } from "react-redux";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
import { backendInfoMessageSelector } from "../../store/reducers/backendStatus/backendInfo";
import { getFullLocale } from "../../utils/locale";

const SystemOffModal = () => {
  const backendInfoMessage = useSelector(backendInfoMessageSelector, _.isEqual);
  const locale = getFullLocale();

  const subtitle = useMemo(() => {
    const message = backendInfoMessage && backendInfoMessage[locale];

    return `${message ? message + "\n" : ""}${I18n.t("systemsOff.closeApp")}`;
  }, [locale, backendInfoMessage]);

  const theme = useIOTheme();

  return (
    <Modal backdropColor={IOColors[theme["appBackground-primary"]]}>
      <OperationResultScreenContent
        enableAnimatedPictogram
        pictogram="umbrella"
        title={I18n.t("systemsOff.title")}
        subtitle={subtitle}
      />
    </Modal>
  );
};

export default memo(SystemOffModal);
