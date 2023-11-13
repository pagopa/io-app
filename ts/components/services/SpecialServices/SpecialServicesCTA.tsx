import * as React from "react";
import { constNull, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { cdcEnabled } from "../../../config";
import CdcServiceCTA from "../../../features/bonus/cdc/components/CdcServiceCTA";
import CgnServiceCTA from "../../../features/bonus/cgn/components/CgnServiceCTA";
import PnServiceCTA from "../../../features/pn/components/ServiceCTA";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import {
  isCdcEnabledSelector,
  isCGNEnabledSelector,
  isPnEnabledSelector,
  isPnSupportedSelector
} from "../../../store/reducers/backendStatus";
import { openAppStoreUrl } from "../../../utils/url";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import { Label } from "../../core/typography/Label";

type SpecialServiceConfig = {
  isEnabled: boolean;
  isSupported: boolean;
};

type Props = {
  customSpecialFlowOpt?: string;
  serviceId: ServiceId;
  activate?: boolean;
};

const UpdateAppCTA = () => {
  // utility to open the app store on the OS
  const openAppStore = React.useCallback(() => openAppStoreUrl(), []);

  return (
    <ButtonDefaultOpacity block primary onPress={openAppStore}>
      <Label color={"white"}>{I18n.t("btnUpdateApp")}</Label>
    </ButtonDefaultOpacity>
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
          () => <UpdateAppCTA />,
          () => cta
        )
      )
    )
  );

const SpecialServicesCTA = (props: Props) => {
  const { customSpecialFlowOpt } = props;

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
          () => <UpdateAppCTA />,
          ({ isEnabled, isSupported }) => {
            switch (csf) {
              case "cgn":
                return renderCta(
                  isEnabled,
                  isSupported,
                  <CgnServiceCTA serviceId={props.serviceId} />
                );
              case "cdc":
                return renderCta(isEnabled, isSupported, <CdcServiceCTA />);
              case "pn":
                return renderCta(
                  isEnabled,
                  isSupported,
                  <PnServiceCTA
                    serviceId={props.serviceId}
                    activate={props.activate}
                  />
                );
              default:
                return <UpdateAppCTA />;
            }
          }
        )
      )
    )
  );
};

export default SpecialServicesCTA;
