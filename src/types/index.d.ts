interface Product {
  id: string;
  priceText: string;
  oldPriceText: string;
  price: number;
  oldPrice: number;
  installment: Installment;
  name: string;
  description: string;
  specs: Spec[];
  skus: Sku[];
}

interface Spec {
  id: string;
  label: string;
  type: string;
  offerId: string;
  subSpecs: Spec[] | null;
}

interface Sku {
  originalProductId: string;
  skuId: string;
  name: string;
  ean: string;
  priceText: string;
  oldPriceText: string;
  price: number;
  oldPrice: number;
  installment: Installment;
  images: Image[];
  specs: Spec[];
}

interface Installment {
  count: number;
  value: number;
  valueText: string;
}

interface Image {
  value: string;
}
