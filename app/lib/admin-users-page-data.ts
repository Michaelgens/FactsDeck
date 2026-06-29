import { getSubscriberInsights, type SubscriberInsights } from "./admin-insights";
import { getSubscribers, type Subscriber } from "./subscriber-actions";

export type AdminUsersPageData = {
  subscribers: Subscriber[];
  insights: SubscriberInsights;
};

export async function loadAdminUsersPageData(): Promise<AdminUsersPageData> {
  const [subscribers, insights] = await Promise.all([getSubscribers(), getSubscriberInsights()]);
  return { subscribers, insights };
}
