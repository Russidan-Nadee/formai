export const SHIPMENT_FIELD_KEYS = [
  "recipientName",
  "destinationCountry",
  "shippingAddress",
  "itemDescription",
  "weightKg",
  "declaredValue",
] as const;

export type ShipmentFieldKey = (typeof SHIPMENT_FIELD_KEYS)[number];
