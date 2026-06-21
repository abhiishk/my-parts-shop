import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { api } from "../../lib/api";

export const Layout = () => {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    api.settings().then(setSettings).catch(() => {});
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} />
      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
      <WhatsAppButton settings={settings} />
    </div>
  );
};
