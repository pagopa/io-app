import * as React from "react";

import { format } from "date-fns";
import enLocale from "date-fns/locale/en";
import itLocale from "date-fns/locale/it";
import { capitalize } from "lodash";
import { Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";

import I18n from "../../i18n";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

export type OwnProps = Readonly<{
  message: MessageWithContentPO;
  senderService: ServicePublic | undefined;
  navigateToServicePreferences: (() => void) | undefined;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show the message details info when the link is click
 */
class MessageDetailsInfoComponent extends React.Component<Props> {
  public render() {
    const { created_at } = this.props.message;

    const localeLanguage = I18n.locale.includes("en") ? enLocale : itLocale;

    const senderService = this.props.senderService;

    return (
      <View>
        <View>
          <Text bold={true}>{I18n.t("messageDetails.infoLabels.data")}</Text>
          <Text>
            {` ${capitalize(
              format(created_at, "dddd D ", { locale: localeLanguage })
            )}${capitalize(
              format(created_at, "MMMM YYYY", { locale: localeLanguage })
            )}`}
          </Text>
        </View>
        {senderService && (
          <View>
            <Text bold={true}>
              {`${I18n.t("messageDetails.infoLabels.senderFrom")}: `}
            </Text>
            <Text>{senderService.organization_name}</Text>
          </View>
        )}
        {senderService && (
          <View>
            <Text bold={true}>
              {`${I18n.t("messageDetails.infoLabels.department")}: `}
            </Text>
            <Text>{senderService.department_name}</Text>
          </View>
        )}
        {senderService && (
          <View>
            <Text bold={true}>
              {`${I18n.t("messageDetails.infoLabels.service")}: `}
            </Text>
            <Text link={true} onPress={this.props.navigateToServicePreferences}>
              {senderService.service_name}
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const StyledMessageDetailsInfoComponent = connectStyle(
  "UIComponent.MessageDetailsInfoComponent",
  {},
  mapPropsToStyleNames
)(MessageDetailsInfoComponent);
export default StyledMessageDetailsInfoComponent;
