import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Grid } from "native-base";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { SpecialServiceMetadata } from "../../../definitions/backend/SpecialServiceMetadata";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ExtractedCTABar from "../../components/cta/ExtractedCTABar";
import OrganizationHeader from "../../components/OrganizationHeader";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ContactPreferencesToggles from "../../components/services/ContactPreferencesToggles";
import ServiceMetadataComponent from "../../components/services/ServiceMetadata";
import SpecialServicesCTA from "../../components/services/SpecialServices/SpecialServicesCTA";
import TosAndPrivacyBox from "../../components/services/TosAndPrivacyBox";
import Markdown from "../../components/ui/Markdown";
import { FooterTopShadow } from "../../features/bonus/bonusVacanze/components/FooterTopShadow";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { ServicesParamsList } from "../../navigation/params/ServicesParamsList";
import { loadServiceDetail } from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import { contentSelector } from "../../store/reducers/content";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import {
  isEmailEnabledSelector,
  isInboxEnabledSelector,
  isProfileEmailValidatedSelector,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { getServiceCTA } from "../../utils/messages";
import { logosForService } from "../../utils/services";
import { handleItemOnPress } from "../../utils/url";

export type ServiceDetailsScreenNavigationParams = Readonly<{
  serviceId: ServiceId;
  // if true the service should be activated automatically
  // as soon as the screen is shown (used for custom activation
  // flows like PN)
  activate?: boolean;
}>;

type OwnProps = IOStackNavigationRouteProps<
  ServicesParamsList,
  "SERVICE_DETAIL"
>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

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

  const { service, serviceId, loadServiceDetail } = props;
  useEffect(() => {
    loadServiceDetail(serviceId);
  }, [serviceId, loadServiceDetail]);

  const onMarkdownEnd = () => setIsMarkdownLoaded(true);

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
  const showCTA =
    (O.isSome(maybeCTA) || SpecialServiceMetadata.is(metadata)) &&
    canRenderItems;

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
          <VSpacer size={8} />

          {metadata?.description && (
            <>
              <Markdown
                animated={true}
                onLoadEnd={onMarkdownEnd}
                onError={onMarkdownEnd}
              >
                {metadata.description}
              </Markdown>
              <VSpacer size={24} />
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
                  <VSpacer size={24} />
                </>
              )}

              <ContactPreferencesToggles
                serviceId={service.service_id}
                channels={service.available_notification_channels}
                isSpecialService={SpecialServiceMetadata.is(metadata)}
              />
              <VSpacer size={24} />

              <ServiceMetadataComponent
                servicesMetadata={service.service_metadata}
                organizationFiscalCode={service.organization_fiscal_code}
                getItemOnPress={handleItemOnPress}
                serviceId={service.service_id}
                isDebugModeEnabled={props.isDebugModeEnabled}
              />

              <EdgeBorderComponent />
            </>
          )}
        </Content>

        {showCTA && (
          <FooterTopShadow>
            {O.isSome(maybeCTA) && (
              <View style={IOStyles.row}>
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
                <VSpacer size={8} />
                <SpecialServicesCTA
                  serviceId={props.serviceId}
                  customSpecialFlow={metadata.custom_special_flow}
                  activate={props.activate}
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
  const serviceId = props.route.params.serviceId;
  const activate = props.route.params.activate;

  return {
    serviceId,
    activate,
    service: pipe(
      serviceByIdSelector(serviceId)(state),
      O.fromNullable,
      O.chain(pot.toOption),
      O.toUndefined
    ),
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
