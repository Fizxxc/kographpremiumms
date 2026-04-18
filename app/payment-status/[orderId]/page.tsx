import { redirect } from "next/navigation";

export default function PaymentStatusAliasPage({
  params,
  searchParams
}: {
  params: { orderId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = new URLSearchParams();

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }
    if (typeof value === "string" && value.length > 0) {
      query.set(key, value);
    }
  });

  const suffix = query.toString();
  redirect(`/waiting-payment/${encodeURIComponent(params.orderId)}${suffix ? `?${suffix}` : ""}`);
}
