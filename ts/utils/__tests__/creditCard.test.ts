import { Option, some } from "fp-ts/lib/Option";
import { CreditCardDetector, SupportedBrand } from "../creditCard";

describe("Test CC validate function", () => {
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
  const supportedBrands = CreditCardDetector.supportedBrands;
  const testTable: Array<[string, Array<[Option<string>, SupportedBrand]>]> = [
    [
      "Normal Success Cases", // At least one test case for card brand
      [
        [some("4012888888881881"), supportedBrands.visa],
        [some("62123456789002"), supportedBrands.unionpay],
        [some("621234567890003"), supportedBrands.unionpay], // different length
        [some("5555555555554444"), supportedBrands.mastercard],
        [some("5000000000000611"), supportedBrands.maestro],
        [some("6011000990139424"), supportedBrands.discover],
        [some("378282246310005"), supportedBrands.amex],
        [some("3530111333300000"), supportedBrands.jcb]
      ]
    ],
    [
      "Unsupported Circuits", // At least one test case for known and unsupported circuits
      [
        [some("123"), supportedBrands.unknown],
        [some("123456789012345"), supportedBrands.unknown],
        [some("5919000000000000"), supportedBrands.unknown],
        [some("6370000000000000"), supportedBrands.unknown],
        [some("6390000000000000"), supportedBrands.unknown],
        [some("63900"), supportedBrands.unknown]
      ]
    ]
  ];
  describe.each(testTable)("Tests for category %s", (description, tests) => {
    describe.each(tests)(
      `Testing brand detection on card number %p, category ${description} `,
      (cardNumber, brandExpected) => {
        const brandComputed = CreditCardDetector.validate(cardNumber);
        it(`Brand should be ${brandExpected}`, () => {
          expect(brandComputed).toBeTruthy();
          expect(brandComputed).toEqual(brandExpected);
        });
      }
    );
  });
});
