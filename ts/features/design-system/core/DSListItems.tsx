import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as React from "react";

import {
  Divider,
  H4,
  Icon,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  ListItemNav,
  ListItemNavAlert,
  ListItemTransaction,
  ListItemTransactionLogo,
  ListItemTransactionStatusWithBadge,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Alert } from "react-native";

import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

import { ProductCategoryEnum } from "../../../../definitions/cgn/merchants/ProductCategory";
import CgnMerchantDiscountItem from "../../bonus/cgn/components/merchants/CgnMerchantsDiscountItem";
import { getBadgeTextByTransactionStatus } from "../../payments/common/utils";
import { BankPreviewItem } from "../../wallet/onboarding/bancomat/components/BankPreviewItem";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const onCopyButtonPress = () => {
  Alert.alert("Copied!", "Value copied");
};

const sectionTitleMargin = 16;
const sectionMargin = 48;
const componentMargin = 32;

export const DSListItems = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title="List Items">
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ListItemNav</H4>
          {renderListItemNav()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ListItemInfoCopy</H4>
          {renderListItemInfoCopy()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ListItemInfo</H4>
          {renderListItemInfo()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ListItemHeader</H4>
          {renderListItemHeader()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ListItemAction</H4>
          {renderListItemAction()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ListItemTransaction</H4>
          {renderListItemTransaction()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Specific</H4>
          <VStack space={24}>
            <DSComponentViewerBox name="BankPreviewItem -- using PressableListItemBase">
              <BankPreviewItem
                onPress={onButtonPress}
                bank={{
                  abi: "03069",
                  logoUrl:
                    "https://assets.cdn.io.pagopa.it/logos/abi/03069.png",
                  name: "Intesa Sanpaolo"
                }}
              />
            </DSComponentViewerBox>
            <DSComponentViewerBox name="CgnMerchantDiscountItem">
              <CgnMerchantDiscountItem
                discount={{
                  name: "Small Rubber Chips" as NonEmptyString,
                  id: "28201" as NonEmptyString,
                  description: undefined,
                  discount: 25,
                  discountUrl: "https://localhost",
                  endDate: new Date(),
                  isNew: false,
                  productCategories: [
                    ProductCategoryEnum.cultureAndEntertainment
                  ],
                  startDate: new Date()
                }}
                operatorName={"Operator name"}
                merchantType={undefined}
              />
            </DSComponentViewerBox>
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderListItemNav = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemNav">
      <ListItemNav value={"Value"} onPress={onButtonPress} />
      <Divider />
      <ListItemNav
        value={"Value"}
        description="Description"
        onPress={onButtonPress}
      />
      <Divider />
      <ListItemNav
        value="A looong looooong looooooooong looooooooooong title"
        description="Description"
        onPress={onButtonPress}
      />
      <Divider />
      <ListItemNav value={"Value"} icon="gallery" onPress={onButtonPress} />
      <Divider />
      <ListItemNav
        value={"Value"}
        description="Description"
        icon="gallery"
        onPress={onButtonPress}
      />
      <Divider />
      <ListItemNav
        value={"Value"}
        description="This is a list item nav with badge"
        onPress={onButtonPress}
        topElement={{
          badgeProps: {
            text: "Novità",
            variant: "blue"
          }
        }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemNav, without chevron">
      <ListItemNav
        value={"Value"}
        description="This is a list item nav without chevron icon"
        onPress={onButtonPress}
        hideChevron
      />
      <Divider />
      <ListItemNav
        value={"Value"}
        description="This is a list item nav with badge without chevron"
        onPress={onButtonPress}
        topElement={{
          badgeProps: {
            text: "Novità",
            variant: "blue"
          }
        }}
        hideChevron
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemNavAlert">
      <ListItemNavAlert value={"Value"} onPress={onButtonPress} />
      <Divider />
      <ListItemNavAlert
        value={"Value"}
        description="Description"
        onPress={onButtonPress}
      />
      <Divider />
      <ListItemNavAlert withoutIcon value={"Value"} onPress={onButtonPress} />
      <Divider />
      <ListItemNavAlert
        withoutIcon
        value={"Value"}
        description="Description"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderListItemInfoCopy = () => (
  <DSComponentViewerBox name="ListItemInfoCopy">
    <ListItemInfoCopy
      label={"Label"}
      value="Value"
      onPress={onCopyButtonPress}
    />
    <Divider />
    <ListItemInfoCopy
      label={"Codice fiscale"}
      value="01199250158"
      onPress={onCopyButtonPress}
      icon="institution"
    />
    <Divider />
    <ListItemInfoCopy
      label={"Carta di credito"}
      value="4975 3013 5042 7899"
      onPress={onCopyButtonPress}
      icon="creditCard"
    />
    <Divider />
    <ListItemInfoCopy
      label={"Indirizzo"}
      value={`P.za Colonna, 370\n00186 Roma (RM)`}
      onPress={onCopyButtonPress}
    />
  </DSComponentViewerBox>
);

const renderListItemAction = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemAction · Primary variant">
      <ListItemAction
        variant="primary"
        label={"Link interno oppure link ad una pagina esterna"}
        onPress={onButtonPress}
      />
      <ListItemAction
        variant="primary"
        icon="website"
        label={"Link interno oppure link ad una pagina esterna"}
        onPress={onButtonPress}
      />
      <ListItemAction
        variant="primary"
        icon="device"
        label={"Scarica l'app"}
        onPress={onButtonPress}
      />
      <ListItemAction
        variant="primary"
        icon="security"
        label={"Informativa sulla privacy"}
        onPress={onButtonPress}
      />
      <ListItemAction
        variant="primary"
        icon="chat"
        label={"Richiedi assistenza"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemAction · Danger variant">
      <ListItemAction
        variant="danger"
        label={"Danger action"}
        onPress={onButtonPress}
      />
      <ListItemAction
        variant="danger"
        icon="trashcan"
        label={"Elimina"}
        onPress={onButtonPress}
      />
      <ListItemAction
        variant="danger"
        icon="logout"
        label={"Esci da IO"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderListItemInfo = () => (
  <DSComponentViewerBox name="ListItemInfo">
    <ListItemInfo label="Label" value={"Value"} />
    <Divider />
    <ListItemInfo
      label="Label"
      value="A looong looooong looooooooong looooooooooong title"
    />
    <Divider />
    <ListItemInfo
      icon="creditCard"
      label="Label"
      value="A looong looooong looooooooong looooooooooong title"
      endElement={{
        type: "buttonLink",
        componentProps: {
          label: "Modifica",
          onPress: onButtonPress,
          accessibilityLabel: ""
        }
      }}
    />
    <Divider />
    <ListItemInfo
      icon="psp"
      label="Label"
      value="A looong looooong looooooooong looooooooooong title"
      endElement={{
        type: "iconButton",
        componentProps: {
          icon: "info",
          onPress: onButtonPress,
          accessibilityLabel: ""
        }
      }}
    />
    <Divider />
    <ListItemInfo
      icon="psp"
      label="Label"
      value="A looong looooong looooooooong looooooooooong title"
      endElement={{
        type: "badge",
        componentProps: {
          text: "pagato",
          variant: "success"
        }
      }}
    />
    <Divider />
    <ListItemInfo label="Label" value={"Value"} icon="gallery" />
  </DSComponentViewerBox>
);

/* LIST ITEM HEADER */

const renderListItemHeader = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemHeader, without icon">
      <ListItemHeader label="Label" />
      <ListItemHeader
        label="Label"
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: "Modifica",
            accessibilityLabel: "Modifica",
            onPress: onButtonPress
          }
        }}
      />
      <ListItemHeader
        label="Label"
        endElement={{
          type: "iconButton",
          componentProps: {
            icon: "info",
            accessibilityLabel: "info",
            onPress: onButtonPress
          }
        }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemHeader, with icon">
      <ListItemHeader label="Label" iconName="gallery" />
      <ListItemHeader
        iconName="creditCard"
        label="Label"
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: "Modifica",
            accessibilityLabel: "Modifica",
            onPress: onButtonPress
          }
        }}
      />
      <ListItemHeader
        iconName="psp"
        label="Label"
        endElement={{
          type: "iconButton",
          componentProps: {
            icon: "info",
            accessibilityLabel: "info",
            onPress: onButtonPress
          }
        }}
      />

      <ListItemHeader
        iconName="psp"
        label="Label"
        endElement={{
          type: "badge",
          componentProps: {
            text: "Pagato",
            variant: "success"
          }
        }}
      />
    </DSComponentViewerBox>
  </VStack>
);

/* LIST ITEM TRANSACTION */

/* Mock assets */
const cdnPath = "https://assets.cdn.io.pagopa.it/logos/organizations/";
const organizationLogoURI = {
  imageSource: `${cdnPath}82003830161.png`,
  name: "Comune di Milano"
};

type mockTransactionStatusData = {
  status: ListItemTransactionStatusWithBadge;
  asset: ListItemTransactionLogo;
};

const transactionStatusArray: Array<mockTransactionStatusData> = [
  {
    status: "failure",
    asset: "amex"
  },
  {
    status: "pending",
    asset: { uri: organizationLogoURI.imageSource }
  },
  {
    status: "cancelled",
    asset: "unionPay"
  },
  {
    status: "reversal",
    asset: "applePay"
  }
];

const renderListItemTransaction = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemTransaction, loading variant">
      <ListItemTransaction
        title="Title"
        subtitle="subtitle"
        transactionStatus="success"
        transactionAmount="€ 1.000,00"
        isLoading={true}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, various states">
      {transactionStatusArray.map(
        ({ status, asset }: mockTransactionStatusData, i) => (
          <React.Fragment key={`transactionStatus-${status}`}>
            <ListItemTransaction
              title="Title"
              subtitle="subtitle"
              paymentLogoIcon={asset}
              transactionStatus={status}
              badgeText={getBadgeTextByTransactionStatus(status)}
              onPress={onButtonPress}
            />
            {i < transactionStatusArray.length - 1 && <Divider />}
          </React.Fragment>
        )
      )}
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, with amount">
      <ListItemTransaction
        title="Title"
        subtitle="subtitle"
        transactionStatus="success"
        transactionAmount="€ 1.000,00"
        onPress={onButtonPress}
      />

      <Divider />

      <ListItemTransaction
        title="Title"
        subtitle="subtitle"
        transactionStatus="success"
        transactionAmount="€ 1.000,00"
        paymentLogoIcon={"mastercard"}
        onPress={onButtonPress}
      />

      <Divider />

      <ListItemTransaction
        title="Title"
        subtitle="subtitle"
        transactionStatus="success"
        transactionAmount="€ 1.000,00"
        hasChevronRight={true}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, refunded">
      <ListItemTransaction
        title="Refunded transaction"
        subtitle="This one has a custom icon and transaction amount with a green color"
        transactionStatus="refunded"
        paymentLogoIcon={<Icon name="refund" color="bluegrey" />}
        transactionAmount="€ 100"
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, clickable and not clickable">
      <ListItemTransaction
        title="This one is not clickable"
        subtitle="subtitle"
        transactionStatus="failure"
        badgeText={getBadgeTextByTransactionStatus("failure")}
        paymentLogoIcon={"postepay"}
      />

      <Divider />

      <ListItemTransaction
        title="This one is clickable but has a very long title"
        subtitle="very long subtitle, the kind of subtitle you'd never wish to see in the app, like a very long one"
        transactionAmount="€ 1.000,00"
        paymentLogoIcon={"postepay"}
        onPress={onButtonPress}
        transactionStatus="success"
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, custom icon">
      <ListItemTransaction
        title="Custom icon"
        subtitle="This one has a custom icon on the left"
        transactionStatus="success"
        paymentLogoIcon={<Icon name="notice" color="red" />}
        transactionAmount=""
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
  </VStack>
);
