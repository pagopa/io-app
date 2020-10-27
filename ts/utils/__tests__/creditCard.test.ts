import { isSome, Option, some } from "fp-ts/lib/Option";
import { CreditCardDetector, IconSource } from "../creditCard";

describe("Validates CC Number", () => {
  /*
    Test Table structure for nested describe.each. 
    Please note that in our case expected result is simply a string.

    [
        [
            "test category n.1", 
            [
                ["test name n. 1.1", {expected results n. 1.1}]
                ["test name n. 1.2", {expected results n. 1.2}]
                ...
            ]
            
        ],
        [
            "test category n.2", 
            [
                ["test name n. 2.1", {expected results n. 2.1}]
                ["test name n. 2.2", {expected results n. 2.2}]
                ...
            ]
            
        ],
    ]
    
    */
  const testTable: Array<[string, Array<[string, string]>]> = [
    [
      "Normal Success Cases", // At least one test case for card brand
      [
        ["4012888888881881", "visa"],
        ["62123456789002", "unionpay"],
        ["621234567890003", "unionpay"], // different length
        ["5555555555554444", "mastercard"],
        ["5000000000000611", "maestro"],
        ["6011000990139424", "discover"],
        ["378282246310005", "amex"],
        ["3530111333300000", "jcb"]
      ]
    ]
  ];
  describe.each(testTable)("Tests for category %s", (description, tests) => {
    describe.each(tests)(
      `Testing brand detection on card number %p, category ${description} `,
      (cardNumber, brandExpected) => {
        const brandComputed = CreditCardDetector.getInfo(cardNumber);
        it(`Brand should be ${brandExpected}`, () => {
          expect(isSome(brandComputed)).toBeTruthy();
          if (isSome(brandComputed)) {
            expect(brandComputed.value).toEqual(brandExpected);
          }
        });
      }
    );
  });
});

describe("Returns Card Icon", () => {
  /*
    Test Table structure for nested describe.each. 
    Please note that in our case expected result is an image source.

    [
        [
            "test category n.1", 
            [
                ["test name n. 1.1", {expected results n. 1.1}]
                ["test name n. 1.2", {expected results n. 1.2}]
                ...
            ]
            
        ],
        [
            "test category n.2", 
            [
                ["test name n. 2.1", {expected results n. 2.1}]
                ["test name n. 2.2", {expected results n. 2.2}]
                ...
            ]
            
        ],
    ]
    
    */
  const cardIcons = CreditCardDetector.cardIcons;
  const testTable: Array<[string, Array<[Option<string>, IconSource]>]> = [
    [
      "Normal Success Cases", // At least one test case for card brand
      [
        // I need to have an option as getIcon uses Option.chain()
        [some("4012888888881881"), cardIcons.visa],
        [some("62123456789002"), cardIcons.unionpay],
        [some("621234567890003"), cardIcons.unionpay], // different length
        [some("5555555555554444"), cardIcons.mastercard],
        [some("5000000000000611"), cardIcons.maestro],
        [some("6011000990139424"), cardIcons.discover],
        [some("378282246310005"), cardIcons.amex],
        [some("3530111333300000"), cardIcons.jcb]
      ]
    ]
  ];
  describe.each(testTable)("Tests for category %s", (description, tests) => {
    describe.each(tests)(
      `Testing returned icon on card number %p, category ${description} `,
      (cardNumber, iconExpected) => {
        const iconComputed = CreditCardDetector.getIcon(cardNumber);
        it(`Card icon should be ${
          iconExpected ? iconExpected.toString() : "undefined"
        }`, () => {
          expect(iconComputed).toEqual(iconExpected);
          //}
        });
      }
    );
  });
});
