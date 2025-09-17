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
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import { Alert, View } from "react-native";
import I18n from "i18next";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import {
  ListItemMessage,
  ListItemMessageProps
} from "../../messages/components/Home/DS/ListItemMessage";
import { ListItemMessageSkeleton } from "../../messages/components/Home/DS/ListItemMessageSkeleton";
import { getBadgePropsByTransactionStatus } from "../../payments/common/utils";
import { ListItemTransactionStatus } from "../../payments/common/utils/types";
import { ListItemSearchInstitution } from "../../services/common/components/ListItemSearchInstitution";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const onCopyButtonPress = () => {
  Alert.alert("Copied!", "Value copied");
};

const cdnPath = "https://assets.cdn.io.pagopa.it/logos/organizations/";

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
      <ListItemNav value={"Value"} onPress={onButtonPress} />
      <Divider />
      <ListItemNav
        value={"Value"}
        description="Description"
        onPress={onButtonPress}
      />
      <Divider />
      <ListItemNav
        value="A looong looooong looooooooooong loooooooooooooong title"
        description="Description"
        onPress={onButtonPress}
      />
      <Divider />
      <ListItemNav
        icon={"categLearning"}
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
        onPress={onButtonPress}
      />
      <Divider />
      <ListItemNav
        avatarProps={{
          logoUri: {
            uri: "https://assets.cdn.io.italia.it/logos/organizations/82003830161.png"
          }
        }}
        description="Description"
        onPress={onButtonPress}
        value={"Value"}
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
            variant: "default"
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
            variant: "default"
          }
        }}
        hideChevron
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemNav, with image chevron">
      <ListItemNav
        value={"Comune di Ischia"}
        avatarProps={{ logoUri: { uri: `${cdnPath}643280639.png` } }}
        onPress={onButtonPress}
      />
      <Divider />
      <ListItemNav
        value={"Comune di Ischia"}
        description="This is a description"
        avatarProps={{ logoUri: { uri: `${cdnPath}643280639.png` } }}
        onPress={onButtonPress}
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
        serviceName="Richiesta di cittadinanza"
        messageTitle="Hai un nuovo avviso di pagamento"
        tag={{ variant: "success", text: I18n.t("messages.badge.paid") }}
        isRead={true}
      />
      <Divider />
      <ListItemMessage
        {...listItemMessageSample}
        serviceName="Richiesta di cittadinanza"
        messageTitle="Hai acquisito la cittadinanza italiana"
        tag={{
          variant: "legalMessage",
          text: I18n.t("features.pn.details.badge.legalValue")
        }}
        isRead={true}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemMessage, avatar undefined & double">
      <ListItemMessage
        {...listItemMessageSample}
        organizationName="Comune di Isolabona"
        serviceName="Servizi cimiteriali"
        messageTitle="Hai un nuovo avviso di pagamento"
        serviceLogos={undefined}
        isRead={true}
      />
      <Divider />
      <ListItemMessage
        {...listItemMessageSample}
        avatarDouble={true}
        organizationName={"Comune di Milano"}
        serviceName="Tassa sui rifiuti (TARI)"
        messageTitle="Hai un pagamento in scadenza"
        serviceLogos={[{ uri: `${cdnPath}1199250158.png` }]}
        isRead={true}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemMessage, stress test">
      <ListItemMessage
        {...listItemMessageSample}
        organizationName={"Nome dell'ente molto molto molto lungo"}
        serviceName="Nome del servizio mooolto lungo"
        messageTitle={
          "Titolo del messaggio scritto da una persona davvero prolissa"
        }
        serviceLogos={[{ uri: `${cdnPath}5779711000.png` }]}
        isRead={true}
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
    <ListItemInfo
      topElement={{
        type: "badge",
        componentProps: {
          text: "Verifica in corso",
          variant: "warning"
        }
      }}
      value="With badge"
      icon="hourglass"
    />
    <ListItemInfo
      topElement={{
        type: "badge",
        componentProps: {
          text: "Pagato",
          variant: "success"
        }
      }}
      value="With badge & label"
      label="Label"
      icon="gallery"
    />
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

/* LIST ITEM SEARCH INSTITUTION */

const renderListItemSearchInstitution = () => (
  <DSComponentViewerBox name="ListItemSearchInstitution">
    <ListItemSearchInstitution
      value={"Comune di Ischia"}
      numberOfLines={2}
      onPress={onButtonPress}
      avatarProps={{ source: { uri: `${cdnPath}643280639.png` } }}
    />
    <Divider />
    <ListItemSearchInstitution
      value={"Comune di Isolabona"}
      numberOfLines={2}
      onPress={onButtonPress}
      avatarProps={{ source: {} }}
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
  status: ListItemTransactionStatus;
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
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
        isLoading={true}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, various states">
      {transactionStatusArray.map(
        ({ status, asset }: mockTransactionStatusData, i) => (
          <Fragment key={`transactionStatus-${status}`}>
            <ListItemTransaction
              title="Title"
              subtitle="subtitle"
              paymentLogoIcon={asset}
              transaction={{
                badge: getBadgePropsByTransactionStatus(status)
              }}
              onPress={onButtonPress}
            />
            {i < transactionStatusArray.length - 1 && <Divider />}
          </Fragment>
        )
      )}
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, with amount">
      <ListItemTransaction
        title="Title"
        subtitle="subtitle"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
        onPress={onButtonPress}
      />

      <Divider />

      <ListItemTransaction
        title="Title"
        subtitle="subtitle"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
        paymentLogoIcon={"mastercard"}
        onPress={onButtonPress}
      />

      <Divider />

      <ListItemTransaction
        title="Title"
        subtitle="subtitle"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
        showChevron
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, refunded">
      <ListItemTransaction
        title="Refunded transaction"
        subtitle="This one has a custom icon and transaction amount with a green color"
        transaction={{
          badge: getBadgePropsByTransactionStatus("refunded")
        }}
        paymentLogoIcon={<Icon name="refund" />}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, clickable and not clickable">
      <ListItemTransaction
        title="This one is not clickable"
        subtitle="subtitle"
        transaction={{
          badge: getBadgePropsByTransactionStatus("failure")
        }}
        paymentLogoIcon={"postepay"}
      />

      <Divider />

      <ListItemTransaction
        title="This one is clickable but has a very long title"
        subtitle="very long subtitle, the kind of subtitle you'd never wish to see in the app, like a very long one"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "1000 euro"
        }}
        paymentLogoIcon={"postepay"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemTransaction, custom icon">
      <ListItemTransaction
        title="Custom icon"
        subtitle="This one has a custom icon on the left"
        transaction={{
          amount: "",
          amountAccessibilityLabel: ""
        }}
        paymentLogoIcon={<Icon name="notice" color="error-500" />}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
  </VStack>
);
