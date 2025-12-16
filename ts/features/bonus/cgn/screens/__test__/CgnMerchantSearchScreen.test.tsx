import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { CgnMerchantSearchScreen } from "../merchants/CgnMerchantSearchScreen";
import CGN_ROUTES from "../../navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { watchBonusCgnSaga } from "../../saga";

const mockFetch: typeof fetch = async (url, options) => {
  if (url === "/api/v1/cgn/operator-search/count") {
    return new Response(JSON.stringify({ count: merchantList.length }), {
      status: 200
    });
  }
  if (url === "/api/v1/cgn/operator-search/search") {
    const body = JSON.parse(options?.body as string);
    if (body.token === "merchant") {
      return new Response(JSON.stringify({ items: merchantList }), {
        status: 200
      });
    }
    if (body.token === "two") {
      return new Response(JSON.stringify({ items: [merchantList[1]] }), {
        status: 200
      });
    }
    if (body.token === "four") {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200
      });
    }
  }
  throw new Error(`Unexpected fetch call to ${url}`);
};

declare const global: { fetch: typeof fetch };
beforeEach(() => {
  jest.spyOn(global, "fetch").mockImplementation(mockFetch as any);
});

const merchantList = [
  {
    id: "1",
    name: "merchant one",
    description: "description one",
    newDiscounts: true
  },
  {
    id: "2",
    name: "merchant two",
    description: "description two",
    newDiscounts: false
  },
  {
    id: "3",
    name: "merchant three",
    description: "description three",
    newDiscounts: true
  }
];

test("doing nothing shows initial state", async () => {
  const { screen } = renderScreen();
  await screen.findByTestId("cgnMerchantSearchInput");
  await screen.findByText(
    I18n.t("bonus.cgn.merchantSearch.emptyList.shortQuery.titleWithCount", {
      merchantCount: merchantList.length
    })
  );
  expect(
    screen.queryByText(
      I18n.t("bonus.cgn.merchantSearch.emptyList.noResults.title")
    )
  ).toBeNull();
  expect(screen.queryByText(/one/)).toBeNull();
  expect(screen.queryByText(/two/)).toBeNull();
  expect(screen.queryByText(/three/)).toBeNull();
});

test("searching existing shows results", async () => {
  const { screen } = renderScreen();
  const searchInput = await screen.findByTestId("cgnMerchantSearchInput");
  fireEvent.changeText(searchInput, "merchant ");
  await screen.findByText(" one");
  await screen.findByText(" two");
  await screen.findByText(" three");
  fireEvent.changeText(searchInput, "two");
  await screen.findByText("merchant ");
  expect(screen.queryByText(" one")).toBeNull();
  expect(screen.queryByText(" three")).toBeNull();
  expect(
    screen.queryByText(
      I18n.t("bonus.cgn.merchantSearch.emptyList.noResults.title")
    )
  ).toBeNull();
  expect(
    screen.queryByText(
      I18n.t("bonus.cgn.merchantSearch.emptyList.shortQuery.titleWithCount", {
        merchantCount: merchantList.length
      })
    )
  ).toBeNull();
});

test("searching non existing shows empty state", async () => {
  const { screen } = renderScreen();
  const searchInput = await screen.findByTestId("cgnMerchantSearchInput");
  fireEvent.changeText(searchInput, "four");
  await screen.findByText(
    I18n.t("bonus.cgn.merchantSearch.emptyList.noResults.title")
  );
  expect(screen.queryByText(/one/)).toBeNull();
  expect(screen.queryByText(/two/)).toBeNull();
  expect(screen.queryByText(/three/)).toBeNull();
  expect(
    screen.queryByText(
      I18n.t("bonus.cgn.merchantSearch.emptyList.shortQuery.titleWithCount", {
        merchantCount: merchantList.length
      })
    )
  ).toBeNull();
});

function renderScreen() {
  const sagaMidddleware = createSagaMiddleware();
  const store = createStore(appReducer, applyMiddleware(sagaMidddleware));
  store.dispatch(applicationChangeState("active"));
  sagaMidddleware.run(watchBonusCgnSaga, "");
  const screen = renderScreenWithNavigationStoreContext(
    () => <CgnMerchantSearchScreen />,
    CGN_ROUTES.DETAILS.MERCHANTS.SEARCH,
    {},
    store
  );
  return { screen, store };
}
