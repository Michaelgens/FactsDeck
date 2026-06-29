import { getAnalyticsInsights } from "../../lib/admin-insights";
import AdminAnalyticsExperience from "./AdminAnalyticsExperience";

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsInsights();
  const vercelProject = process.env.VERCEL_PROJECT_NAME || "factsdeck";
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://vercel.com/dashboard";

  return (
    <AdminAnalyticsExperience
      initialData={data}
      vercelProject={vercelProject}
      vercelUrl={vercelUrl}
    />
  );
}
