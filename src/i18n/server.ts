import { cookies } from "next/headers";
import pt from "./pt";
import en from "./en";

type Lang = "pt" | "en";

export async function getServerTranslations() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang) ?? "pt";
  const safeLang: Lang = lang === "en" ? "en" : "pt";
  return { t: safeLang === "en" ? en : pt, lang: safeLang };
}
