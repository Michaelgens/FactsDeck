import { Mail, Send, FileText, ToggleLeft } from "lucide-react";
import FunnelSettings from "./FunnelSettings";

export default function AdminMarketingFunnelPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100">
          Marketing Funnel
        </h1>
        <p className="text-slate-600 dark:text-purple-300 mt-1">
          Send emails to subscribers when you publish a new post
        </p>
      </div>

      <FunnelSettings />
    </div>
  );
}
