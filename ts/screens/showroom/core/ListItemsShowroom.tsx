// import { View as NBView, Text as NBText } from "native-base";
import * as React from "react";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { H2 } from "../../../components/core/typography/H2";

import { ShowroomSection } from "../components/ShowroomSection";
import { ComponentViewerBox } from "../components/ComponentViewerBox";

import ListItemComponent from "../../../components/screens/ListItemComponent";
import CategoryCheckbox from "../../../features/bonus/cgn/components/merchants/search/CategoryCheckbox";
import { BankPreviewItem } from "../../../features/wallet/onboarding/bancomat/components/BankPreviewItem";
import CgnMerchantDiscountItem from "../../../features/bonus/cgn/components/merchants/CgnMerchantsDiscountItem";

/* Icons */
import BooksIcon from "../../../../img/bonus/cgn/categories/books.svg";
import CultureIcon from "../../../../img/bonus/cgn/categories/culture.svg";
import InfoIcon from "../../../../img/assistance/info.svg";

import OrderOption from "../../../features/bonus/cgn/components/merchants/search/OrderOption";
import ZendeskItemPermissionComponent from "../../../features/zendesk/components/ZendeskItemPermissionComponent";
import { ProductCategoryEnum } from "../../../../definitions/cgn/merchants/ProductCategory";
import CgnMerchantListItem from "../../../features/bonus/cgn/components/merchants/CgnMerchantListItem";
import DetailedlistItemComponent from "../../../components/DetailedlistItemComponent";
import { TimelineTransactionCard } from "../../../features/idpay/initiative/details/components/TimelineTransactionCards";
import { OperationTypeEnum } from "../../../../definitions/idpay/timeline/TransactionOperationDTO";

export const ListItemsShowroom = () => (
  <ShowroomSection title={"List Items"}>
    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      ListItemComponent (NativeBase)
    </H2>
    <ComponentViewerBox name="ListItemComponent (title)">
      <ListItemComponent
        title={"Title"}
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (title + subtitle)">
      <ListItemComponent
        title={"Title"}
        subTitle="Subtitle"
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (without icon)">
      <ListItemComponent
        title={"Title"}
        hideIcon={true}
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (without separator)">
      <ListItemComponent
        title={"Title"}
        onPress={() => alert("Action triggered")}
        hideSeparator={true}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (stress test)">
      <ListItemComponent
        title={"Let's try a looong looooong looooooooong title"}
        subTitle="A loooong looooooong looooooooooong subtitle, too"
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (stress test, no truncated subtitle)">
      <ListItemComponent
        title={"Let's try a looong looooong looooooooong title"}
        subTitle="A loooong looooooong looooooooooong subtitle, too"
        useExtendedSubTitle={true}
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>

    <ComponentViewerBox name="ListItemComponent (badge)">
      <ListItemComponent
        title={"A looong looooong looooooooong looooooooooong title"}
        hasBadge={true}
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (badge)">
      <ListItemComponent
        title={"A looong looooong looooooooong looooooooooong title"}
        titleBadge="Badge"
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (custom icon)">
      <ListItemComponent
        title={"Title"}
        iconSize={12}
        iconName={"io-tick-big"}
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (switch)">
      <ListItemComponent
        title={"Setting with switch"}
        switchValue={true}
        accessibilityRole={"switch"}
        accessibilityState={{ checked: false }}
        isLongPressEnabled={true}
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>
    <ComponentViewerBox name="ListItemComponent (radio)">
      <ListItemComponent
        title={"Title"}
        subTitle={"Subtitle"}
        iconName={"io-radio-on"}
        smallIconSize={true}
        iconOnTop={true}
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      Derivated from ListItem (NativeBase)
    </H2>

    <ComponentViewerBox name="CategoryCheckbox">
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
    </ComponentViewerBox>

    <ComponentViewerBox name="OrderOption">
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
    </ComponentViewerBox>
    <ComponentViewerBox name="BankPreviewItem">
      <BankPreviewItem
        bank={{
          abi: "03069",
          logoUrl: "https://assets.cdn.io.italia.it/logos/abi/03069.png",
          name: "Intesa Sanpaolo"
        }}
        inList={true}
        onPress={() => alert("Action triggered")}
      />
    </ComponentViewerBox>

    <ComponentViewerBox name="ZendeskItemPermissionComponent">
      <ZendeskItemPermissionComponent
        icon={<InfoIcon width={24} height={24} />}
        title="Storico versioni dell'app"
        value="Per capire se il problema dipende dall'ultimo aggiornamento"
        testId="TestID"
      />
    </ComponentViewerBox>

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      Misc
    </H2>

    <ComponentViewerBox name="DetailedlistItemComponent">
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
    </ComponentViewerBox>

    <ComponentViewerBox name="TimelineTransactionCard">
      <TimelineTransactionCard
        transaction={{
          operationId: "213123",
          operationType: "Pagamento Pos" as OperationTypeEnum,
          operationDate: new Date(),
          brandLogo: "",
          maskedPan: "****",
          amount: -100,
          circuitType: "MasterCard"
        }}
      />
    </ComponentViewerBox>

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      Native (Not NativeBase)
    </H2>

    <ComponentViewerBox name="CgnMerchantDiscountItem">
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
    </ComponentViewerBox>

    <ComponentViewerBox name="CgnMerchantListItem">
      <CgnMerchantListItem
        categories={[
          ProductCategoryEnum.cultureAndEntertainment,
          ProductCategoryEnum.home
        ]}
        name={"Partner Name"}
        onPress={() => alert("Action triggered")}
        isNew={true}
      />
    </ComponentViewerBox>
  </ShowroomSection>
);
