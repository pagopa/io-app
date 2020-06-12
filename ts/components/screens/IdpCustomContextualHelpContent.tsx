import I18n from "i18n-js";
import { View } from "native-base";
import * as React from "react";
import { handleItemOnPress } from "../../utils/url";
import BlockButtons from "../ui/BlockButtons";
import Markdown from "../ui/Markdown";
import EmailCallCTA from "./EmailCallCTA";

type Props = Readonly<{
  idpTextData: any;
}>;

const IdpCustomContextualHelpContent = (props: Props) => {
  return {
    title: I18n.t("authentication.idp_login.contextualHelpTitle2"),
    body: () => <IdpCustomContextualHelpBody idpTextData={props.idpTextData} />
  };
};

const IdpCustomContextualHelpBody: React.FunctionComponent<Props> = props => {
  const { idpTextData } = props;

  const [isMarkdown1Loaded, setIsMarkdown1Loaded] = React.useState(false);
  const [isMarkdown2Loaded, setIsMarkdown2Loaded] = React.useState(false);

  return (
    <React.Fragment>
      {/** Recover credentials */}
      <Markdown onLoadEnd={() => setIsMarkdown1Loaded(true)}>
        {idpTextData.recover_username
          ? I18n.t("authentication.idp_login.dualRecoverDescription")
          : I18n.t("authentication.idp_login.recoverDescription")}
      </Markdown>

      <View spacer={true} />
      {isMarkdown1Loaded && (
        <React.Fragment>
          {idpTextData.recover_username && (
            <React.Fragment>
              <BlockButtons
                type={"SingleButton"}
                leftButton={{
                  title: I18n.t("authentication.idp_login.recoverUsername"),
                  onPress: handleItemOnPress(idpTextData.recover_username),
                  small: true
                }}
              />
              <View spacer={true} />
            </React.Fragment>
          )}
          <BlockButtons
            type={"SingleButton"}
            leftButton={{
              title: I18n.t("authentication.idp_login.recoverPassword"),
              onPress: handleItemOnPress(idpTextData.recover_password),
              small: true
            }}
          />
        </React.Fragment>
      )}

      {/** Idp cotnacts */}
      <View spacer={true} />
      <Markdown onLoadEnd={() => setIsMarkdown2Loaded(true)}>
        {idpTextData.description}
      </Markdown>
      <View spacer={true} />
      {isMarkdown2Loaded && (
        <React.Fragment>
          <EmailCallCTA
            phone={idpTextData.phone}
            email={idpTextData.email ? idpTextData.email : undefined}
          />
          <View spacer={true} />
          {idpTextData.helpdesk_form && (
            <React.Fragment>
              <BlockButtons
                type={"SingleButton"}
                leftButton={{
                  title: I18n.t("authentication.idp_login.openTicket"),
                  onPress: handleItemOnPress(idpTextData.helpdesk_form),
                  primary: true,
                  bordered: true,
                  small: true
                }}
              />
              <View spacer={true} />
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default IdpCustomContextualHelpContent;
