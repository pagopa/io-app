import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as React from "react";

import {
  Divider,
  IOThemeContext,
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
  VSpacer
} from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import { H2 } from "../../../components/core/typography/H2";

import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

import ListItemComponent from "../../../components/screens/ListItemComponent";
import CgnMerchantDiscountItem from "../../bonus/cgn/components/merchants/CgnMerchantsDiscountItem";
import { BankPreviewItem } from "../../wallet/onboarding/bancomat/components/BankPreviewItem";

import { ProductCategoryEnum } from "../../../../definitions/cgn/merchants/ProductCategory";
import DetailedlistItemComponent from "../../../components/DetailedlistItemComponent";
import CgnMerchantListItem from "../../bonus/cgn/components/merchants/CgnMerchantListItem";
import OrderOption from "../../bonus/cgn/components/merchants/search/OrderOption";
import { getBadgeTextByTransactionStatus } from "../../payments/common/utils";
import ZendeskItemPermissionComponent from "../../zendesk/components/ZendeskItemPermissionComponent";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const onCopyButtonPress = () => {
  Alert.alert("Copied!", "Value copied");
};

export const DSListItems = () => (
  <IOThemeContext.Consumer>
    {theme => (
      <DesignSystemScreen title="List Items">
        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          ListItemNav
        </H2>
        {renderListItemNav()}

        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          ListItemInfoCopy
        </H2>
        {renderListItemInfoCopy()}

        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          ListItemInfo
        </H2>
        {renderListItemInfo()}

        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          ListItemHeader
        </H2>
        {renderListItemHeader()}

        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          ListItemAction
        </H2>
        {renderListItemAction()}

        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          ListItemTransaction
        </H2>
        {renderListItemTransaction()}

        <VSpacer size={24} />

        <H2
          color={"bluegrey"}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          NativeBase lookalikes (not NativeBase)
        </H2>
        <DSComponentViewerBox name="BankPreviewItem -- using PressableListItemBase">
          <BankPreviewItem
            bank={{
              abi: "03069",
              logoUrl: "https://assets.cdn.io.italia.it/logos/abi/03069.png",
              name: "Intesa Sanpaolo"
            }}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>

        <VSpacer size={40} />

        <H2
          color={"bluegrey"}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          ListItemComponent (NativeBase)
        </H2>
        <DSComponentViewerBox name="ListItemComponent (title)">
          <ListItemComponent
            title={"Title"}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (title + subtitle)">
          <ListItemComponent
            title={"Title"}
            subTitle="Subtitle"
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (without icon)">
          <ListItemComponent
            title={"Title"}
            hideIcon={true}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (without separator)">
          <ListItemComponent
            title={"Title"}
            onPress={() => alert("Action triggered")}
            hideSeparator={true}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (stress test)">
          <ListItemComponent
            title={"Let's try a looong looooong looooooooong title"}
            subTitle="A loooong looooooong looooooooooong subtitle, too"
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (stress test, no truncated subtitle)">
          <ListItemComponent
            title={"Let's try a looong looooong looooooooong title"}
            subTitle="A loooong looooooong looooooooooong subtitle, too"
            useExtendedSubTitle={true}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>

        <DSComponentViewerBox name="ListItemComponent (badge)">
          <ListItemComponent
            title={"A looong looooong looooooooong looooooooooong title"}
            hasBadge={true}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (badge)">
          <ListItemComponent
            title={"A looong looooong looooooooong looooooooooong title"}
            titleBadge="Badge"
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (custom icon)">
          <ListItemComponent
            title={"Title"}
            iconSize={12}
            iconName={"checkTickBig"}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (switch)">
          <ListItemComponent
            title={"Setting with switch"}
            switchValue={true}
            accessibilityRole={"switch"}
            accessibilityState={{ checked: false }}
            isLongPressEnabled={true}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemComponent (radio)">
          <ListItemComponent
            title={"Title"}
            subTitle={"Subtitle"}
            iconName={"legRadioOn"}
            smallIconSize={true}
            iconOnTop={true}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>

        <H2
          color={"bluegrey"}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          Derivated from ListItem (NativeBase)
        </H2>
        <DSComponentViewerBox name="OrderOption">
          <OrderOption
            text={"Checked"}
            value={"Value"}
            checked={true}
            onPress={() => alert("Action triggered")}
          />
          <OrderOption
            text={"Unchecked"}
            value={"Value"}
            checked={false}
            onPress={() => alert("Action triggered")}
          />
        </DSComponentViewerBox>

        <DSComponentViewerBox name="ZendeskItemPermissionComponent">
          <ZendeskItemPermissionComponent
            icon={<Icon name="info" size={24} />}
            title="Storico versioni dell'app"
            value="Per capire se il problema dipende dall'ultimo aggiornamento"
            testId="TestID"
          />
        </DSComponentViewerBox>
        <H2
          color={"bluegrey"}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          Misc
        </H2>
        <DSComponentViewerBox name="DetailedlistItemComponent">
          <DetailedlistItemComponent
            isNew={true}
            text11={"Payment Recipient"}
            text12={"+200,00 €"}
            text2={"19/12/2022 - 1:25:23 PM"}
            text3={"Transaction Name"}
            onPressItem={() => alert("Action triggered")}
            accessible={true}
            accessibilityRole={"button"}
            accessibilityLabel={"Accessibility Label"}
          />
        </DSComponentViewerBox>

        <H2
          color={"bluegrey"}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          Native (Not NativeBase)
        </H2>
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
              productCategories: [ProductCategoryEnum.cultureAndEntertainment],
              startDate: new Date()
            }}
            operatorName={"Operator name"}
            merchantType={undefined}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="CgnMerchantListItem">
          <CgnMerchantListItem
            categories={[
              ProductCategoryEnum.cultureAndEntertainment,
              ProductCategoryEnum.home
            ]}
            name={"Partner Name"}
            onPress={() => alert("Action triggered")}
            isNew={true}
          />
        </DSComponentViewerBox>
      </DesignSystemScreen>
    )}
  </IOThemeContext.Consumer>
);

const renderListItemNav = () => (
  <>
    <DSComponentViewerBox name="ListItemNav">
      <View>
        <ListItemNav
          value={"Value"}
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
        <Divider />
        <ListItemNav
          value={"Value"}
          description="Description"
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
        <Divider />
        <ListItemNav
          value="A looong looooong looooooooong looooooooooong title"
          description="Description"
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
        <Divider />
        <ListItemNav
          value={"Value"}
          icon="gallery"
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
        <Divider />
        <ListItemNav
          value={"Value"}
          description="Description"
          icon="gallery"
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
        <Divider />
        <ListItemNav
          value={"Value"}
          description="This is a list item nav with badge"
          onPress={() => {
            alert("Action triggered");
          }}
          accessibilityLabel="Empty just for testing purposes"
          topElement={{
            badgeProps: {
              text: "Novità",
              variant: "blue"
            }
          }}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemNav, without chevron">
      <ListItemNav
        value={"Value"}
        description="This is a list item nav without chevron icon"
        onPress={() => {
          alert("Action triggered");
        }}
        accessibilityLabel="Empty just for testing purposes"
        hideChevron
      />
      <Divider />
      <ListItemNav
        value={"Value"}
        description="This is a list item nav with badge without chevron"
        onPress={() => {
          alert("Action triggered");
        }}
        accessibilityLabel="Empty just for testing purposes"
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
      <View>
        <ListItemNavAlert
          value={"Value"}
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
        <Divider />
        <ListItemNavAlert
          value={"Value"}
          description="Description"
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
        <Divider />
        <ListItemNavAlert
          withoutIcon
          value={"Value"}
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
        <Divider />
        <ListItemNavAlert
          withoutIcon
          value={"Value"}
          description="Description"
          onPress={onButtonPress}
          accessibilityLabel="Empty just for testing purposes"
        />
      </View>
    </DSComponentViewerBox>
  </>
);

const renderListItemInfoCopy = () => (
  <DSComponentViewerBox name="ListItemInfoCopy">
    <View>
      <ListItemInfoCopy
        label={"Label"}
        value="Value"
        onPress={onCopyButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
      <Divider />
      <ListItemInfoCopy
        label={"Codice fiscale"}
        value="01199250158"
        onPress={onCopyButtonPress}
        accessibilityLabel="Empty just for testing purposes"
        icon="institution"
      />
      <Divider />
      <ListItemInfoCopy
        label={"Carta di credito"}
        value="4975 3013 5042 7899"
        onPress={onCopyButtonPress}
        accessibilityLabel="Empty just for testing purposes"
        icon="creditCard"
      />
      <Divider />
      <ListItemInfoCopy
        label={"Indirizzo"}
        value={`P.za Colonna, 370\n00186 Roma (RM)`}
        onPress={onCopyButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
    </View>
  </DSComponentViewerBox>
);

const renderListItemAction = () => (
  <>
    <DSComponentViewerBox name="ListItemAction · Primary variant">
      <ListItemAction
        variant="primary"
        label={"Link interno oppure link ad una pagina esterna"}
        onPress={onButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
      <ListItemAction
        variant="primary"
        icon="website"
        label={"Link interno oppure link ad una pagina esterna"}
        onPress={onButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
      <ListItemAction
        variant="primary"
        icon="device"
        label={"Scarica l'app"}
        onPress={onButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
      <ListItemAction
        variant="primary"
        icon="security"
        label={"Informativa sulla privacy"}
        onPress={onButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
      <ListItemAction
        variant="primary"
        icon="chat"
        label={"Richiedi assistenza"}
        onPress={onButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemAction · Danger variant">
      <ListItemAction
        variant="danger"
        label={"Danger action"}
        onPress={onButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
      <ListItemAction
        variant="danger"
        icon="trashcan"
        label={"Elimina"}
        onPress={onButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
      <ListItemAction
        variant="danger"
        icon="logout"
        label={"Esci da IO"}
        onPress={onButtonPress}
        accessibilityLabel="Empty just for testing purposes"
      />
    </DSComponentViewerBox>
  </>
);

const renderListItemInfo = () => (
  <DSComponentViewerBox name="ListItemInfo">
    <View>
      <ListItemInfo
        label="Label"
        value={"Value"}
        accessibilityLabel="Empty just for testing purposes"
      />
      <Divider />
      <ListItemInfo
        label="Label"
        value="A looong looooong looooooooong looooooooooong title"
        accessibilityLabel="Empty just for testing purposes"
      />
      <Divider />
      <ListItemInfo
        icon="creditCard"
        label="Label"
        value="A looong looooong looooooooong looooooooooong title"
        accessibilityLabel="Empty just for testing purposes"
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
        accessibilityLabel="Empty just for testing purposes"
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
        accessibilityLabel="Empty just for testing purposes"
        endElement={{
          type: "badge",
          componentProps: {
            text: "pagato",
            variant: "success"
          }
        }}
      />
      <Divider />
      <ListItemInfo
        label="Label"
        value={"Value"}
        icon="gallery"
        accessibilityLabel="Empty just for testing purposes"
      />
    </View>
  </DSComponentViewerBox>
);

/* LIST ITEM HEADER */

const renderListItemHeader = () => (
  <>
    <DSComponentViewerBox name="ListItemHeader, without icon">
      <ListItemHeader
        label="Label"
        accessibilityLabel="Empty just for testing purposes"
      />
      <ListItemHeader
        label="Label"
        accessibilityLabel="Empty just for testing purposes"
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
        accessibilityLabel="Empty just for testing purposes"
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
      <ListItemHeader
        label="Label"
        iconName="gallery"
        accessibilityLabel="Empty just for testing purposes"
      />
      <ListItemHeader
        iconName="creditCard"
        label="Label"
        accessibilityLabel="Empty just for testing purposes"
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
        accessibilityLabel="Empty just for testing purposes"
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
        accessibilityLabel="Empty just for testing purposes"
        endElement={{
          type: "badge",
          componentProps: {
            text: "Pagato",
            variant: "success"
          }
        }}
      />
    </DSComponentViewerBox>
  </>
);

/* LIST ITEM TRANSACTION */

/* Mock assets */
const cdnPath = "https://assets.cdn.io.italia.it/logos/organizations/";
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
  <DSComponentViewerBox name="ListItemTransaction">
    <View>
      <ListItemTransaction
        title="Title"
        subtitle="subtitle"
        transactionStatus="success"
        transactionAmount="€ 1.000,00"
        isLoading={true}
        onPress={onButtonPress}
      />

      <Divider />

      {transactionStatusArray.map(
        ({ status, asset }: mockTransactionStatusData) => (
          <React.Fragment key={`transactionStatus-${status}`}>
            <ListItemTransaction
              title="Title"
              subtitle="subtitle"
              paymentLogoIcon={asset}
              transactionStatus={status}
              badgeText={getBadgeTextByTransactionStatus(status)}
              onPress={onButtonPress}
            />
            <Divider />
          </React.Fragment>
        )
      )}

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

      <Divider />

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

      <Divider />

      <ListItemTransaction
        title="Custom icon"
        subtitle="This one has a custom icon on the left"
        transactionStatus="success"
        paymentLogoIcon={<Icon name="notice" color="red" />}
        transactionAmount=""
        onPress={onButtonPress}
      />

      <Divider />

      <ListItemTransaction
        title="Refunded transaction"
        subtitle="This one has a custom icon and transaction amount with a green color"
        transactionStatus="refunded"
        paymentLogoIcon={<Icon name="refund" color="bluegrey" />}
        transactionAmount="€ 100"
        onPress={onButtonPress}
      />
    </View>
  </DSComponentViewerBox>
);
