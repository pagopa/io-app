import * as React from "react";
import { useCallback } from "react";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import I18n from "../../../i18n";
import { openAppStoreUrl } from "../../../utils/url";

type Props = {
  custom_special_flow?: string;
};

const SpecialServicesRouter = (props: Props) => {
  const { custom_special_flow } = props;

  // utility to open
  const openAppStore = useCallback(() => openAppStoreUrl(), []);

  switch (custom_special_flow) {
    default:
      return (
        <ButtonDefaultOpacity block primary onPress={openAppStore}>
          {I18n.t("btnUpdateApp")}
        </ButtonDefaultOpacity>
      );
  }
};

export default SpecialServicesRouter;
