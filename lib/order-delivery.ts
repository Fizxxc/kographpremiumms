export type DeliveryField = {
  label: string;
  value: string;
};

function toSingleRecord<T = any>(input: any): T | null {
  if (!input) return null;
  if (Array.isArray(input)) return (input[0] as T) || null;
  return input as T;
}

function titleFromKey(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function parseCredentialMap(input: any): Record<string, string> {
  if (!input) return {};

  if (typeof input === "object" && !Array.isArray(input)) {
    return Object.entries(input).reduce<Record<string, string>>((result, [key, value]) => {
      const text = String(value ?? "").trim();
      if (text) result[key] = text;
      return result;
    }, {});
  }

  const source = String(input || "").trim();
  if (!source) return {};

  try {
    const parsed = JSON.parse(source);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed).reduce<Record<string, string>>((result, [key, value]) => {
        const text = String(value ?? "").trim();
        if (text) result[key] = text;
        return result;
      }, {});
    }
  } catch {
    // ignore invalid JSON and fallback to text parsing below
  }

  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((result, line) => {
      const [rawKey, ...rest] = line.split(":");
      const key = String(rawKey || "").trim();
      const value = rest.join(":").trim();
      if (key && value) result[key] = value;
      return result;
    }, {});
}

export function buildDeliveryFields(input: { fulfillmentData?: any; credential?: any }) {
  const fulfillmentData = input.fulfillmentData || {};
  const credentialRecord = toSingleRecord<any>(input.credential);
  const credentialMap = parseCredentialMap(credentialRecord?.account_data || fulfillmentData.credential_data || null);

  const preferredPanelFields: DeliveryField[] = [
    ["Panel URL", fulfillmentData.panel_url],
    ["Username", fulfillmentData.panel_username],
    ["Email Login", fulfillmentData.panel_email],
    ["Password", fulfillmentData.panel_password],
    ["Server UUID", fulfillmentData.server_uuid],
  ]
    .map(([label, value]) => ({ label, value: String(value || "").trim() }))
    .filter((item) => item.value);

  if (preferredPanelFields.length > 0) return preferredPanelFields;

  const fallbackFields = Object.entries(credentialMap).map(([key, value]) => ({
    label: titleFromKey(key),
    value: String(value || "").trim(),
  })).filter((item) => item.value);

  return fallbackFields;
}

export function buildDeliveryText(fields: DeliveryField[]) {
  return fields.map((field) => `${field.label}: ${field.value}`).join("\n");
}

export function hasDeliveryData(input: { fulfillmentData?: any; credential?: any }) {
  return buildDeliveryFields(input).length > 0;
}
