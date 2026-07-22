export interface ModelImage {
  color: string;
  mediaId: string;
  previewUrl: string;
  type: "hero" | "detail";
}

export interface BeeBikeModel {
  id: string;
  label: string;
  tagline: string;
  cta: string;
  gender: "muški" | "ženski";
  price?: number;
  priceMonthly?: number;
  images: ModelImage[];
}

const CDN = "https://beebike.rs/cdn/shop/files";

export const MODELS: BeeBikeModel[] = [
  {
    id: "cappuccino",
    label: "Cappuccino",
    tagline: "Dolce vita na dva točka",
    cta: "PORUČI SVOJ CAPPUCCINO",
    gender: "muški",
    price: 95000,
    priceMonthly: 4900,
    images: [
      { color: "Bež",      mediaId: "6f61dc53-07a9-4bcf-a38e-c43b9ebdee4a", previewUrl: `${CDN}/Cappuccino_Bez_4-3.jpg?v=1779224517`, type: "hero" },
      { color: "Crvena",   mediaId: "94f97752-b657-4afb-a92e-d40e3e41ff12", previewUrl: `${CDN}/Crveni_Cappuccino_4-3_544c4c17-f7a4-4516-ba04-2132b2b2cf11.png?v=1779224534`, type: "hero" },
      { color: "Crna",     mediaId: "8ddbb722-ae72-4169-8969-ddeb7e18869b", previewUrl: `${CDN}/Crni_Cappuccino_4-3_6c917024-9813-4491-b948-2527209453dc.png?v=1779224543`, type: "hero" },
      { color: "Tirkizna", mediaId: "374b1c0c-df2e-4a21-865f-1f2638d70b76", previewUrl: `${CDN}/Tirkiz_Cappuccino_4-3_4977e8fe-bbf6-4cb2-88e5-66592a47bdbb.png?v=1779224554`, type: "hero" },
      { color: "Zelena",   mediaId: "781eccd7-4bcf-4c94-a8e4-75c3e6011c04", previewUrl: `${CDN}/Cappuccino_Zeleni_4-3_2ceb1f91-1f08-4647-b868-8eff9e0a7fa8.png?v=1779224564`, type: "hero" },
    ],
  },
  {
    id: "compass",
    label: "Compass",
    tagline: "Snaga ima pravac",
    cta: "PORUČI SVOJ COMPASS",
    gender: "muški",
    price: 115000,
    priceMonthly: 5900,
    images: [
      { color: "Siva", mediaId: "7293a105-742a-4288-8d7c-69fd19126527", previewUrl: `${CDN}/BMW_7349_ea0832fa-a07b-468a-8e8d-da263a9711ba.jpg?v=1779238992`, type: "hero" },
    ],
  },
  {
    id: "roma",
    label: "Roma",
    tagline: "Rim na dva točka",
    cta: "PORUČI SVOJU ROMU",
    gender: "ženski",
    price: 107000,
    priceMonthly: 5500,
    images: [
      { color: "Crvena", mediaId: "49c0caf4-40fa-4190-9b6d-d2a182e30936", previewUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_3CaWWlU1U5XvtzueIN7HDPB2kLa/hf_20260702_152625_6e6d644f-3686-48ab-9b02-4efc6fdd130d.png", type: "hero" },
    ],
  },
  {
    id: "rapid",
    label: "Rapid",
    tagline: "Tvoj prvi skuter",
    cta: "PORUČI SVOJ RAPID",
    gender: "muški",
    price: 77000,
    priceMonthly: 3900,
    images: [
      { color: "Plava",       mediaId: "fc662cc3-56ea-485f-adbb-1f7cc35357d9", previewUrl: `${CDN}/Rapid_Plavi_4-3.jpg?v=1779236907`, type: "hero" },
      { color: "Siva",        mediaId: "0617db54-bad3-457a-b1a3-570056a1cbf0", previewUrl: `${CDN}/Rapid_Sivi_4-3.jpg?v=1779236923`, type: "hero" },
      { color: "Bela",        mediaId: "6aa76a4d-d80d-4b62-be6b-e497896416b4", previewUrl: `${CDN}/BeliRapid4-3.png?v=1779230502`, type: "hero" },
      { color: "Narandžasta", mediaId: "44174288-90a9-4053-8958-f7a0bdb65241", previewUrl: `${CDN}/Narandzasti_Rapid_4-3.png?v=1779236937`, type: "hero" },
    ],
  },
  {
    id: "mickey",
    label: "Mickey",
    tagline: "Veliki grad, mali heroj",
    cta: "PORUČI SVOJ MICKEY",
    gender: "muški",
    price: 55000,
    priceMonthly: 2800,
    images: [
      { color: "Bež",  mediaId: "96b7343d-7f9b-4c78-9eee-2ea86333a6cb", previewUrl: `${CDN}/MickeyBez4-3.png?v=1779237205`, type: "hero" },
      { color: "Crna", mediaId: "27709016-ac72-4368-b3f2-ddf05b9d3134", previewUrl: `${CDN}/MickeyCrni4-3.png?v=1779237219`, type: "hero" },
    ],
  },
  {
    id: "genon",
    label: "APE RYDER Genon Ultra",
    tagline: "TFT displej, Shimano menjač",
    cta: "PORUČI SVOJ GENON ULTRA",
    gender: "muški",
    price: 110000,
    priceMonthly: 5600,
    images: [
      { color: "Bež",  mediaId: "95b58993-6b0e-4cb0-82f0-d73fe899b6ae", previewUrl: `${CDN}/292029APERYDERGENONULTRAfrontthreequarter.jpg?v=1782290888`, type: "hero" },
      { color: "Siva", mediaId: "6a8568dc-64b0-4a87-b170-479cd20adf7c", previewUrl: `${CDN}/292029-Ssideview.jpg?v=1782290785`, type: "hero" },
      { color: "Crna", mediaId: "5b177e72-f8dd-45da-a0db-894949bb9649", previewUrl: `${CDN}/292029-Bsideview.jpg?v=1782290735`, type: "hero" },
    ],
  },
  {
    id: "mandril",
    label: "APE RYDER Mandril Ultra",
    tagline: "Hidraulične kočnice, svaki teren",
    cta: "PORUČI SVOJ MANDRIL ULTRA",
    gender: "muški",
    price: 127000,
    priceMonthly: 6500,
    images: [
      { color: "Bež",  mediaId: "2e518850-bc0a-4d79-9970-7df01dde3457", previewUrl: `${CDN}/292032rontthreequarter.jpg?v=1782291909`, type: "hero" },
      { color: "Siva", mediaId: "fe550644-bcb6-44f5-a055-413d821bbfcc", previewUrl: `${CDN}/292032-Ssideview.jpg?v=1782291958`, type: "hero" },
      { color: "Crna", mediaId: "e26ff7a4-cdce-4794-b972-8f07bb19f9f1", previewUrl: `${CDN}/292032-Bsideview.jpg?v=1782291948`, type: "hero" },
    ],
  },
  {
    id: "colobus",
    label: "APE RYDER Colobus A10",
    tagline: "Vrhunac linije",
    cta: "PORUČI SVOJ COLOBUS A10",
    gender: "muški",
    price: 136000,
    priceMonthly: 6900,
    images: [
      { color: "Žuta", mediaId: "398551d8-f88d-4233-9c7e-cb8adbf41ac5", previewUrl: `${CDN}/292030-Z_front_three_quarter.jpg?v=1782223061`, type: "hero" },
      { color: "Siva", mediaId: "bb12b2f7-f35f-4b04-bd34-bae28132db25", previewUrl: `${CDN}/292030_APERYDER_COLOBUS_side_view.jpg?v=1782222951`, type: "hero" },
    ],
  },
  {
    id: "kn_s1",
    label: "KN S1",
    tagline: "Tvoj prvi korak",
    cta: "PORUČI SVOJ KN S1",
    gender: "muški",
    price: 29000,
    priceMonthly: 1500,
    images: [
      { color: "Crna", mediaId: "da3faaac-35a7-4b2b-a627-27123bad6f10", previewUrl: `${CDN}/KNS14-3.png?v=1779237593`, type: "hero" },
    ],
  },
];

export function getModel(id: string) {
  return MODELS.find(m => m.id === id);
}

export function getImage(modelId: string, color: string) {
  const model = getModel(modelId);
  return model?.images.find(i => i.color === color) || model?.images[0];
}
