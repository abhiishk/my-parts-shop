import { MessageCircle } from "lucide-react";

export const WhatsAppButton = ({ settings }) => {
  const number = settings?.whatsapp_number || "919999999999";
  return (
    <a
      data-testid="whatsapp-cta"
      href={`https://wa.me/${number}?text=Hi%20PartStation,%20I%20need%20help%20with%20a%20product`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      aria-label="WhatsApp Support"
    >
      <MessageCircle size={28} className="text-white" fill="white" />
    </a>
  );
};
