/**
 * A component to render a list of services organized in sections, one for each organization.
 */
import { Option } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { Button, Text, View } from "native-base";
import React, { ComponentProps } from "react";
import { Image, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";
import ServiceList from "./ServiceList";
import ServiceSectionListComponent from "./ServiceSectionListComponent";

type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
  paddingForAnimation: boolean;
  AnimatedCTAStyle?: any;
};

type BaseProps = AnimatedProps &
  ComponentProps<typeof ServiceSectionListComponent>;

interface LocalProps extends BaseProps {
  type: "Local";
  onChooserAreasOfInterestPress: () => void;
  organizationsFiscalCodesSelected: Option<Set<string>>;
}

interface OtherProps extends BaseProps {
  type: "Other";
}

type Props = LocalProps | OtherProps;

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1
  },
  headerContentWrapper: {
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

class ServicesSectionsList extends React.PureComponent<Props> {
  private listEmptyComponent() {
    return (
      this.props.type === "Local" && (
        <View style={styles.headerContentWrapper}>
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
          {this.props.paddingForAnimation && (
            <View style={styles.paddingForAnimation} />
          )}
        </View>
      )
    );
  }

  private renderEditButton = () => {
    return (
      this.props.type === "Local" && (
        <View style={styles.headerContentWrapper}>
          <Button
            small={true}
            bordered={true}
            style={styles.button}
            block={true}
            onPress={this.props.onChooserAreasOfInterestPress}
            disabled={this.props.isRefreshing}
          >
            <Text style={styles.textButton}>
              {I18n.t("services.areasOfInterest.editButton")}
            </Text>
          </Button>
        </View>
      )
    );
  };

  private renderList = () => {
    const {
      animated,
      profile,
      sections,
      isRefreshing,
      onRefresh,
      onSelect,
      readServices
    } = this.props;
    return (
      <ServiceList
        animated={animated}
        sections={sections}
        profile={profile}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onSelect={onSelect}
        readServices={readServices}
        isExperimentalFeaturesEnabled={true}
        ListEmptyComponent={this.listEmptyComponent()}
      />
    );
  };

  public render() {
    const isOrganizationsFiscalCodesSelected =
      this.props.type === "Local" &&
      this.props.organizationsFiscalCodesSelected.fold(false, _ => _.size > 0);

    return (
      <View style={styles.contentWrapper}>
        {isOrganizationsFiscalCodesSelected && this.renderEditButton()}
        {this.renderList()}
      </View>
    );
  }
}

export default ServicesSectionsList;
