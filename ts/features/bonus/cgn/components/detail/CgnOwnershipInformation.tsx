import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import {
  Divider,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import { profileSelector } from "../../../../../store/reducers/profile";
import { useIOSelector } from "../../../../../store/hooks";

/**
 * Renders the CGN ownership block for detail screen, including Owner's Fiscal Code (The current user logged in)
 * @constructor
 */
const CgnOwnershipInformation = (): React.ReactElement => {
  const currentProfile = useIOSelector(profileSelector);
  return (
    <>
      {pot.isSome(currentProfile) && (
        <>
          <ListItemHeader label={I18n.t("bonus.cgn.detail.ownership")} />
          <ListItemInfo label="Nome" value={currentProfile.value.name} />
          <Divider />
          <ListItemInfo
            label="Cognome"
            value={currentProfile.value.family_name}
          />
          <Divider />
          <ListItemInfo
            label="Codice Fiscale"
            value={currentProfile.value.fiscal_code}
          />
        </>
      )}
    </>
  );
};

export default CgnOwnershipInformation;
