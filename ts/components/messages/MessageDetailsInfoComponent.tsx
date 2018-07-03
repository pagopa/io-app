import * as React from "react";

import { format } from "date-fns";
import enLocale from "date-fns/locale/en";
import itLocale from "date-fns/locale/it";
import { capitalize } from "lodash";
import { Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import I18n from "../../i18n";

export type OwnProps = Readonly<{
  serviceOrganizationName: string;
  serviceDepartmentName: string;
  serviceName: string;
  createdAt: Date;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show the message details info when the link is click
 */
class MessageDetailsInfoComponent extends React.Component<Props> {
  public render() {
    const {
      createdAt,
      serviceDepartmentName,
      serviceOrganizationName,
      serviceName
    } = this.props;
    const localeLanguage = I18n.locale.includes("en") ? enLocale : itLocale;
    return (
      <View>
        <View>
          <Text bold={true}>{I18n.t("messageDetails.infoLabels.data")}</Text>
          <Text>
            {` ${capitalize(
              format(createdAt, "dddd D ", { locale: localeLanguage })
            )}${capitalize(
              format(createdAt, "MMMM YYYY", { locale: localeLanguage })
            )}`}
          </Text>
        </View>
        <View>
          <Text bold={true}>
            {I18n.t("messageDetails.infoLabels.senderFrom")}:
          </Text>
          <Text> {serviceOrganizationName}</Text>
        </View>
        <View>
          <Text bold={true}>
            {I18n.t("messageDetails.infoLabels.department")}:
          </Text>
          <Text> {serviceDepartmentName}</Text>
        </View>
        <View>
          <Text bold={true}>
            {I18n.t("messageDetails.infoLabels.service")}:
          </Text>
          <Text> {serviceName}</Text>
        </View>
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
