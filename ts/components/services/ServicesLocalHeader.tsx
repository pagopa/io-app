import { Button, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { ComponentProps } from "../../types/react";
import IconFont from "../ui/IconFont";
import ServicesLocal from "./ServicesLocal";

type ServicesLocalProps =
  | "paddingForAnimation"
  | "onChooserAreasOfInterestPress"
  | "organizationsFiscalCodesSelected";

type Props = Pick<ComponentProps<typeof ServicesLocal>, ServicesLocalProps>;

const styles = StyleSheet.create({
  contentWrapper: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  message: {
    fontSize: customVariables.fontSizeBase,
    textAlign: "left"
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0
  },
  textButton: {
    paddingLeft: 0,
    paddingRight: 0
  },
  icon: {
    color: customVariables.brandPrimary,
    lineHeight: 24
  },
  paddingForAnimation: {
    height: 55
  }
});

export class ServicesLocalHeader extends React.PureComponent<Props> {
  public render() {
    const {
      paddingForAnimation,
      onChooserAreasOfInterestPress,
      organizationsFiscalCodesSelected
    } = this.props;
    const isOrganizationsFiscalCodesSelected = organizationsFiscalCodesSelected.fold(
      false,
      _ => _.size > 0
    );

    return isOrganizationsFiscalCodesSelected ? (
      <View style={styles.contentWrapper}>
        <Button
          small={true}
          bordered={true}
          style={styles.button}
          block={true}
          onPress={onChooserAreasOfInterestPress}
        >
          <Text style={styles.textButton}>
            {I18n.t("services.areasOfInterest.editButton")}
          </Text>
        </Button>
        {paddingForAnimation && <View style={styles.paddingForAnimation} />}
      </View>
    ) : (
      <View style={styles.contentWrapper}>
        <Text style={styles.message}>
          {I18n.t("services.areasOfInterest.selectMessage")}
        </Text>

        <View spacer={true} large={true} />

        <Button
          small={true}
          bordered={true}
          style={styles.button}
          block={true}
          onPress={this.props.onChooserAreasOfInterestPress}
        >
          <IconFont name="io-plus" style={styles.icon} />

          <Text style={styles.textButton}>
            {I18n.t("services.areasOfInterest.addButton")}
          </Text>
        </Button>

        <View spacer={true} extralarge={true} />

        <Image source={require("../../../img/services/icon-places.png")} />
        {paddingForAnimation && <View style={styles.paddingForAnimation} />}
      </View>
    );
  }
}
