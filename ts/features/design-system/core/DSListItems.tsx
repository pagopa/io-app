import {
  Badge,
  Divider,
  H4,
  H6,
  Icon,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  ListItemNav,
  ListItemNavAlert,
  ListItemTransaction,
  ListItemTransactionLogo,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Fragment } from "react";
import { Alert, View } from "react-native";

import { DEFAULT_CONTENT_REPO_URL } from "../../../config";
import {
  ListItemMessage,
  ListItemMessageProps
} from "../../messages/components/Home/DS/ListItemMessage";
import { ListItemMessageSkeleton } from "../../messages/components/Home/DS/ListItemMessageSkeleton";
import { getBadgePropsByTransactionStatus } from "../../payments/common/utils";
import { ListItemTransactionStatus } from "../../payments/common/utils/types";
import { ListItemSearchInstitution } from "../../services/common/components/ListItemSearchInstitution";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const onCopyButtonPress = () => {
  Alert.alert("Copied!", "Value copied");
};

const cdnPath = `${DEFAULT_CONTENT_REPO_URL}/logos/organizations/`;

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
          <H4 color={theme["textHeading-default"]}>ListItemMessage</H4>
          {renderListItemMessage()}
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
          <H4 color={theme["textHeading-default"]}>
            ListItemSearchInstitution
          </H4>
          {renderListItemSearchInstitution()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ListItemTransaction</H4>
          {renderListItemTransaction()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderListItemNav = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemNav">
      <ListItemNav onPress={onButtonPress} value={"Value"} />
      <Divider />
      <ListItemNav
        description="Description"
        onPress={onButtonPress}
        value={"Value"}
      />
      <Divider />
      <ListItemNav
        description="Description"
        onPress={onButtonPress}
        value="A looong looooong looooooooooong loooooooooooooong title"
      />
      <Divider />
      <ListItemNav
        icon={"categLearning"}
        onPress={onButtonPress}
        value={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <H6>Nome del valoreeeeee eeeeeeeeee</H6>
            <Badge text={"3"} variant="cgn" />
          </View>
        }
      />
      <Divider />
      <ListItemNav
        avatarProps={{
          logoUri: {
            uri: `${DEFAULT_CONTENT_REPO_URL}/logos/organizations/82003830161.png`
          }
        }}
        description="Description"
        onPress={onButtonPress}
        value={"Value"}
      />
      <Divider />
      <ListItemNav icon="gallery" onPress={onButtonPress} value={"Value"} />
      <Divider />
      <ListItemNav
        description="Description"
        icon="gallery"
        onPress={onButtonPress}
        value={"Value"}
      />
      <Divider />
      <ListItemNav
        description="This is a list item nav with badge"
        onPress={onButtonPress}
        topElement={{
          badgeProps: {
            text: "Novità",
            variant: "default"
          }
        }}
        value={"Value"}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemNav, without chevron">
      <ListItemNav
        description="This is a list item nav without chevron icon"
        hideChevron
        onPress={onButtonPress}
        value={"Value"}
      />
      <Divider />
      <ListItemNav
        description="This is a list item nav with badge without chevron"
        hideChevron
        onPress={onButtonPress}
        topElement={{
          badgeProps: {
            text: "Novità",
            variant: "default"
          }
        }}
        value={"Value"}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemNav, with image chevron">
      <ListItemNav
        avatarProps={{ logoUri: { uri: `${cdnPath}643280639.png` } }}
        onPress={onButtonPress}
        value={"Comune di Ischia"}
      />
      <Divider />
      <ListItemNav
        avatarProps={{ logoUri: { uri: `${cdnPath}643280639.png` } }}
        description="This is a description"
        onPress={onButtonPress}
        value={"Comune di Ischia"}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemNavAlert">
      <ListItemNavAlert onPress={onButtonPress} value={"Value"} />
      <Divider />
      <ListItemNavAlert
        description="Description"
        onPress={onButtonPress}
        value={"Value"}
      />
      <Divider />
      <ListItemNavAlert onPress={onButtonPress} value={"Value"} withoutIcon />
      <Divider />
      <ListItemNavAlert
        description="Description"
        onPress={onButtonPress}
        value={"Value"}
        withoutIcon
      />
    </DSComponentViewerBox>
  </VStack>
);

const listItemMessageSample: ListItemMessageProps = {
  formattedDate: "09 dic",
  isRead: false,
  messageTitle: "Il tuo appuntamento",
  organizationName: "Ministero dell'Interno",
  serviceName: "Carta d'Identità Elettronica",
  accessibilityLabel: "Leggi il messaggio inviato dal Ministero dell'Interno",
  serviceLogos: [{ uri: `${cdnPath}80215430580.png` }],
  onLongPress: () => {
    Alert.alert("Long press");
  },
  onPress: () => {
    Alert.alert("Pressed");
  }
};

const renderListItemMessage = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemMessageSkeleton">
      <ListItemMessageSkeleton accessibilityLabel="Loading message…" />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemMessage, read/unread">
      <ListItemMessage {...listItemMessageSample} isRead={false} />
      <Divider />
      <ListItemMessage {...listItemMessageSample} isRead={true} />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemMessage, selected">
      <ListItemMessage
        {...listItemMessageSample}
        isRead={true}
        selected={true}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemMessage, with badge">
      <ListItemMessage
        {...listItemMessageSample}
        isRead={true}
        messageTitle="Hai un nuovo avviso di pagamento"
        serviceName="Richiesta di cittadinanza"
        tag={{ variant: "success", text: I18n.t("messages.badge.paid") }}
      />
      <Divider />
      <ListItemMessage
        {...listItemMessageSample}
        isRead={true}
        messageTitle="Hai acquisito la cittadinanza italiana"
        serviceName="Richiesta di cittadinanza"
        tag={{
          variant: "legalMessage",
          text: I18n.t("features.pn.details.badge.legalValue")
        }}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemMessage, avatar undefined & double">
      <ListItemMessage
        {...listItemMessageSample}
        isRead={true}
        messageTitle="Hai un nuovo avviso di pagamento"
        organizationName="Comune di Isolabona"
        serviceLogos={undefined}
        serviceName="Servizi cimiteriali"
      />
      <Divider />
      <ListItemMessage
        {...listItemMessageSample}
        avatarDouble={true}
        isRead={true}
        messageTitle="Hai un pagamento in scadenza"
        organizationName={"Comune di Milano"}
        serviceLogos={[{ uri: `${cdnPath}1199250158.png` }]}
        serviceName="Tassa sui rifiuti (TARI)"
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemMessage, stress test">
      <ListItemMessage
        {...listItemMessageSample}
        isRead={true}
        messageTitle={
          "Titolo del messaggio scritto da una persona davvero prolissa"
        }
        organizationName={"Nome dell'ente molto molto molto lungo"}
        serviceLogos={[{ uri: `${cdnPath}5779711000.png` }]}
        serviceName="Nome del servizio mooolto lungo"
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderListItemInfoCopy = () => (
  <DSComponentViewerBox name="ListItemInfoCopy">
    <ListItemInfoCopy
      label={"Label"}
      onPress={onCopyButtonPress}
      value="Value"
    />
    <Divider />
    <ListItemInfoCopy
      icon="institution"
      label={"Codice fiscale"}
      onPress={onCopyButtonPress}
      value="01199250158"
    />
    <Divider />
    <ListItemInfoCopy
      icon="creditCard"
      label={"Carta di credito"}
      onPress={onCopyButtonPress}
      value="4975 3013 5042 7899"
    />
    <Divider />
    <ListItemInfoCopy
      label={"Indirizzo"}
      onPress={onCopyButtonPress}
      value={`P.za Colonna, 370\n00186 Roma (RM)`}
    />
  </DSComponentViewerBox>
);

const renderListItemAction = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemAction · Primary variant">
      <ListItemAction
        label={"Link interno oppure link ad una pagina esterna"}
        onPress={onButtonPress}
        variant="primary"
      />
      <ListItemAction
        icon="website"
        label={"Link interno oppure link ad una pagina esterna"}
        onPress={onButtonPress}
        variant="primary"
      />
      <ListItemAction
        icon="device"
        label={"Scarica l'app"}
        onPress={onButtonPress}
        variant="primary"
      />
      <ListItemAction
        icon="security"
        label={"Informativa sulla privacy"}
        onPress={onButtonPress}
        variant="primary"
      />
      <ListItemAction
        icon="chat"
        label={"Richiedi assistenza"}
        onPress={onButtonPress}
        variant="primary"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemAction · Danger variant">
      <ListItemAction
        label={"Danger action"}
        onPress={onButtonPress}
        variant="danger"
      />
      <ListItemAction
        icon="trashcan"
        label={"Elimina"}
        onPress={onButtonPress}
        variant="danger"
      />
      <ListItemAction
        icon="logout"
        label={"Esci da IO"}
        onPress={onButtonPress}
        variant="danger"
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
      endElement={{
        type: "buttonLink",
        componentProps: {
          label: "Modifica",
          onPress: onButtonPress,
          accessibilityLabel: ""
        }
      }}
      icon="creditCard"
      label="Label"
      value="A looong looooong looooooooong looooooooooong title"
    />
    <Divider />
    <ListItemInfo
      endElement={{
        type: "iconButton",
        componentProps: {
          icon: "info",
          onPress: onButtonPress,
          accessibilityLabel: ""
        }
      }}
      icon="psp"
      label="Label"
      value="A looong looooong looooooooong looooooooooong title"
    />
    <Divider />
    <ListItemInfo
      endElement={{
        type: "badge",
        componentProps: {
          text: "pagato",
          variant: "success"
        }
      }}
      icon="psp"
      label="Label"
      value="A looong looooong looooooooong looooooooooong title"
    />
    <Divider />
    <ListItemInfo icon="gallery" label="Label" value={"Value"} />
    <ListItemInfo
      icon="hourglass"
      topElement={{
        type: "badge",
        componentProps: {
          text: "Verifica in corso",
          variant: "warning"
        }
      }}
      value="With badge"
    />
    <ListItemInfo
      icon="gallery"
      label="Label"
      topElement={{
        type: "badge",
        componentProps: {
          text: "Pagato",
          variant: "success"
        }
      }}
      value="With badge & label"
    />
  </DSComponentViewerBox>
);

/* LIST ITEM HEADER */

const renderListItemHeader = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemHeader, without icon">
      <ListItemHeader label="Label" />
      <ListItemHeader
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: "Modifica",
            accessibilityLabel: "Modifica",
            onPress: onButtonPress
          }
        }}
        label="Label"
      />
      <ListItemHeader
        endElement={{
          type: "iconButton",
          componentProps: {
            icon: "info",
            accessibilityLabel: "info",
            onPress: onButtonPress
          }
        }}
        label="Label"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemHeader, with icon">
      <ListItemHeader iconName="gallery" label="Label" />
      <ListItemHeader
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: "Modifica",
            accessibilityLabel: "Modifica",
            onPress: onButtonPress
          }
        }}
        iconName="creditCard"
        label="Label"
      />
      <ListItemHeader
        endElement={{
          type: "iconButton",
          componentProps: {
            icon: "info",
            accessibilityLabel: "info",
            onPress: onButtonPress
          }
        }}
        iconName="psp"
        label="Label"
      />

      <ListItemHeader
        endElement={{
          type: "badge",
          componentProps: {
            text: "Pagato",
            variant: "success"
          }
        }}
        iconName="psp"
        label="Label"
      />
    </DSComponentViewerBox>
  </VStack>
);

/* LIST ITEM SEARCH INSTITUTION */

const renderListItemSearchInstitution = () => (
  <DSComponentViewerBox name="ListItemSearchInstitution">
    <ListItemSearchInstitution
      avatarProps={{ source: { uri: `${cdnPath}643280639.png` } }}
      numberOfLines={2}
      onPress={onButtonPress}
      value={"Comune di Ischia"}
    />
    <Divider />
    <ListItemSearchInstitution
      avatarProps={{ source: {} }}
      numberOfLines={2}
      onPress={onButtonPress}
      value={"Comune di Isolabona"}
    />
  </DSComponentViewerBox>
);

/* LIST ITEM TRANSACTION */

/* Mock assets */
const organizationLogoURI = {
  imageSource: `${cdnPath}82003830161.png`,
  name: "Comune di Milano"
};

type mockTransactionStatusData = {
  asset: ListItemTransactionLogo;
  status: ListItemTransactionStatus;
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
        isLoading={true}
        onPress={onButtonPress}
        subtitle="subtitle"
        title="Title"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, various states">
      {transactionStatusArray.map(
        ({ status, asset }: mockTransactionStatusData, i) => (
          <Fragment key={`transactionStatus-${status}`}>
            <ListItemTransaction
              onPress={onButtonPress}
              paymentLogoIcon={asset}
              subtitle="subtitle"
              title="Title"
              transaction={{
                badge: getBadgePropsByTransactionStatus(status)
              }}
            />
            {i < transactionStatusArray.length - 1 && <Divider />}
          </Fragment>
        )
      )}
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, with amount">
      <ListItemTransaction
        onPress={onButtonPress}
        subtitle="subtitle"
        title="Title"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
      />

      <Divider />

      <ListItemTransaction
        onPress={onButtonPress}
        paymentLogoIcon={"mastercard"}
        subtitle="subtitle"
        title="Title"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
      />

      <Divider />

      <ListItemTransaction
        onPress={onButtonPress}
        showChevron
        subtitle="subtitle"
        title="Title"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, refunded">
      <ListItemTransaction
        onPress={onButtonPress}
        paymentLogoIcon={<Icon name="refund" />}
        subtitle="This one has a custom icon and transaction amount with a green color"
        title="Refunded transaction"
        transaction={{
          badge: getBadgePropsByTransactionStatus("refunded")
        }}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, clickable and not clickable">
      <ListItemTransaction
        paymentLogoIcon={"postepay"}
        subtitle="subtitle"
        title="This one is not clickable"
        transaction={{
          badge: getBadgePropsByTransactionStatus("failure")
        }}
      />

      <Divider />

      <ListItemTransaction
        onPress={onButtonPress}
        paymentLogoIcon={"postepay"}
        subtitle="very long subtitle, the kind of subtitle you'd never wish to see in the app, like a very long one"
        title="This one is clickable but has a very long title"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, custom icon">
      <ListItemTransaction
        onPress={onButtonPress}
        paymentLogoIcon={<Icon color="error-500" name="notice" />}
        subtitle="This one has a custom icon on the left"
        title="Custom icon"
        transaction={{
          amount: "",
          amountAccessibilityLabel: ""
        }}
      />
    </DSComponentViewerBox>
  </VStack>
);
