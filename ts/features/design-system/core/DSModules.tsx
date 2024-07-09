import * as React from "react";
import { Alert, View, ImageSourcePropType } from "react-native";
import {
  ButtonExtendedOutline,
  ModuleAttachment,
  ModuleCheckout,
  ModuleCredential,
  ModuleIDP,
  ModuleNavigation,
  ModulePaymentNotice,
  PaymentNoticeStatus,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { H2 } from "../../../components/core/typography/H2";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { LegacyModuleAttachment } from "../../messages/components/MessageDetail/LegacyModuleAttachment";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import CgnLogo from "../../../../img/bonus/cgn/cgn_logo.png";

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

export const DSModules = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const theme = useIOTheme();
  return (
    <DesignSystemScreen title="Modules">
      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16 }}
      >
        ModuleAttachment
      </H2>
      {renderModuleAttachment(isDesignSystemEnabled)}

      <VSpacer size={40} />

      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16 }}
      >
        ModulePaymentNotice
      </H2>
      {renderModulePaymentNotice()}

      <VSpacer size={40} />

      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16 }}
      >
        ModuleCheckout
      </H2>
      {renderModuleCheckout()}

      <VSpacer size={40} />

      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16, marginTop: 16 }}
      >
        ModuleCredential
      </H2>
      {renderModuleCredential()}

      <VSpacer size={40} />

      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16, marginTop: 16 }}
      >
        ModuleNavigation
      </H2>
      {renderModuleNavigation()}

      <VSpacer size={40} />

      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16 }}
      >
        ButtonExtendedOutline
      </H2>
      {renderButtonExtendedOutline()}

      <VSpacer size={40} />

      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16 }}
      >
        ModuleIDP
      </H2>
      {renderModuleIDP()}
    </DesignSystemScreen>
  );
};

const renderModuleAttachment = (isDesignSystemEnabled: boolean) => (
  <DSComponentViewerBox name="ModuleAttachment">
    <View>
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
      <VSpacer size={16} />
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
      <VSpacer size={16} />
      {isDesignSystemEnabled ? null : (
        <LegacyModuleAttachment
          title="Nome del documento.pdf"
          format="pdf"
          onPress={onButtonPress}
        />
      )}
      <VSpacer size={16} />
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
      <VSpacer size={16} />
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
      <VSpacer size={16} />
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
    </View>
  </DSComponentViewerBox>
);

const renderModulePaymentNotice = () => (
  <DSComponentViewerBox name="ModulePaymentNotice">
    <View>
      <ModulePaymentNotice
        title="Codice avviso"
        subtitle="9999 9999 9999 9999 99"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        isLoading={true}
        onPress={onButtonPress}
      />
      <VSpacer size={16} />
      <ModulePaymentNotice
        title="Codice avviso"
        subtitle="9999 9999 9999 9999 99"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        onPress={onButtonPress}
      />
      <VSpacer size={16} />

      {noticeStatusArray.map(
        (noticeStatus: PaymentNoticeStatusWithoutDefault) => (
          <React.Fragment key={`paymentNotice-${noticeStatus}`}>
            <ModulePaymentNotice
              title="Codice avviso"
              subtitle="9999 9999 9999 9999 99"
              paymentNoticeStatus={noticeStatus}
              badgeText={getBadgeTextByPaymentNoticeStatus(noticeStatus)}
              onPress={onButtonPress}
            />
            <VSpacer size={16} />
          </React.Fragment>
        )
      )}

      <ModulePaymentNotice
        subtitle="TARI 2023 - Rata 01"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        onPress={onButtonPress}
      />
    </View>
  </DSComponentViewerBox>
);

const renderModuleCheckout = () => (
  <>
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
  </>
);

const renderButtonExtendedOutline = () => (
  <DSComponentViewerBox name="ButtonExtendedOutline (using Pressable API)">
    <View>
      <ButtonExtendedOutline
        label={"Label name"}
        description={"This is a description of the element"}
        onPress={() => {
          alert("Action triggered");
        }}
      />
    </View>
    <VSpacer size={16} />
    <View>
      <ButtonExtendedOutline
        icon="chevronRightListItem"
        label={"Label only"}
        onPress={() => {
          alert("Action triggered");
        }}
      />
    </View>
  </DSComponentViewerBox>
);

const mockIDPProviderItem = {
  id: "posteid",
  name: "Poste ID",
  logo: "",
  localLogo: require("../../../../img/spid-idp-posteid.png"),
  profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
};

const renderModuleIDP = () => (
  <>
    <DSComponentViewerBox name="ModuleIDP, default variant">
      <View>
        <ModuleIDP
          name={mockIDPProviderItem.name}
          logo={mockIDPProviderItem.logo as ImageSourcePropType}
          localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
          onPress={onButtonPress}
          testID={`idp-${mockIDPProviderItem.id}-button`}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleIDP, loose spacing (saved) variant">
      <View>
        <ModuleIDP
          withLooseSpacing
          name={mockIDPProviderItem.name}
          logo={mockIDPProviderItem.logo as ImageSourcePropType}
          localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
          onPress={onButtonPress}
          testID={`idp-${mockIDPProviderItem.id}-button`}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleIDP, default variant, stress test">
      <View>
        <ModuleIDP
          name={"This is a very loooooong IDP provider name"}
          logo={mockIDPProviderItem.logo as ImageSourcePropType}
          localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
          onPress={onButtonPress}
          testID={`idp-${mockIDPProviderItem.id}-button`}
        />
      </View>
    </DSComponentViewerBox>
  </>
);

const renderModuleCredential = () => (
  <>
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
    <DSComponentViewerBox name="ModuleCredential, loading">
      <View>
        <ModuleCredential isLoading={true} />
      </View>
    </DSComponentViewerBox>
  </>
);

const renderModuleNavigation = () => (
  <>
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
    <DSComponentViewerBox name="ModuleNavigation, loading">
      <ModuleNavigation isLoading={true} />
    </DSComponentViewerBox>
  </>
);
