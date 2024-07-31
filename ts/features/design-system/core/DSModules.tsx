import {
  H4,
  ModuleAttachment,
  ModuleCheckout,
  ModuleCredential,
  ModuleIDP,
  ModuleNavigation,
  ModulePaymentNotice,
  ModuleSummary,
  PaymentNoticeStatus,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, ImageSourcePropType } from "react-native";
import CgnLogo from "../../../../img/bonus/cgn/cgn_logo.png";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { LegacyModuleAttachment } from "../../messages/components/MessageDetail/LegacyModuleAttachment";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

type PaymentNoticeStatusWithoutDefault = Exclude<
  PaymentNoticeStatus,
  "default"
>;

const noticeStatusArray: Array<PaymentNoticeStatusWithoutDefault> = [
  "paid",
  "error",
  "expired",
  "revoked",
  "canceled"
];

const sectionTitleMargin = 16;
const sectionMargin = 48;
const componentMargin = 24;
const componentInnerMargin = 8;

export const DSModules = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const theme = useIOTheme();
  return (
    <DesignSystemScreen title="Modules">
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModuleAttachment</H4>
          {renderModuleAttachment(isDesignSystemEnabled)}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModulePaymentNotice</H4>
          {renderModulePaymentNotice()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModuleCheckout</H4>
          {renderModuleCheckout()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModuleCredential</H4>
          {renderModuleCredential()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModuleNavigation</H4>
          {renderModuleNavigation()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModuleSummary</H4>
          {renderModuleSummary()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModuleIDP</H4>
          {renderModuleIDP()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderModuleAttachment = (isDesignSystemEnabled: boolean) => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModuleAttachment, loading">
      {isDesignSystemEnabled ? (
        <ModuleAttachment
          title="Nome del documento.pdf"
          format="pdf"
          isLoading={true}
          onPress={onButtonPress}
        />
      ) : (
        <LegacyModuleAttachment
          title="Nome del documento.pdf"
          subtitle="123 Kb"
          format="pdf"
          isLoading={true}
          onPress={onButtonPress}
        />
      )}
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, default variant">
      <VStack space={componentInnerMargin}>
        {isDesignSystemEnabled ? (
          <ModuleAttachment
            title="Nome del documento.pdf"
            format="pdf"
            onPress={onButtonPress}
          />
        ) : (
          <LegacyModuleAttachment
            title="Nome del documento.pdf"
            subtitle="123 Kb"
            format="pdf"
            onPress={onButtonPress}
          />
        )}
        {isDesignSystemEnabled ? null : (
          <LegacyModuleAttachment
            title="Nome del documento.pdf"
            format="pdf"
            onPress={onButtonPress}
          />
        )}
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, stress test">
      {isDesignSystemEnabled ? (
        <ModuleAttachment
          title="This is a very loooooooooooooooooooooong title"
          format="pdf"
          onPress={onButtonPress}
        />
      ) : (
        <LegacyModuleAttachment
          title={"This is a very loooooooooooooooooooooong title"}
          subtitle={"This is a very loooooooooooong subtitle"}
          format="pdf"
          onPress={onButtonPress}
        />
      )}
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, fetching">
      {isDesignSystemEnabled ? (
        <ModuleAttachment
          title="Nome del documento.pdf"
          format="pdf"
          isFetching={true}
          onPress={onButtonPress}
        />
      ) : (
        <LegacyModuleAttachment
          title="Nome del documento.pdf"
          subtitle="123 Kb"
          format="pdf"
          isFetching={true}
          onPress={onButtonPress}
        />
      )}
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, disabled">
      {isDesignSystemEnabled ? (
        <ModuleAttachment
          title="Nome del documento.pdf"
          format="pdf"
          disabled={true}
          onPress={onButtonPress}
        />
      ) : (
        <LegacyModuleAttachment
          title="Nome del documento.pdf"
          subtitle="123 Kb"
          format="pdf"
          disabled={true}
          onPress={onButtonPress}
        />
      )}
    </DSComponentViewerBox>
  </VStack>
);

const renderModulePaymentNotice = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModulePaymentNotice, loading">
      <ModulePaymentNotice
        title="Codice avviso"
        subtitle="9999 9999 9999 9999 99"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        isLoading={true}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModulePaymentNotice, default with amount">
      <ModulePaymentNotice
        title="Codice avviso"
        subtitle="9999 9999 9999 9999 99"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModulePaymentNotice, various statuses">
      <VStack space={componentInnerMargin}>
        {noticeStatusArray.map(
          (noticeStatus: PaymentNoticeStatusWithoutDefault) => (
            <ModulePaymentNotice
              key={`paymentNotice-${noticeStatus}`}
              title="Codice avviso"
              subtitle="9999 9999 9999 9999 99"
              paymentNoticeStatus={noticeStatus}
              badgeText={getBadgeTextByPaymentNoticeStatus(noticeStatus)}
              onPress={onButtonPress}
            />
          )
        )}
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModulePaymentNotice, default, without title">
      <ModulePaymentNotice
        subtitle="TARI 2023 - Rata 01"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderModuleCheckout = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModuleCheckout, loading">
      <ModuleCheckout isLoading />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, default">
      <ModuleCheckout
        paymentLogo="amex"
        title="Amex"
        subtitle="arien_c********@**hoo.it"
        ctaText="Modifica"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, default, with image">
      <ModuleCheckout
        image={{
          uri: "https://assets.cdn.platform.pagopa.it/apm/bancomatpay.png"
        }}
        title="Paga con Bancomat PAY"
        ctaText="Modifica"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, no description">
      <ModuleCheckout
        paymentLogo="amex"
        title="Amex"
        ctaText="Modifica"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, no icon">
      <ModuleCheckout
        title="3,50 $"
        subtitle="Piú o meno"
        ctaText="Modifica"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, no CTA, with image">
      <ModuleCheckout
        image={{
          uri: "https://assets.cdn.platform.pagopa.it/apm/bancomatpay.png"
        }}
        title="3,50 $"
        subtitle="Piú o meno"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, no CTA">
      <ModuleCheckout
        title="3,50 $"
        subtitle="Piú o meno"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderModuleSummary = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModuleSummary, default variant">
      <ModuleSummary
        label={"Label name"}
        description={"This is a description of the element"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleSummary, custom icon, label only">
      <ModuleSummary
        icon="chevronRightListItem"
        label={"Label only"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleSummary, stress test">
      <ModuleSummary
        label={"A very looong loooooooong looooooooooooooong label"}
        description={"This is a very looooooong description of the element"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
  </VStack>
);

const mockIDPProviderItem = {
  id: "posteid",
  name: "Poste ID",
  logo: "",
  localLogo: require("../../../../img/spid-idp-posteid.png"),
  profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
};

const renderModuleIDP = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModuleIDP, default variant">
      <ModuleIDP
        name={mockIDPProviderItem.name}
        logo={mockIDPProviderItem.logo as ImageSourcePropType}
        localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
        onPress={onButtonPress}
        testID={`idp-${mockIDPProviderItem.id}-button`}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleIDP, loose spacing (saved) variant">
      <ModuleIDP
        withLooseSpacing
        name={mockIDPProviderItem.name}
        logo={mockIDPProviderItem.logo as ImageSourcePropType}
        localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
        onPress={onButtonPress}
        testID={`idp-${mockIDPProviderItem.id}-button`}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleIDP, default variant, stress test">
      <ModuleIDP
        name={"This is a very loooooong IDP provider name"}
        logo={mockIDPProviderItem.logo as ImageSourcePropType}
        localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
        onPress={onButtonPress}
        testID={`idp-${mockIDPProviderItem.id}-button`}
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderModuleCredential = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModuleCredential, loading">
      <ModuleCredential isLoading={true} />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCredential">
      <ModuleCredential
        icon="fingerprint"
        label="Identità digitale"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCredential, with Badge">
      <ModuleCredential
        icon="fingerprint"
        label="Identità digitale"
        onPress={onButtonPress}
        badge={{
          text: "predefinita",
          variant: "info"
        }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCredential, with long label">
      <ModuleCredential
        icon="fingerprint"
        label="This is a very long long long label"
        onPress={onButtonPress}
        badge={{
          text: "predefinita",
          variant: "info"
        }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCredential, with image asset">
      <ModuleCredential
        image={CgnLogo}
        label="Carta Giovani Nazionale"
        badge={{
          text: "già presente",
          variant: "success"
        }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCredential, fetching">
      <ModuleCredential
        icon="fingerprint"
        label="Identità digitale"
        onPress={onButtonPress}
        isFetching={true}
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderModuleNavigation = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModuleNavigation, loading">
      <ModuleNavigation isLoading={true} />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleNavigation">
      <ModuleNavigation
        icon="spid"
        title="SPID"
        subtitle="Usa credenziali e app (o SMS)"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleNavigation, with Image">
      <ModuleNavigation
        image={CgnLogo}
        title="Carta Giovani Nazionale"
        subtitle="Usa credenziali e app (o SMS)"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleNavigation, with Badge">
      <ModuleNavigation
        icon="spid"
        title="SPID"
        subtitle="Usa credenziali e app (o SMS)"
        onPress={onButtonPress}
        badge={{
          text: "In arrivo",
          variant: "blue",
          outline: true
        }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleNavigation, with Badge, stress test">
      <ModuleNavigation
        icon="spid"
        title="Testo relativo allo SPID davvero molto lungo"
        subtitle="Usa credenziali e app (o SMS), ma anche qui il testo è molto lungo"
        onPress={onButtonPress}
        badge={{
          text: "In arrivo",
          variant: "blue",
          outline: true
        }}
      />
    </DSComponentViewerBox>
  </VStack>
);
