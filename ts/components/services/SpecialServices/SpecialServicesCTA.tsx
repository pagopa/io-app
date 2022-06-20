import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useCallback } from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { SpecialServiceMetadata } from "../../../../definitions/backend/SpecialServiceMetadata";
import { cdcEnabled } from "../../../config";
import CdcServiceCTA from "../../../features/bonus/cdc/components/CdcServiceCTA";
import CgnServiceCTA from "../../../features/bonus/cgn/components/CgnServiceCTA";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import {
  isCdcEnabledSelector,
  isCGNEnabledSelector
} from "../../../store/reducers/backendStatus";
import { openAppStoreUrl } from "../../../utils/url";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import { Label } from "../../core/typography/Label";

type CustomSpecialFlow = SpecialServiceMetadata["custom_special_flow"];

type Props = {
  customSpecialFlow: CustomSpecialFlow;
  serviceId: ServiceId;
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

  const mapFlowFeatureFlag: Map<CustomSpecialFlow, boolean> = new Map<
    CustomSpecialFlow,
    boolean
  >([
    ["cgn" as CustomSpecialFlow, isCGNEnabled],
    ["cdc" as CustomSpecialFlow, isCdcEnabled]
  ]);

  return pipe(
    customSpecialFlow,
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
