import * as React from "react";
import { useCallback } from "react";
import { constNull } from "fp-ts/lib/function";
import { fromNullable } from "fp-ts/lib/Option";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import I18n from "../../../i18n";
import { openAppStoreUrl } from "../../../utils/url";
import { Label } from "../../core/typography/Label";
import { SpecialServiceMetadata } from "../../../../definitions/backend/SpecialServiceMetadata";
import { cgnEnabled } from "../../../config";

type CustomSpecialFlow = SpecialServiceMetadata["custom_special_flow"];
type Props = {
  custom_special_flow: CustomSpecialFlow;
};

const mapFlowFeatureFlag: Map<CustomSpecialFlow, boolean> = new Map<
  CustomSpecialFlow,
  boolean
>([["cgn" as CustomSpecialFlow, cgnEnabled]]);

const SpecialServicesRouter = (props: Props) => {
  const { custom_special_flow } = props;

  // utility to open
  const openAppStore = useCallback(() => openAppStoreUrl(), []);

  return fromNullable(custom_special_flow).fold(null, csf =>
    fromNullable(mapFlowFeatureFlag.get(csf)).fold(null, isFlowEnabled => {
      if (!isFlowEnabled) {
        return (
          <ButtonDefaultOpacity block primary onPress={openAppStore}>
            <Label color={"white"}>{I18n.t("btnUpdateApp")}</Label>
          </ButtonDefaultOpacity>
        );
      }
      switch (custom_special_flow) {
        case "cgn":
          // TODO Implement the correct CTA component
          return (
            <ButtonDefaultOpacity block primary onPress={constNull}>
              <Label color={"white"}>{custom_special_flow}</Label>
            </ButtonDefaultOpacity>
          );
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

export default SpecialServicesRouter;
