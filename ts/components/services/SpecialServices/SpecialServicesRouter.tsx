import * as React from "react";
import { useCallback } from "react";
import { constNull } from "fp-ts/lib/function";
import { fromNullable } from "fp-ts/lib/Option";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import I18n from "../../../i18n";
import { openAppStoreUrl } from "../../../utils/url";
import { Label } from "../../core/typography/Label";
import { cgnEnabled, svEnabled } from "../../../config";

type Props = {
  custom_special_flow: string;
};

const mapFlowFeatureFlag: Map<string, boolean> = new Map<string, boolean>([
  ["cgn", cgnEnabled],
  ["sv", svEnabled]
]);

const SpecialServicesRouter = (props: Props) => {
  const { custom_special_flow } = props;

  // utility to open
  const openAppStore = useCallback(() => openAppStoreUrl(), []);

  return fromNullable(mapFlowFeatureFlag.get(custom_special_flow)).fold(
    <ButtonDefaultOpacity block primary onPress={openAppStore}>
      <Label color={"white"}>{I18n.t("btnUpdateApp")}</Label>
    </ButtonDefaultOpacity>,
    isFlowEnabled => {
      if (!isFlowEnabled) {
        return null;
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
          return null;
      }
    }
  );
};

export default SpecialServicesRouter;
