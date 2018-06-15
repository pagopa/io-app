import * as React from "react";

import { format } from "date-fns";
import enLocale from "date-fns/locale/en";
import itLocale from "date-fns/locale/it";
import _ from "lodash";
import { Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import I18n from "../../i18n";

export type OwnProps = Readonly<{
  serviceOrganizationName: string;
  service: string;
  date: Date;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show the message details info when the link is click
 */
class MessageDetailsInfoComponent extends React.Component<Props> {
  private getSender = (sentence: string): string => {
    return sentence.split(" - ")[0];
  };

  private getDepartment = (sentence: string): string => {
    return sentence.split(" - ")[1];
  };

  public render() {
    const { date, service, serviceOrganizationName } = this.props;
    const localeLanguage = I18n.locale.includes("en") ? enLocale : itLocale;

    return (
      <View>
        <View>
          <Text bold={true}>{I18n.t("messageDetails.infoLabels.data")}</Text>
          <Text>
            {" "}
            {_.capitalize(format(date, "dddd D ", { locale: localeLanguage })) +
              _.capitalize(
                format(date, "MMMM YYYY", { locale: localeLanguage })
              )}
          </Text>
        </View>
        <View>
          <Text bold={true}>
            {I18n.t("messageDetails.infoLabels.senderBy")}
          </Text>
          <Text> {this.getSender(serviceOrganizationName)}</Text>
        </View>
        <View>
          <Text bold={true}>
            {I18n.t("messageDetails.infoLabels.department")}
          </Text>
          <Text> {this.getDepartment(serviceOrganizationName)}</Text>
        </View>
        <View>
          <Text bold={true}>{I18n.t("messageDetails.infoLabels.service")}</Text>
          <Text> {service}</Text>
        </View>
      </View>
    );
  }
}

const StyledMessageDetailsInfoComponent = connectStyle(
  "NativeBase.MessageDetailsInfoComponent",
  {},
  mapPropsToStyleNames
)(MessageDetailsInfoComponent);
export default StyledMessageDetailsInfoComponent;
