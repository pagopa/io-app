import * as pot from "italia-ts-commons/lib/pot";
import { Content, Grid, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import ExtractedCTABar from "../../components/cta/ExtractedCTABar";
import OrganizationHeader from "../../components/OrganizationHeader";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { Dispatch } from "../../store/actions/types";
import { contentSelector } from "../../store/reducers/content";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import {
  isEmailEnabledSelector,
  isInboxEnabledSelector,
  isProfileEmailValidatedSelector,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { getServiceCTA } from "../../utils/messages";
import {
  EnabledChannels,
  getEnabledChannelsForService
} from "../../utils/profile";
import { showToast } from "../../utils/showToast";
import { handleItemOnPress } from "../../utils/url";
import ContactPreferencesToggles from "../../components/services/ContactPreferencesToggles";
import ServiceMetadata from "../../components/services/ServiceMetadata";
import TosAndPrivacyBox from "../../components/services/TosAndPrivacyBox";

type NavigationParams = Readonly<{
  service: ServicePublic;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationInjectedProps<NavigationParams>;

type State = {
  uiEnabledChannels: EnabledChannels;
  isMarkdownLoaded: boolean;
};

const styles = StyleSheet.create({
  infoHeader: {
    marginTop: customVariables.spacerLargeHeight
  },
  infoItem: {
    flexDirection: "column",
    marginTop: customVariables.spacerHeight
  },
  badgeLogo: {
    width: 150,
    height: 50,
    alignSelf: "flex-start"
  },
  switchRow: {
    justifyContent: "space-between",
    paddingVertical: 12
  },
  otherSwitchRow: {
    borderTopColor: customVariables.itemSeparator,
    borderTopWidth: 1 / 3
  },
  flexRow: {
    flexDirection: "row"
  },
  enabledColor: {
    color: customVariables.brandDarkestGray
  },
  disabledColor: {
    color: customVariables.lightGray
  },
  info: {
    marginTop: -5
  },
  imageHeight: {
    height: 60
  },
  imageWidth: {
    width: 60
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "serviceDetail.headerTitle",
  body: "serviceDetail.contextualHelpContent"
};

/**
 * Screen displaying the details of a selected service. The user
 * can enable/disable the service and customize the notification settings.
 */
class ServiceDetailsScreen extends React.Component<Props, State> {
  get serviceId() {
    return this.props.navigation.getParam("service").service_id;
  }

  constructor(props: Props) {
    super(props);
    // We initialize the UI by making the states of the channels the same
    // as what is set in the profile. The user will be able to change the state
    // via the UI and the profile will be updated in the background accordingly
    this.state = {
      uiEnabledChannels: getEnabledChannelsForService(
        this.props.profile,
        this.serviceId
      ),
      isMarkdownLoaded: false
    };
  }

  public componentDidUpdate(prevProps: Props) {
    if (pot.isError(this.props.profile) && !pot.isError(prevProps.profile)) {
      // in case of new or resolved errors while updating the profile, we show a toast and
      // reset the UI to match the state of the profile preferences
      showToast(
        I18n.t("serviceDetail.onUpdateEnabledChannelsFailure"),
        "danger"
      );

      const uiEnabledChannels = getEnabledChannelsForService(
        this.props.profile,
        this.props.navigation.getParam("service").service_id
      );
      this.setState({
        uiEnabledChannels
      });
    }
  }
  // collect the service
  private service = this.props.navigation.getParam("service");

  private onMarkdownEnd = () => {
    this.setState({ isMarkdownLoaded: true });
  };

  public render() {
    const { service } = this;

    const metadata = service.service_metadata;

    // if markdown content is not available, render immediately what is possible
    // but we must wait for metadata load to be completed to avoid flashes
    const isMarkdownAvailable = metadata?.description;
    const isMarkdownLoaded = isMarkdownAvailable
      ? this.state.isMarkdownLoaded
      : true;
    // if markdown data is available, wait for it to be rendered
    const canRenderItems = isMarkdownLoaded;

    const maybeCTA = getServiceCTA(metadata);

    return (
      <BaseScreenComponent
        goBack={this.props.navigation.goBack}
        headerTitle={I18n.t("serviceDetail.headerTitle")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["services_detail"]}
      >
        <Content>
          <Grid>
            <OrganizationHeader service={service} />
          </Grid>
          <View spacer={true} small={true} />

          {metadata?.description && (
            <>
              <Markdown
                animated={true}
                onLoadEnd={this.onMarkdownEnd}
                onError={this.onMarkdownEnd}
              >
                {metadata.description}
              </Markdown>
              <View spacer={true} large={true} />
            </>
          )}

          {canRenderItems && (
            <>
              {metadata && (
                <>
                  <TosAndPrivacyBox
                    tosUrl={metadata.tos_url}
                    privacyUrl={metadata.privacy_url}
                  />
                  <View spacer={true} large={true} />
                </>
              )}

              <ContactPreferencesToggles
                serviceId={service.service_id}
                channels={service.available_notification_channels}
              />
              <View spacer={true} large={true} />

              <ServiceMetadata
                servicesMetadata={service.service_metadata}
                organizationFiscalCode={service.organization_fiscal_code}
                getItemOnPress={handleItemOnPress}
                serviceId={service.service_id}
                isDebugModeEnabled={this.props.isDebugModeEnabled}
              />

              <EdgeBorderComponent />

              <View spacer={true} extralarge={true} />
            </>
          )}
        </Content>

        {maybeCTA.isSome() && (
          <View footer={true} style={styles.flexRow}>
            <ExtractedCTABar
              ctas={maybeCTA.value}
              xsmall={false}
              dispatch={this.props.dispatch}
              serviceMetadata={metadata}
              service={service}
            />
          </View>
        )}
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isInboxEnabled: isInboxEnabledSelector(state),
  isEmailEnabled: isEmailEnabledSelector(state),
  isEmailValidated: isProfileEmailValidatedSelector(state),
  content: contentSelector(state),
  profile: profileSelector(state),
  isDebugModeEnabled: isDebugModeEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServiceDetailsScreen);
