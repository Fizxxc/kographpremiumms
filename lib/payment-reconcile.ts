import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { fulfillProductOrder, settleWalletTopup } from "@/lib/fulfillment";
import { getPakasirTransactionDetail, normalizePakasirStatus } from "@/lib/pakasir";

export async function syncPakasirOrderState(orderId: string) {
  if (!orderId.startsWith("KGP-")) return null;

  const admin = createAdminSupabaseClient();

  const { data: tx } = await admin
    .from("transactions")
    .select("id, order_id, final_amount, amount")
    .eq("order_id", orderId)
    .maybeSingle();

  const { data: topup } = await admin
    .from("wallet_topups")
    .select("id, order_id, amount")
    .eq("order_id", orderId)
    .maybeSingle();

  const grossAmount = Number((tx as any)?.final_amount || (tx as any)?.amount || (topup as any)?.amount || 0);
  if (!grossAmount) return null;

  const detailPayload = await getPakasirTransactionDetail({ orderId, amount: grossAmount }).catch(() => null);
  if (!detailPayload?.transaction) return null;

  const transaction = detailPayload.transaction;
  const status = normalizePakasirStatus(transaction.status);
  const paymentMethod = String(transaction.payment_method || "qris").toLowerCase();
  const paidAt = transaction.completed_at || null;

  if (tx?.id) {
    await admin
      .from("transactions")
      .update({
        status,
        payment_method: paymentMethod,
        paid_at: paidAt,
        gateway_name: "pakasir",
        gateway_reference: String(transaction.order_id || orderId),
        gateway_payload: detailPayload
      })
      .eq("id", tx.id);
  }

  if (topup?.id) {
    await admin
      .from("wallet_topups")
      .update({
        status,
        paid_at: paidAt,
        gateway_name: "pakasir",
        gateway_reference: String(transaction.order_id || orderId),
        gateway_payload: detailPayload
      })
      .eq("id", topup.id);
  }

  if (status === "settlement") {
    if (topup?.id) {
      await settleWalletTopup(orderId);
      return { type: "topup", status };
    }
    if (tx?.id) {
      await fulfillProductOrder(orderId);
      return { type: "transaction", status };
    }
  }

  return { type: tx?.id ? "transaction" : topup?.id ? "topup" : "unknown", status };
}
