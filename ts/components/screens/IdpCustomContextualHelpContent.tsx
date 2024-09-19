import * as React from "react";
import {
  ButtonOutline,
  ButtonSolid,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../i18n";
import { Idp } from "../../../definitions/content/Idp";
import { handleItemOnPress } from "../../utils/url";
import IOMarkdown from "../IOMarkdown";
import EmailCallCTA from "./EmailCallCTA";

type Props = Readonly<{
  idpTextData: Idp;
}>;

const IdpCustomContextualHelpContent = (idpTextData: Idp) => ({
  title: I18n.t("authentication.idp_login.contextualHelpTitle2"),
  body: <IdpCustomContextualHelpBody idpTextData={idpTextData} />
});

const IdpCustomContextualHelpBody = ({ idpTextData }: Props) => (
  <React.Fragment>
    {/** Recover credentials */}
    <IOMarkdown
      content={
        idpTextData.recover_username
          ? I18n.t("authentication.idp_login.dualRecoverDescription")
          : I18n.t("authentication.idp_login.recoverDescription")
      }
    />

    <VSpacer size={16} />

    {idpTextData.recover_username && (
      <React.Fragment>
        <ButtonSolid
          label={I18n.t("authentication.idp_login.recoverUsername")}
          accessibilityLabel={I18n.t(
            "authentication.idp_login.recoverUsername"
          )}
          onPress={handleItemOnPress(idpTextData.recover_username)}
        />
        <VSpacer size={16} />
      </React.Fragment>
    )}
    <ButtonSolid
      label={I18n.t("authentication.idp_login.recoverPassword")}
      accessibilityLabel={I18n.t("authentication.idp_login.recoverUsername")}
      onPress={handleItemOnPress(idpTextData.recover_password)}
    />

    {/** Idp contacts */}
    <VSpacer size={16} />
    <IOMarkdown content={idpTextData.description} />
    <VSpacer size={16} />
    <EmailCallCTA phone={idpTextData.phone} email={idpTextData.email} />
    <VSpacer size={16} />
    {idpTextData.helpdesk_form && (
      <React.Fragment>
        <ButtonOutline
          label={I18n.t("authentication.idp_login.openTicket")}
          accessibilityLabel={I18n.t(
            "authentication.idp_login.recoverUsername"
          )}
          onPress={handleItemOnPress(idpTextData.helpdesk_form)}
        />
        <VSpacer size={16} />
      </React.Fragment>
    )}
  </React.Fragment>
);

export default IdpCustomContextualHelpContent;
