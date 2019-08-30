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
};

type BaseProps = AnimatedProps &
  ComponentProps<typeof ServiceSectionListComponent>;

interface LocalSectionProps extends BaseProps {
  type: "Local";
  onChooserAreasOfInterestPress: () => void;
  organizationsFiscalCodesSelected: Option<Set<string>>;
}

interface GenericSectionProps extends BaseProps {
  type: "Generic";
}

type Props = LocalSectionProps | GenericSectionProps;

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
  }
});

class ServicesSectionsList extends React.PureComponent<Props> {
  private localListEmptyComponent() {
    return (
      this.props.type === "Local" && (
        <View style={styles.headerContentWrapper}>
          <Text style={styles.message}>
            {I18n.t("services.areasOfInterest.selectMessage")}
          </Text>
          <View spacer={true} large={true} />
          <Button
            small={true}
            primary={true}
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
        </View>
      )
    );
  }

  private renderEditButton = () => {
    return (
      this.props.type === "Local" &&
      this.props.organizationsFiscalCodesSelected.fold(
        false,
        _ => _.size > 0
      ) && (
        <View style={styles.headerContentWrapper}>
          <Button
            small={true}
            primary={true}
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
        ListEmptyComponent={
          this.props.type === "Local" && this.localListEmptyComponent()
        }
      />
    );
  };

  public render() {
    return (
      <View style={styles.contentWrapper}>
        {this.renderEditButton()}
        {this.renderList()}
      </View>
    );
  }
}

export default ServicesSectionsList;
