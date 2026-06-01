import { exportSubscribersCsv } from "../../../lib/subscriber-actions";

export async function GET() {
  const csv = await exportSubscribersCsv();
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="factsdeck-subscribers-${date}.csv"`,
    },
  });
}
