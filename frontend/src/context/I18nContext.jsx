import { createContext, useContext, useState } from "react";

const dict = {
  en: {
    search_placeholder: "Search by SKU, Part Number, or Printer Model",
    shop: "Shop", categories: "Categories", brands: "Brands", blog: "Blog", account: "Account",
    cart: "Cart", login: "Login", add_to_cart: "Add to Cart", buy_now: "Buy Now",
    in_stock: "In Stock", out_of_stock: "Out of Stock", best_selling: "Best Selling",
    new_arrivals: "New Arrivals", featured_categories: "Featured Categories",
    popular_brands: "Popular Brands", view_all: "View All", checkout: "Checkout",
  },
  hi: {
    search_placeholder: "SKU, पार्ट नंबर या प्रिंटर मॉडल खोजें",
    shop: "शॉप", categories: "श्रेणियाँ", brands: "ब्रांड", blog: "ब्लॉग", account: "खाता",
    cart: "कार्ट", login: "लॉगिन", add_to_cart: "कार्ट में डालें", buy_now: "अभी खरीदें",
    in_stock: "स्टॉक में", out_of_stock: "स्टॉक ख़त्म", best_selling: "बेस्ट सेलिंग",
    new_arrivals: "नए आगमन", featured_categories: "विशेष श्रेणियाँ",
    popular_brands: "लोकप्रिय ब्रांड", view_all: "सभी देखें", checkout: "चेकआउट",
  },
};

const I18nContext = createContext(null);
export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("ps_lang") || "en");
  const toggle = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("ps_lang", next);
  };
  const t = (key) => dict[lang][key] || dict.en[key] || key;
  const pn = (product) => (lang === "hi" && product?.name_hi ? product.name_hi : product?.name_en);
  return <I18nContext.Provider value={{ lang, toggle, t, pn }}>{children}</I18nContext.Provider>;
}
