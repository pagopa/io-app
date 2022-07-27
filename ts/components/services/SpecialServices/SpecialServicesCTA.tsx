import * as React from "react";
import { useCallback } from "react";
import { fromNullable } from "fp-ts/lib/Option";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import I18n from "../../../i18n";
import { openAppStoreUrl } from "../../../utils/url";
import { Label } from "../../core/typography/Label";
import { SpecialServiceMetadata } from "../../../../definitions/backend/SpecialServiceMetadata";
import { useIOSelector } from "../../../store/hooks";
import {
  isCdcEnabledSelector,
  isCGNEnabledSelector,
  isPnEnabledSelector
} from "../../../store/reducers/backendStatus";
import CgnServiceCTA from "../../../features/bonus/cgn/components/CgnServiceCTA";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import CdcServiceCTA from "../../../features/bonus/cdc/components/CdcServiceCTA";
import { cdcEnabled } from "../../../config";
import PnServiceCTA from "../../../features/pn/components/PnServiceCTA";

type CustomSpecialFlow = SpecialServiceMetadata["custom_special_flow"];

type Props = {
  customSpecialFlow: CustomSpecialFlow;
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
  const { customSpecialFlow } = props;

  const isCGNEnabled = useIOSelector(isCGNEnabledSelector);
  const cdcEnabledSelector = useIOSelector(isCdcEnabledSelector);

  const isCdcEnabled = cdcEnabledSelector && cdcEnabled;

  const isPnEnabled = useIOSelector(isPnEnabledSelector);

  const mapFlowFeatureFlag: Map<CustomSpecialFlow, boolean> = new Map<
    CustomSpecialFlow,
    boolean
  >([
    ["cgn" as CustomSpecialFlow, isCGNEnabled],
    ["cdc" as CustomSpecialFlow, isCdcEnabled],
    ["pn" as CustomSpecialFlow, isPnEnabled]
  ]);

  return fromNullable(customSpecialFlow).fold(null, csf =>
    fromNullable(mapFlowFeatureFlag.get(csf)).fold(
      <UpdateAppCTA />,
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
  );
};

export default SpecialServicesCTA;
