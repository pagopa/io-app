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
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Alert } from "react-native";

import { ProductCategoryEnum } from "../../../../definitions/cgn/merchants/ProductCategory";
import CgnLogo from "../../../../img/bonus/cgn/cgn_logo.png";
import { ModuleCgnDiscount } from "../../bonus/cgn/components/merchants/ModuleCgnDiscount";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

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
        format="pdf"
        isLoading={true}
        onPress={onButtonPress}
        title="Nome del documento.pdf"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, default variant">
      <VStack space={componentInnerMargin}>
        <ModuleAttachment
          format="pdf"
          onPress={onButtonPress}
          title="Nome del documento.pdf"
        />
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, stress test">
      <ModuleAttachment
        format="pdf"
        onPress={onButtonPress}
        title="This is a very loooooooooooooooooooooong title"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, fetching">
      <ModuleAttachment
        format="pdf"
        isFetching={true}
        onPress={onButtonPress}
        title="Nome del documento.pdf"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleAttachment, disabled">
      <ModuleAttachment
        disabled={true}
        format="pdf"
        onPress={onButtonPress}
        title="Nome del documento.pdf"
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderModulePaymentNotice = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModulePaymentNotice, loading">
      <ModulePaymentNotice
        isLoading={true}
        onPress={onButtonPress}
        paymentNotice={{
          status: "default",
          amount: "1.000,00 €",
          amountAccessibilityLabel: "1000 euro"
        }}
        subtitle="9999 9999 9999 9999 99"
        title="Codice avviso"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModulePaymentNotice, default with amount">
      <ModulePaymentNotice
        onPress={onButtonPress}
        paymentNotice={{
          status: "default",
          amount: "1.000,00 €",
          amountAccessibilityLabel: "1000 euro"
        }}
        subtitle="9999 9999 9999 9999 99"
        title="Codice avviso"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModulePaymentNotice, various statuses">
      <VStack space={componentInnerMargin}>
        {noticeStatusArray.map(
          (noticeStatus: PaymentNoticeStatusWithoutDefault) => (
            <ModulePaymentNotice
              badgeText={getBadgeTextByPaymentNoticeStatus(noticeStatus)}
              key={`paymentNotice-${noticeStatus}`}
              onPress={onButtonPress}
              paymentNotice={{
                status: noticeStatus,
                amount: "1.000,00 €",
                amountAccessibilityLabel: "1000 euro"
              }}
              subtitle="9999 9999 9999 9999 99"
              title="Codice avviso"
            />
          )
        )}
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModulePaymentNotice, default, without title">
      <ModulePaymentNotice
        onPress={onButtonPress}
        paymentNotice={{
          status: "default",
          amount: "1.000,00 €",
          amountAccessibilityLabel: "1000 euro"
        }}
        subtitle="TARI 2023 - Rata 01"
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
        ctaText="Modifica"
        onPress={onButtonPress}
        paymentLogo="amex"
        subtitle="arien_c********@**hoo.it"
        title="Amex"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, default, with image">
      <ModuleCheckout
        ctaText="Modifica"
        image={{
          uri: "https://assets.cdn.platform.pagopa.it/apm/bancomatpay.png"
        }}
        onPress={onButtonPress}
        title="Paga con Bancomat PAY"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, no description">
      <ModuleCheckout
        ctaText="Modifica"
        onPress={onButtonPress}
        paymentLogo="amex"
        title="Amex"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, no icon">
      <ModuleCheckout
        ctaText="Modifica"
        onPress={onButtonPress}
        subtitle="Piú o meno"
        title="3,50 $"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, no CTA, with image">
      <ModuleCheckout
        image={{
          uri: "https://assets.cdn.platform.pagopa.it/apm/bancomatpay.png"
        }}
        onPress={onButtonPress}
        subtitle="Piú o meno"
        title="3,50 $"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCheckout, no CTA">
      <ModuleCheckout
        onPress={onButtonPress}
        subtitle="Piú o meno"
        title="3,50 $"
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderModuleSummary = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ModuleSummary, default variant">
      <ModuleSummary
        description={"This is a description of the element"}
        label={"Label name"}
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
        description={"This is a very looooooong description of the element"}
        label={"A very looong loooooooong looooooooooooooong label"}
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
        discount={{ ...mockModuleCgnDiscountData }}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="CgnMerchantDiscountItem, with discount indicator">
      <ModuleCgnDiscount
        discount={{
          ...mockModuleCgnDiscountData,
          discount: 25
        }}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="CgnMerchantDiscountItem, new variant">
      <ModuleCgnDiscount
        discount={{
          ...mockModuleCgnDiscountData,
          isNew: true,
          discount: 25,
          productCategories: [
            ProductCategoryEnum.cultureAndEntertainment,
            ProductCategoryEnum.health
          ]
        }}
        onPress={onButtonPress}
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
          logo={{
            light: posteItem.logo.light,
            dark: posteItem.logo?.dark
          }}
          name={posteItem.name}
          onPress={onButtonPress}
          testID={`idp-${posteItem.id}-button`}
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ModuleIDP, loose spacing (saved) variant">
        <ModuleIDP
          logo={{
            light: posteItem.logo.light
          }}
          name={posteItem.name}
          onPress={onButtonPress}
          testID={`idp-${posteItem.id}-button`}
          withLooseSpacing
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ModuleIDP, both color modes supported">
        <ModuleIDP
          logo={{
            light: intesiGroupItem.logo.light,
            dark: intesiGroupItem.logo.dark
          }}
          name={intesiGroupItem.name}
          onPress={onButtonPress}
          testID={`idp-${intesiGroupItem.id}-button`}
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ModuleIDP, default variant, stress test">
        <ModuleIDP
          logo={{
            light: posteItem.logo.light
          }}
          name={"This is a very loooooong IDP provider name"}
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
        badge={{
          text: "predefinita",
          variant: "highlight"
        }}
        icon="fingerprint"
        label="Identità digitale"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCredential, with long label">
      <ModuleCredential
        badge={{
          text: "predefinita",
          variant: "highlight"
        }}
        icon="fingerprint"
        label="This is a very long long long label"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCredential, with image asset">
      <ModuleCredential
        badge={{
          text: "già presente",
          variant: "success"
        }}
        image={CgnLogo}
        label="Carta Giovani Nazionale"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleCredential, fetching">
      <ModuleCredential
        icon="fingerprint"
        isFetching={true}
        label="Identità digitale"
        onPress={onButtonPress}
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
        onPress={onButtonPress}
        subtitle="Usa credenziali e app (o SMS)"
        title="SPID"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleNavigation, with Image">
      <ModuleNavigation
        image={CgnLogo}
        onPress={onButtonPress}
        subtitle="Usa credenziali e app (o SMS)"
        title="Carta Giovani Nazionale"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleNavigation, with Badge">
      <ModuleNavigation
        badge={{
          text: "In arrivo",
          variant: "default",
          outline: true
        }}
        icon="spid"
        onPress={onButtonPress}
        subtitle="Usa credenziali e app (o SMS)"
        title="SPID"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleNavigation, with Badge, stress test">
      <ModuleNavigation
        badge={{
          text: "In arrivo",
          variant: "default",
          outline: true
        }}
        icon="spid"
        onPress={onButtonPress}
        subtitle="Usa credenziali e app (o SMS), ma anche qui il testo è molto lungo"
        title="Testo relativo allo SPID davvero molto lungo"
      />
    </DSComponentViewerBox>
  </VStack>
);
