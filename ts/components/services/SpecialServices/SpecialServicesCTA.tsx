import * as React from "react";
import { useCallback } from "react";
import { fromNullable } from "fp-ts/lib/Option";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import I18n from "../../../i18n";
import { openAppStoreUrl } from "../../../utils/url";
import { Label } from "../../core/typography/Label";
import { SpecialServiceMetadata } from "../../../../definitions/backend/SpecialServiceMetadata";
import { useIOSelector } from "../../../store/hooks";
import { isCGNEnabledSelector } from "../../../store/reducers/backendStatus";
import CgnServiceCTA from "../../../features/bonus/cgn/components/CgnServiceCTA";
import { ServiceId } from "../../../../definitions/backend/ServiceId";

type CustomSpecialFlow = SpecialServiceMetadata["custom_special_flow"];
type Props = {
  customSpecialFlow: CustomSpecialFlow;
  serviceId: ServiceId;
};

const SpecialServicesCTA = (props: Props) => {
  const { customSpecialFlow } = props;

  const isCGNEnabled = useIOSelector(isCGNEnabledSelector);

  const mapFlowFeatureFlag: Map<CustomSpecialFlow, boolean> = new Map<
    CustomSpecialFlow,
    boolean
  >([["cgn" as CustomSpecialFlow, isCGNEnabled]]);

  // utility to open
  const openAppStore = useCallback(() => openAppStoreUrl(), []);

  return fromNullable(customSpecialFlow).fold(null, csf =>
    fromNullable(mapFlowFeatureFlag.get(csf)).fold(null, isFlowEnabled => {
      if (!isFlowEnabled) {
        return (
          <ButtonDefaultOpacity block primary onPress={openAppStore}>
            <Label color={"white"}>{I18n.t("btnUpdateApp")}</Label>
          </ButtonDefaultOpacity>
        );
      }
      switch (customSpecialFlow) {
        case "cgn":
          return <CgnServiceCTA serviceId={props.serviceId} />;
        default:
          return (
            <ButtonDefaultOpacity block primary onPress={openAppStore}>
              <Label color={"white"}>{I18n.t("btnUpdateApp")}</Label>
            </ButtonDefaultOpacity>
          );
      }
    })
  );
};

export default SpecialServicesCTA;
