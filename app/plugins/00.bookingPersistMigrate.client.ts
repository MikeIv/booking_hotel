/**
 * Раньше booking-store жил в cookie (~4KB лимит) и обрезался.
 * Persist переведён на localStorage — один раз переносим cookie → localStorage и чистим cookie.
 */
export default defineNuxtPlugin(() => {
  if (typeof document === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  const cookieRow = document.cookie
    .split("; ")
    .find((row) => row.startsWith("booking-store="));
  if (!cookieRow) return;

  const encoded = cookieRow.slice("booking-store=".length);
  if (!localStorage.getItem("booking-store") && encoded) {
    try {
      localStorage.setItem("booking-store", decodeURIComponent(encoded));
    } catch {
      // квота / битый cookie — просто удаляем cookie ниже
    }
  }

  document.cookie = "booking-store=; Max-Age=0; path=/; SameSite=Lax";
});
