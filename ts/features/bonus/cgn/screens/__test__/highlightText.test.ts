import { highlightSearchText } from "../../../../../utils/highlightSearchText";

const text =
  "abba mulle titti heppy smile jinx left right up down defualt function luck norbert";

test("highghlight at start", () => {
  const result = highlightSearchText({
    text,
    searchText: "mulle",
    estimatedTextLengthToDisplay: 20
  });
  expect(result).toEqual([
    { text: "...abba ", highlighted: false },
    { text: "mulle", highlighted: true },
    {
      text: " titti heppy smile jinx left right up down defualt function luck norbert",
      highlighted: false
    }
  ]);
});

test("highghlight at middle", () => {
  const result = highlightSearchText({
    text,
    searchText: "right",
    estimatedTextLengthToDisplay: 20
  });
  expect(result).toEqual([
    { text: "...x left ", highlighted: false },
    { text: "right", highlighted: true },
    {
      text: " up down defualt function luck norbert",
      highlighted: false
    }
  ]);
});

test("highghlight at end", () => {
  const result = highlightSearchText({
    text,
    searchText: "luck",
    estimatedTextLengthToDisplay: 20
  });
  expect(result).toEqual([
    {
      text: "...unction ",
      highlighted: false
    },
    {
      text: "luck",
      highlighted: true
    },
    {
      text: " norbert",
      highlighted: false
    }
  ]);
});
