import { Suspense } from "react";
import OrderLookupClient from "./order-lookup-client";

export default function OrderLookupPage({
  searchParams
}: {
  searchParams?: { resi?: string };
}) {
  const initialResi = typeof searchParams?.resi === "string" ? searchParams.resi : "";

  return (
    <Suspense fallback={<div className="container py-10" />}>
      <OrderLookupClient initialResi={initialResi} />
    </Suspense>
  );
}