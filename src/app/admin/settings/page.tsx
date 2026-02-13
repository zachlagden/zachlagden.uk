import { getAllSiteSettings, getHomepageHero } from "@/lib/content/site";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const [settings, hero] = await Promise.all([
    getAllSiteSettings(),
    getHomepageHero(),
  ]);

  return <SettingsAdmin settings={settings} hero={hero} />;
}
