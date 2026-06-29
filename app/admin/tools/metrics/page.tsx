import { getToolMetricsInsights } from "../../../lib/tool-insights";
import AdminToolMetricsExperience from "./AdminToolMetricsExperience";

type SearchParams = Promise<{ tool?: string }>;

export default async function AdminToolMetricsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const data = await getToolMetricsInsights();
  const initialTool = params.tool ?? "budget-planner";

  return <AdminToolMetricsExperience initialData={data} initialTool={initialTool} />;
}
