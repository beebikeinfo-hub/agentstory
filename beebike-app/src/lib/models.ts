export interface ModelImage {
  color: string;
  mediaId: string;
  type: "hero" | "detail";
  detailType?: "front" | "rear" | "dashboard" | "fork" | "side";
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
      { color: "Bež",      mediaId: "6f61dc53-07a9-4bcf-a38e-c43b9ebdee4a", type: "hero" },
      { color: "Crvena",   mediaId: "94f97752-b657-4afb-a92e-d40e3e41ff12", type: "hero" },
      { color: "Crna",     mediaId: "8ddbb722-ae72-4169-8969-ddeb7e18869b", type: "hero" },
      { color: "Tirkizna", mediaId: "374b1c0c-df2e-4a21-865f-1f2638d70b76", type: "hero" },
      { color: "Zelena",   mediaId: "781eccd7-4bcf-4c94-a8e4-75c3e6011c04", type: "hero" },
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
      { color: "Siva", mediaId: "7293a105-742a-4288-8d7c-69fd19126527", type: "hero" },
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
      { color: "Crvena", mediaId: "49c0caf4-40fa-4190-9b6d-d2a182e30936", type: "hero" },
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
      { color: "Plava",       mediaId: "fc662cc3-56ea-485f-adbb-1f7cc35357d9", type: "hero" },
      { color: "Siva",        mediaId: "0617db54-bad3-457a-b1a3-570056a1cbf0", type: "hero" },
      { color: "Bela",        mediaId: "6aa76a4d-d80d-4b62-be6b-e497896416b4", type: "hero" },
      { color: "Narandžasta", mediaId: "44174288-90a9-4053-8958-f7a0bdb65241", type: "hero" },
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
      { color: "Bež",  mediaId: "96b7343d-7f9b-4c78-9eee-2ea86333a6cb", type: "hero" },
      { color: "Crna", mediaId: "27709016-ac72-4368-b3f2-ddf05b9d3134", type: "hero" },
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
      { color: "Bež",  mediaId: "95b58993-6b0e-4cb0-82f0-d73fe899b6ae", type: "hero" },
      { color: "Siva", mediaId: "6a8568dc-64b0-4a87-b170-479cd20adf7c", type: "hero" },
      { color: "Crna", mediaId: "5b177e72-f8dd-45da-a0db-894949bb9649", type: "hero" },
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
      { color: "Bež",  mediaId: "2e518850-bc0a-4d79-9970-7df01dde3457", type: "hero" },
      { color: "Siva", mediaId: "fe550644-bcb6-44f5-a055-413d821bbfcc", type: "hero" },
      { color: "Crna", mediaId: "e26ff7a4-cdce-4794-b972-8f07bb19f9f1", type: "hero" },
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
      { color: "Žuta", mediaId: "398551d8-f88d-4233-9c7e-cb8adbf41ac5", type: "hero" },
      { color: "Siva", mediaId: "bb12b2f7-f35f-4b04-bd34-bae28132db25", type: "hero" },
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
      { color: "Crna", mediaId: "da3faaac-35a7-4b2b-a627-27123bad6f10", type: "hero" },
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
