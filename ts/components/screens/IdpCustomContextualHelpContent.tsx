import I18n from "i18n-js";
import * as React from "react";
import {
  ButtonOutline,
  ButtonSolid,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Idp } from "../../../definitions/content/Idp";
import { handleItemOnPress } from "../../utils/url";
import LegacyMarkdown from "../ui/Markdown/LegacyMarkdown";
import EmailCallCTA from "./EmailCallCTA";

type Props = Readonly<{
  idpTextData: Idp;
}>;

const IdpCustomContextualHelpContent = (idpTextData: Idp) => ({
  title: I18n.t("authentication.idp_login.contextualHelpTitle2"),
  body: () => <IdpCustomContextualHelpBody idpTextData={idpTextData} />
});

const IdpCustomContextualHelpBody: React.FunctionComponent<Props> = props => {
  const { idpTextData } = props;

  const [isMarkdown1Loaded, setIsMarkdown1Loaded] = React.useState(false);
  const [isMarkdown2Loaded, setIsMarkdown2Loaded] = React.useState(false);

  return (
    <React.Fragment>
      {/** Recover credentials */}
      <LegacyMarkdown onLoadEnd={() => setIsMarkdown1Loaded(true)}>
        {idpTextData.recover_username
          ? I18n.t("authentication.idp_login.dualRecoverDescription")
          : I18n.t("authentication.idp_login.recoverDescription")}
      </LegacyMarkdown>

      <VSpacer size={16} />
      {isMarkdown1Loaded && (
        <React.Fragment>
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
            accessibilityLabel={I18n.t(
              "authentication.idp_login.recoverUsername"
            )}
            onPress={handleItemOnPress(idpTextData.recover_password)}
          />
        </React.Fragment>
      )}

      {/** Idp contacts */}
      <VSpacer size={16} />
      <LegacyMarkdown onLoadEnd={() => setIsMarkdown2Loaded(true)}>
        {idpTextData.description}
      </LegacyMarkdown>
      <VSpacer size={16} />
      {isMarkdown2Loaded && (
        <React.Fragment>
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
      )}
    </React.Fragment>
  );
};

export default IdpCustomContextualHelpContent;
