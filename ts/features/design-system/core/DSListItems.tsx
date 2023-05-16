import * as React from "react";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { View } from "react-native";
import { H2 } from "../../../components/core/typography/H2";

import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

import ListItemComponent from "../../../components/screens/ListItemComponent";
import CategoryCheckbox from "../../bonus/cgn/components/merchants/search/CategoryCheckbox";
import { BankPreviewItem } from "../../wallet/onboarding/bancomat/components/BankPreviewItem";
import CgnMerchantDiscountItem from "../../bonus/cgn/components/merchants/CgnMerchantsDiscountItem";

/* Icons */
import BooksIcon from "../../../../img/bonus/cgn/categories/books.svg";
import CultureIcon from "../../../../img/bonus/cgn/categories/culture.svg";

import OrderOption from "../../bonus/cgn/components/merchants/search/OrderOption";
import ZendeskItemPermissionComponent from "../../zendesk/components/ZendeskItemPermissionComponent";
import { ProductCategoryEnum } from "../../../../definitions/cgn/merchants/ProductCategory";
import CgnMerchantListItem from "../../bonus/cgn/components/merchants/CgnMerchantListItem";
import DetailedlistItemComponent from "../../../components/DetailedlistItemComponent";
import { TimelineOperationListItem } from "../../idpay/initiative/details/components/TimelineOperationListItem";
import { OperationTypeEnum } from "../../../../definitions/idpay/TransactionOperationDTO";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import ListItemNav from "../../../components/ui/ListItemNav";
import { IOThemeContext } from "../../../components/core/variables/IOColors";
import ListItemNavAlert from "../../../components/ui/ListItemNavAlert";
import { Icon } from "../../../components/core/icons/Icon";

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
        <DSComponentViewerBox name="ListItemNav">
          <View>
            <ListItemNav
              value={"Value"}
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />
            <ListItemNav
              value={"Value"}
              description="Description"
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />
            <ListItemNav
              value="A looong looooong looooooooong looooooooooong title"
              description="Description"
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />

            <ListItemNav
              value={"Value"}
              icon="gallery"
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />
            <ListItemNav
              value={"Value"}
              description="Description"
              icon="gallery"
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />
          </View>
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ListItemNavAlert">
          <View>
            <ListItemNavAlert
              value={"Value"}
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />
            <ListItemNavAlert
              value={"Value"}
              description="Description"
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />
            <ListItemNavAlert
              withoutIcon
              value={"Value"}
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />
            <ListItemNavAlert
              withoutIcon
              value={"Value"}
              description="Description"
              onPress={() => {
                alert("Action triggered");
              }}
              accessibilityLabel="Empty just for testing purposes"
            />
          </View>
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
            iconName={"completed"}
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

        <DSComponentViewerBox name="CategoryCheckbox">
          <CategoryCheckbox
            text={"Title"}
            value={"Value"}
            checked={true}
            onPress={() => alert("Action triggered")}
            icon={BooksIcon}
          />
          <CategoryCheckbox
            text={"Title"}
            value={"Value"}
            checked={false}
            onPress={() => alert("Action triggered")}
            icon={CultureIcon}
          />
        </DSComponentViewerBox>

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
        <DSComponentViewerBox name="BankPreviewItem">
          <BankPreviewItem
            bank={{
              abi: "03069",
              logoUrl: "https://assets.cdn.io.italia.it/logos/abi/03069.png",
              name: "Intesa Sanpaolo"
            }}
            inList={true}
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

        <DSComponentViewerBox name="TimelineTransactionCard">
          <TimelineOperationListItem
            operation={{
              brand: "MASTERCARD",
              operationId: "213123",
              operationType: "Pagamento Pos" as OperationTypeEnum,
              operationDate: new Date(),
              brandLogo: "",
              maskedPan: "****",
              amount: 100,
              accrued: 50,
              circuitType: "MasterCard"
            }}
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

        <VSpacer size={40} />
      </DesignSystemScreen>
    )}
  </IOThemeContext.Consumer>
);
