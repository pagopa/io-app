import * as pot from "italia-ts-commons/lib/pot";
import { Content, Grid, View } from "native-base";
import * as React from "react";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import ExtractedCTABar from "../../components/cta/ExtractedCTABar";
import OrganizationHeader from "../../components/OrganizationHeader";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ContactPreferencesToggles from "../../components/services/ContactPreferencesToggles";
import ServiceMetadataComponent from "../../components/services/ServiceMetadata";
import TosAndPrivacyBox from "../../components/services/TosAndPrivacyBox";
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
import { logosForService } from "../../utils/services";
import { handleItemOnPress } from "../../utils/url";
import SpecialServicesCTA from "../../components/services/SpecialServices/SpecialServicesCTA";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { FooterTopShadow } from "../../features/bonus/bonusVacanze/components/FooterTopShadow";
import { SpecialServiceMetadata } from "../../../definitions/backend/SpecialServiceMetadata";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { loadServiceDetail } from "../../store/actions/services";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";

type NavigationParams = Readonly<{
  service: ServicePublic;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

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
const ServiceDetailsScreen = (props: Props) => {
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false);

  useEffect(() => {
    props.loadServiceDetail(props.serviceId);
  }, []);

  const onMarkdownEnd = () => setIsMarkdownLoaded(true);

  const { service } = props;

  // This has been considered just to avoid compiling errors
  // once we navigate from list or a message we always have the service data since they're previously loaded
  if (service === undefined) {
    return null;
  }

  const metadata = service.service_metadata;

  // if markdown content is not available, render immediately what is possible
  // but we must wait for metadata load to be completed to avoid flashes
  const isMarkdownAvailable = metadata?.description;
  // if markdown data is available, wait for it to be rendered
  const canRenderItems = isMarkdownAvailable ? isMarkdownLoaded : true;

  const maybeCTA = getServiceCTA(metadata);

  return (
    <BaseScreenComponent
      goBack={() => props.navigation.goBack()}
      headerTitle={I18n.t("serviceDetail.headerTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["services_detail"]}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content style={IOStyles.flex}>
          <Grid>
            <OrganizationHeader
              serviceName={service.service_name}
              organizationName={service.organization_name}
              logoURLs={logosForService(service)}
            />
          </Grid>
          <View spacer={true} small={true} />

          {metadata?.description && (
            <>
              <Markdown
                animated={true}
                onLoadEnd={onMarkdownEnd}
                onError={onMarkdownEnd}
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
                isSpecialService={SpecialServiceMetadata.is(metadata)}
              />
              <View spacer={true} large={true} />

              <ServiceMetadataComponent
                servicesMetadata={service.service_metadata}
                organizationFiscalCode={service.organization_fiscal_code}
                getItemOnPress={handleItemOnPress}
                serviceId={service.service_id}
                isDebugModeEnabled={props.isDebugModeEnabled}
              />

              <EdgeBorderComponent />

              <View spacer={true} extralarge={true} />
            </>
          )}
        </Content>

        {(maybeCTA.isSome() || SpecialServiceMetadata.is(metadata)) && (
          <FooterTopShadow>
            {maybeCTA.isSome() && (
              <View style={[styles.flexRow]}>
                <ExtractedCTABar
                  ctas={maybeCTA.value}
                  xsmall={false}
                  dispatch={props.dispatch}
                  serviceMetadata={metadata}
                  service={service}
                />
              </View>
            )}
            {SpecialServiceMetadata.is(metadata) && (
              <>
                <View spacer small />
                <SpecialServicesCTA
                  customSpecialFlow={metadata.custom_special_flow}
                />
              </>
            )}
          </FooterTopShadow>
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState, props: OwnProps) => {
  const serviceId = props.navigation.getParam("service").service_id;

  return {
    serviceId,
    service: fromNullable(serviceByIdSelector(serviceId)(state))
      .chain(pot.toOption)
      .toUndefined(),
    isInboxEnabled: isInboxEnabledSelector(state),
    isEmailEnabled: isEmailEnabledSelector(state),
    isEmailValidated: isProfileEmailValidatedSelector(state),
    content: contentSelector(state),
    profile: profileSelector(state),
    isDebugModeEnabled: isDebugModeEnabledSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadServiceDetail: (id: ServiceId) => dispatch(loadServiceDetail.request(id)),
  dispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServiceDetailsScreen);
