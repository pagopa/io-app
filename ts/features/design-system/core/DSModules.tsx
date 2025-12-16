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
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Alert } from "react-native";
import { ProductCategoryEnum } from "../../../../definitions/cgn/merchants/ProductCategory";
import CgnLogo from "../../../../img/bonus/cgn/cgn_logo.png";
import { ModuleCgnDiscount } from "../../bonus/cgn/components/merchants/ModuleCgnDiscount";
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
  const theme = useIOTheme();
  return (
    <DesignSystemScreen title="Modules">
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModuleAttachment</H4>
          {renderModuleAttachment()}
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
          <H4 color={theme["textHeading-default"]}>ModuleCgnDiscount</H4>
          {renderModuleCgnDiscount()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ModuleIDP</H4>
          {renderModuleIDP()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderModuleAttachment = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModuleAttachment, loading">
      <ModuleAttachment
        title="Nome del documento.pdf"
        format="pdf"
        isLoading={true}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, default variant">
      <VStack space={componentInnerMargin}>
        <ModuleAttachment
          title="Nome del documento.pdf"
          format="pdf"
          onPress={onButtonPress}
        />
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, stress test">
      <ModuleAttachment
        title="This is a very loooooooooooooooooooooong title"
        format="pdf"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, fetching">
      <ModuleAttachment
        title="Nome del documento.pdf"
        format="pdf"
        isFetching={true}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, disabled">
      <ModuleAttachment
        title="Nome del documento.pdf"
        format="pdf"
        disabled={true}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderModulePaymentNotice = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModulePaymentNotice, loading">
      <ModulePaymentNotice
        title="Codice avviso"
        subtitle="9999 9999 9999 9999 99"
        paymentNotice={{
          status: "default",
          amount: "1.000,00 €",
          amountAccessibilityLabel: "1000 euro"
        }}
        isLoading={true}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModulePaymentNotice, default with amount">
      <ModulePaymentNotice
        title="Codice avviso"
        subtitle="9999 9999 9999 9999 99"
        paymentNotice={{
          status: "default",
          amount: "1.000,00 €",
          amountAccessibilityLabel: "1000 euro"
        }}
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
              paymentNotice={{
                status: noticeStatus,
                amount: "1.000,00 €",
                amountAccessibilityLabel: "1000 euro"
              }}
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
        paymentNotice={{
          status: "default",
          amount: "1.000,00 €",
          amountAccessibilityLabel: "1000 euro"
        }}
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

const mockModuleCgnDiscountData = {
  name: "Small Rubber Chips" as NonEmptyString,
  id: "28201" as NonEmptyString,
  description: undefined,
  discount: undefined,
  discountUrl: "https://localhost",
  endDate: new Date(),
  isNew: false,
  productCategories: [ProductCategoryEnum.cultureAndEntertainment],
  startDate: new Date()
};

const renderModuleCgnDiscount = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="CgnMerchantDiscountItem, basic configuration">
      <ModuleCgnDiscount
        onPress={onButtonPress}
        discount={{ ...mockModuleCgnDiscountData }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="CgnMerchantDiscountItem, with discount indicator">
      <ModuleCgnDiscount
        onPress={onButtonPress}
        discount={{
          ...mockModuleCgnDiscountData,
          discount: 25
        }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="CgnMerchantDiscountItem, new variant">
      <ModuleCgnDiscount
        onPress={onButtonPress}
        discount={{
          ...mockModuleCgnDiscountData,
          isNew: true,
          discount: 25,
          productCategories: [
            ProductCategoryEnum.cultureAndEntertainment,
            ProductCategoryEnum.health
          ]
        }}
      />
    </DSComponentViewerBox>
  </VStack>
);

const mockIDPProviderItems = {
  poste: {
    id: "posteid",
    name: "Poste ID",
    logo: {
      light: require("../../../../img/spid-idp-posteid.png"),
      dark: undefined
    },
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  intesiGroup: {
    id: "intesiGroup",
    name: "Intesi Group",
    logo: {
      light: require("../../../../img/spid-idp-intesigroupspid.png"),
      dark: require("../../../../img/spid-idp-intesigroupspid-dark.png")
    }
  }
};

const renderModuleIDP = () => {
  const { poste: posteItem, intesiGroup: intesiGroupItem } =
    mockIDPProviderItems;

  return (
    <VStack space={componentMargin}>
      <DSComponentViewerBox name="ModuleIDP, default variant">
        <ModuleIDP
          name={posteItem.name}
          logo={{
            light: posteItem.logo.light,
            dark: posteItem.logo?.dark
          }}
          onPress={onButtonPress}
          testID={`idp-${posteItem.id}-button`}
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ModuleIDP, loose spacing (saved) variant">
        <ModuleIDP
          withLooseSpacing
          name={posteItem.name}
          logo={{
            light: posteItem.logo.light
          }}
          onPress={onButtonPress}
          testID={`idp-${posteItem.id}-button`}
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ModuleIDP, both color modes supported">
        <ModuleIDP
          name={intesiGroupItem.name}
          logo={{
            light: intesiGroupItem.logo.light,
            dark: intesiGroupItem.logo.dark
          }}
          onPress={onButtonPress}
          testID={`idp-${intesiGroupItem.id}-button`}
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ModuleIDP, default variant, stress test">
        <ModuleIDP
          name={"This is a very loooooong IDP provider name"}
          logo={{
            light: posteItem.logo.light
          }}
          onPress={onButtonPress}
          testID={`idp-${posteItem.id}-button`}
        />
      </DSComponentViewerBox>
    </VStack>
  );
};

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
          variant: "highlight"
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
          variant: "highlight"
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
          variant: "default",
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
          variant: "default",
          outline: true
        }}
      />
    </DSComponentViewerBox>
  </VStack>
);
