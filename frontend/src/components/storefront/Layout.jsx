import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { MobileBottomNav } from "./MobileBottomNav";
import { api } from "../../lib/api";

export const Layout = () => {
  const [settings, setSettings] = useState(null);
  useEffect(() => { api.settings().then(setSettings).catch(() => {}); }, []);
  return (
    <div className="flex flex-col min-h-screen bg-[#F1F3F6]">
      <Header settings={settings} />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
      <WhatsAppButton settings={settings} />
      <MobileBottomNav />
    </div>
  );
};
