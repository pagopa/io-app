import { Option } from "fp-ts/lib/Option";
import { Button, Text, View } from "native-base";
import React from "react";
import { Image, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { ComponentProps } from "../../types/react";
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

type OwnProps = {
  onChooserAreasOfInterestPress: () => void;
  organizationsFiscalCodesSelected: Option<Set<string>>;
};

type ServiceSectionListComponentProps =
  | "sections"
  | "profile"
  | "isRefreshing"
  | "onRefresh"
  | "onSelect"
  | "readServices";

type Props = OwnProps &
  AnimatedProps &
  Pick<
    ComponentProps<typeof ServiceSectionListComponent>,
    ServiceSectionListComponentProps
  >;

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

/**
 * A component to render a list of local services.
 */
class ServicesLocal extends React.PureComponent<Props> {
  public render() {
    const isOrganizationsFiscalCodesSelected = this.props.organizationsFiscalCodesSelected.fold(
      false,
      _ => _.size > 0
    );
    return (
      <View style={styles.contentWrapper}>
        {isOrganizationsFiscalCodesSelected && this.renderEditButton()}
        {this.renderList()}
      </View>
    );
  }

  private listEmptyComponent() {
    return (
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
    );
  }

  private renderEditButton = () => {
    const { onChooserAreasOfInterestPress, isRefreshing } = this.props;
    return (
      <View style={styles.headerContentWrapper}>
        <Button
          small={true}
          bordered={true}
          style={styles.button}
          block={true}
          onPress={onChooserAreasOfInterestPress}
          disabled={isRefreshing}
        >
          <Text style={styles.textButton}>
            {I18n.t("services.areasOfInterest.editButton")}
          </Text>
        </Button>
      </View>
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
}

export default ServicesLocal;
