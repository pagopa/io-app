import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useCallback } from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { cdcEnabled } from "../../../config";
import CdcServiceCTA from "../../../features/bonus/cdc/components/CdcServiceCTA";
import CgnServiceCTA from "../../../features/bonus/cgn/components/CgnServiceCTA";
import PnServiceCTA from "../../../features/pn/components/PnServiceCTA";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import {
  isCdcEnabledSelector,
  isCGNEnabledSelector,
  isPnEnabledSelector
} from "../../../store/reducers/backendStatus";
import { openAppStoreUrl } from "../../../utils/url";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import { Label } from "../../core/typography/Label";

type Props = {
  customSpecialFlowOpt?: string;
  serviceId: ServiceId;
  activate?: boolean;
};

const UpdateAppCTA = () => {
  // utility to open the app store on the OS
  const openAppStore = useCallback(() => openAppStoreUrl(), []);

  return (
    <ButtonDefaultOpacity block primary onPress={openAppStore}>
      <Label color={"white"}>{I18n.t("btnUpdateApp")}</Label>
    </ButtonDefaultOpacity>
  );
};

const SpecialServicesCTA = (props: Props) => {
  const { customSpecialFlowOpt } = props;

  const isCGNEnabled = useIOSelector(isCGNEnabledSelector);
  const cdcEnabledSelector = useIOSelector(isCdcEnabledSelector);

  const isCdcEnabled = cdcEnabledSelector && cdcEnabled;

  const isPnEnabled = useIOSelector(isPnEnabledSelector);

  const mapFlowFeatureFlag: Map<string, boolean> = new Map<string, boolean>([
    ["cgn", isCGNEnabled],
    ["cdc", isCdcEnabled],
    ["pn", isPnEnabled]
  ]);

  return pipe(
    customSpecialFlowOpt,
    O.fromNullable,
    O.fold(
      () => null,
      csf =>
        pipe(
          mapFlowFeatureFlag.get(csf),
          O.fromNullable,
          O.fold(
            () => <UpdateAppCTA />,
            isEnabled => {
              switch (csf) {
                case "cgn":
                  return isEnabled ? (
                    <CgnServiceCTA serviceId={props.serviceId} />
                  ) : null;
                case "cdc":
                  return isEnabled ? <CdcServiceCTA /> : null;
                case "pn":
                  return isEnabled ? (
                    <PnServiceCTA
                      serviceId={props.serviceId}
                      activate={props.activate}
                    />
                  ) : (
                    <UpdateAppCTA />
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
