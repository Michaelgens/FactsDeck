import FunnelSettings from "./FunnelSettings";
import { AdminPageHeader } from "../../components/admin-ui";

export default function AdminMarketingFunnelPage() {
  return (
    <div>
      <AdminPageHeader
        title="Marketing funnel"
        description="Send emails to subscribers when you publish a new post."
      />
      <FunnelSettings />
    </div>
  );
}
