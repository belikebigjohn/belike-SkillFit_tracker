/** Russian plural form picker: pluralRu(2, ["день", "дня", "дней"]) → "дня". */
export function pluralRu(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export const DAYS_FORMS: [string, string, string] = ["день", "дня", "дней"];
export const WORKOUTS_FORMS: [string, string, string] = ["тренировка", "тренировки", "тренировок"];
