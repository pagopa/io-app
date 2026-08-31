import { fakerIT as faker } from "@faker-js/faker";
import { DiscountBucketCode } from "@io-app/api-types/generated/definitions/cgn/merchants/DiscountBucketCode";
import { OfflineMerchant } from "@io-app/api-types/generated/definitions/cgn/merchants/OfflineMerchant";
import { OfflineMerchantSearchRequest } from "@io-app/api-types/generated/definitions/cgn/merchants/OfflineMerchantSearchRequest";
import { OnlineMerchant } from "@io-app/api-types/generated/definitions/cgn/merchants/OnlineMerchant";
import { OnlineMerchantSearchRequest } from "@io-app/api-types/generated/definitions/cgn/merchants/OnlineMerchantSearchRequest";
import { ProductCategoryEnum } from "@io-app/api-types/generated/definitions/cgn/merchants/ProductCategory";
import { SearchRequest } from "@io-app/api-types/generated/definitions/cgn/merchants/SearchRequest";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Router } from "express";
import { reverse, sortBy } from "fp-ts/lib/Array";
import { Ord } from "fp-ts/lib/boolean";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { contramap } from "fp-ts/lib/Ord";

import { getProblemJson } from "../../../payloads/error";
import {
  generateMerchantsAll,
  offlineMerchants,
  onlineMerchants
} from "../../../payloads/features/cgn/merchants";
import { addHandler } from "../../../payloads/response";
import { sendFileFromRootPath } from "../../../utils/file";
import { publicRouter } from "../../public";

export const cgnMerchantsRouter = Router();

const MERCHANTS_PREFIX = "/api/cgn-search/v1";

const addPrefix = (path: string) => `${MERCHANTS_PREFIX}${path}`;

const merchantsAll = generateMerchantsAll();

const filterMerchants = <T extends OfflineMerchant | OnlineMerchant>(
  merchants: ReadonlyArray<T>,
  productCategories?: ReadonlyArray<ProductCategoryEnum>,
  merchantName?: string
): ReadonlyArray<T> => {
  const filters = (merchant: T): boolean =>
    pipe(
      O.fromNullable(merchantName),
      O.fold(
        () => true,
        mn => merchant.name.includes(mn)
      )
    ) &&
    pipe(
      O.fromNullable(productCategories),
      O.fold(
        () => true,
        pc => merchant.productCategories.some(cat => pc.includes(cat))
      )
    );
  const merchantsFiltered = merchants.filter(filters);
  const byNewDiscounts = contramap((m: T) => m.newDiscounts)(Ord);
  const orderMerchantsByNewDiscount = sortBy([byNewDiscounts]);
  return pipe(merchantsFiltered, reverse, orderMerchantsByNewDiscount);
};

addHandler(
  cgnMerchantsRouter,
  "post",
  addPrefix("/online-merchants"),
  (req, res) => {
    if (OnlineMerchantSearchRequest.is(req.body)) {
      return res.status(200).json({
        items: filterMerchants<OnlineMerchant>(
          onlineMerchants.items,
          req.body.productCategories,
          req.body.merchantName
        )
      });
    }
    return res.status(500);
  }
);

addHandler(cgnMerchantsRouter, "get", addPrefix("/count"), (req, res) => {
  if (SearchRequest.is(req.body)) {
    return res.status(200).json({
      count: merchantsAll.length
    });
  }
  return res.status(500);
});

addHandler(cgnMerchantsRouter, "post", addPrefix("/search"), (req, res) => {
  if (SearchRequest.is(req.body)) {
    return res.status(200).json({
      items: merchantsAll
        .filter(
          merchant =>
            merchant.name
              .toLowerCase()
              .includes(req.body.token.toLowerCase()) ||
            merchant.description
              ?.toLowerCase()
              .includes(req.body.token.toLowerCase())
        )
        .map(merchant => ({
          id: merchant.id,
          name: merchant.name,
          description: merchant.description,
          newDiscounts: faker.datatype.boolean()
        }))
    });
  }
  return res.status(500);
});

addHandler(
  cgnMerchantsRouter,
  "post",
  addPrefix("/offline-merchants"),
  (req, res) => {
    if (OfflineMerchantSearchRequest.is(req.body)) {
      return res.status(200).json({
        items: filterMerchants<OfflineMerchant>(
          offlineMerchants.items,
          req.body.productCategories,
          req.body.merchantName
        )
      });
    }
    return res.status(500);
  }
);

addHandler(
  cgnMerchantsRouter,
  "get",
  addPrefix("/merchants/:merchantId"),
  (req, res) => {
    const merchIndex = merchantsAll.findIndex(
      item => item.id === req.params.merchantId
    );
    if (merchIndex === -1) {
      res.json(getProblemJson(404, "message not found"));
      return;
    }

    const foundMerchant = merchantsAll[merchIndex];

    res.json(foundMerchant);
  }
);

addHandler(
  cgnMerchantsRouter,
  "get",
  addPrefix("/discount-bucket-code/:discountId"),
  (req, res) => {
    const discountBucketCode: DiscountBucketCode = {
      code: faker.string.sample() as NonEmptyString
    };
    res.json(discountBucketCode);
  }
);

addHandler(
  cgnMerchantsRouter,
  "get",
  addPrefix("/published-product-categories"),
  (req, res) => {
    const categories: ReadonlyArray<ProductCategoryEnum> = [
      ...onlineMerchants.items,
      ...offlineMerchants.items
    ].flatMap(item => item.productCategories);
    const categoriesSet = new Set(categories);

    if (req.query.count_new_discounts === "true") {
      res.json({
        items: Array.from(categoriesSet).map(c => ({
          productCategory: c,
          newDiscounts: faker.number.int(30)
        }))
      });
      return;
    }
    res.json({ items: Array.from(categoriesSet) });
  }
);
/**
 * just for test purposes an html page that works as
 * the landing Page of a discount for merchant reading the referrer header
 */
addHandler(publicRouter, "get", "/merchant_landing", (req, res) => {
  // eslint-disable-next-line no-console
  console.log(
    "X-PagoPa-CGN-Referer header",
    req.header("X-PagoPa-CGN-Referer")
  );
  sendFileFromRootPath("assets/html/merchants_landing_page.html", res);
});
