import {
  ContentWrapper,
  FooterWithButtons,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { ScrollView } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { Link } from "../../../components/core/typography/Link";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import { openLink } from "../../../components/ui/Markdown/handlers/link";
import I18n from "../../../i18n";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";

const bookingUrl = I18n.t("cie.booking_url");
const browseToLink = () => openLink(bookingUrl);

const CieExpiredOrInvalidScreen = () => {
  const handleGoBack = () => resetToAuthenticationRoute();

  return (
    <TopScreenComponent
      goBack={handleGoBack}
      headerTitle={I18n.t("authentication.landing.expiredCardHeaderTitle")}
    >
      <ScreenContentHeader
        title={I18n.t("authentication.landing.expiredCardTitle")}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ContentWrapper>
          <Body>{I18n.t("authentication.landing.expiredCardContent")}</Body>
          <VSpacer size={16} />
          <Link onPress={browseToLink}>
            {I18n.t("authentication.landing.expiredCardHelp")}
          </Link>
        </ContentWrapper>
      </ScrollView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: handleGoBack
          }
        }}
      />
    </TopScreenComponent>
  );
};

export default CieExpiredOrInvalidScreen;
