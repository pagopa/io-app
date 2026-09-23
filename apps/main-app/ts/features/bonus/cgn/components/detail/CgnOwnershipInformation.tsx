import { Divider, ListItemHeader, ListItemInfo } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { ReactElement } from "react";
import { View } from "react-native";

import { useIOSelector } from "../../../../../store/hooks";
import { capitalizeTextName } from "../../../../../utils/strings";
import { profileSelector } from "../../../../settings/common/store/selectors";

/**
 * Renders the CGN ownership block for detail screen, including Owner's Fiscal Code (The current user logged in)
 * @constructor
 */
const CgnOwnershipInformation = (): ReactElement => {
  const currentProfile = useIOSelector(profileSelector);
  return (
    <View>
      {pot.isSome(currentProfile) && (
        <>
          <ListItemHeader label={I18n.t("bonus.cgn.detail.ownership")} />
          <ListItemInfo
            label={I18n.t("bonus.cgn.detail.ownershipData.name")}
            value={capitalizeTextName(currentProfile.value.name)}
          />
          <Divider />
          <ListItemInfo
            label={I18n.t("bonus.cgn.detail.ownershipData.surname")}
            value={capitalizeTextName(currentProfile.value.family_name)}
          />
          <Divider />
          <ListItemInfo
            label={I18n.t("bonus.cgn.detail.ownershipData.fiscalCode")}
            value={currentProfile.value.fiscal_code}
          />
        </>
      )}
    </View>
  );
};

export default CgnOwnershipInformation;
