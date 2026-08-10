export const SHIPMENT_FIELD_KEYS = [
  "senderName",
  "senderAddress",
  "recipientName",
  "shippingAddress1",
  "shippingAddress2",
  "shippingCity",
  "shippingState",
  "shippingPostCode",
  "shippingCountry",
  "recipientContact",
  "itemDescription",
  "weightKg",
  "declaredValue",
] as const;

export type ShipmentFieldKey = (typeof SHIPMENT_FIELD_KEYS)[number];

// First N keys (and matching labels in the dictionary) are sender fields;
// the rest are recipient/shipment fields — used to split the form into
// two visual sections.
export const SENDER_FIELD_COUNT = 2;
