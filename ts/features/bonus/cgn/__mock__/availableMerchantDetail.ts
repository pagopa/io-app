export type TmpDiscountType = {
  category: string;
  title: string;
  description: string;
  validityDescription: string;
  discountCode?: string;
  conditions: string;
  value: number;
};

export type TmpMerchantDetail = {
  name: string;
  cover: string;
  location: string;
  url: string;
  discounts: ReadonlyArray<TmpDiscountType>;
  description: string;
  availableServices: string;
  workingHours?: string;
};

export const sampleMerchant: TmpMerchantDetail = {
  name: "Nome teatro",
  url: "https://google.com",
  cover: "https://picsum.photos/343/230",
  location: "Via Roma 1, 00000, Roma",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin dolor ut lacus faucibus lobortis.",
  availableServices:
    "Tecnologia, Libri, Casa, Cura della persona, Abbigliamento, Giochi, Auto e Moto",
  workingHours: "Lun, Mar, Mer, Gio, Dom 9:00 - 23:00 Ven, Sab 9:00 - 00:00",
  discounts: [
    {
      category: "test category",
      title: "Abbonamento stagione danza",
      description:
        "Acquista un abbonamento per tutti gli spettacoli di danza previsti per la stagione 2021-22.",
      validityDescription: "Dal 15 Marzo al 15 Maggio 2021.",
      discountCode: "123 456 789 10",
      conditions:
        "Lo sconto del 30% si applica sull’acquisto di un solo abbonamento. L’offerta è nominale e non è rimborsabile.",
      value: 30
    },
    {
      category: "test category 2",
      title: "Abbonamento stagione danza",
      description:
        "Acquista un abbonamento per tutti gli spettacoli di danza previsti per la stagione 2021-22.",
      validityDescription: "Dal 15 Marzo al 15 Maggio 2021.",
      conditions:
        "Lo sconto del 30% si applica sull’acquisto di un solo abbonamento. L’offerta è nominale e non è rimborsabile.",
      value: 30
    }
  ]
};
