import { getToolDirectoryInsights } from "../../lib/tools-directory";
import { getToolMetricsInsights } from "../../lib/tool-insights";
import AdminToolsExperience from "./AdminToolsExperience";

export default async function AdminToolsPage() {
  const directory = getToolDirectoryInsights();
  const metrics = await getToolMetricsInsights();

  return <AdminToolsExperience initialDirectory={directory} initialMetrics={metrics} />;
}
