import React, { useCallback } from "react";
import { ButtonSolid } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import * as B from "fp-ts/lib/boolean";
import { constNull, pipe } from "fp-ts/lib/function";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { cdcEnabled } from "../../../config";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import {
  isCGNEnabledSelector,
  isCdcEnabledSelector,
  isPnEnabledSelector,
  isPnSupportedSelector
} from "../../../store/reducers/backendStatus";
import { openAppStoreUrl } from "../../../utils/url";
import { CgnServiceCta } from "../../bonus/cgn/components/CgnServiceCTA";
import { PnServiceCta } from "../../pn/components/ServiceCTA";

type SpecialServiceConfig = {
  isEnabled: boolean;
  isSupported: boolean;
};

type ServiceSpecialActionProps = {
  customSpecialFlowOpt?: string;
  serviceId: ServiceId;
  activate?: boolean;
};

const UpdateAppCta = () => {
  const handleOnPress = useCallback(() => openAppStoreUrl(), []);

  return (
    <ButtonSolid
      fullWidth
      accessibilityLabel={I18n.t("btnUpdateApp")}
      label={I18n.t("btnUpdateApp")}
      onPress={handleOnPress}
    />
  );
};

const renderCta = (
  isEnabled: boolean,
  isSupported: boolean,
  cta: JSX.Element
) =>
  pipe(
    isEnabled,
    B.fold(constNull, () =>
      pipe(
        isSupported,
        B.fold(
          () => <UpdateAppCta />,
          () => cta
        )
      )
    )
  );

export const ServiceSpecialAction = ({
  serviceId,
  activate,
  customSpecialFlowOpt
}: ServiceSpecialActionProps) => {
  const isCGNEnabled = useIOSelector(isCGNEnabledSelector);
  const cdcEnabledSelector = useIOSelector(isCdcEnabledSelector);

  const isCdcEnabled = cdcEnabledSelector && cdcEnabled;

  const isPnEnabled = useIOSelector(isPnEnabledSelector);
  const isPnSupported = useIOSelector(isPnSupportedSelector);

  const mapSpecialServiceConfig = new Map<string, SpecialServiceConfig>([
    ["cgn", { isEnabled: isCGNEnabled, isSupported: true }],
    ["cdc", { isEnabled: isCdcEnabled, isSupported: true }],
    ["pn", { isEnabled: isPnEnabled, isSupported: isPnSupported }]
  ]);

  return pipe(
    customSpecialFlowOpt,
    O.fromNullable,
    O.fold(constNull, csf =>
      pipe(
        mapSpecialServiceConfig.get(csf),
        O.fromNullable,
        O.fold(
          () => <UpdateAppCta />,
          ({ isEnabled, isSupported }) => {
            switch (csf) {
              case "cgn":
                return renderCta(
                  isEnabled,
                  isSupported,
                  <CgnServiceCta serviceId={serviceId} />
                );
              case "cdc":
                // CdC is disabled: the flow needs to be reviewed
                return null;
              case "pn":
                return renderCta(
                  isEnabled,
                  isSupported,
                  <PnServiceCta serviceId={serviceId} activate={activate} />
                );
              default:
                return <UpdateAppCta />;
            }
          }
        )
      )
    )
  );
};
