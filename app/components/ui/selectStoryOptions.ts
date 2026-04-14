/** Общие опции для демо FilterSelect в Storybook (как на /rooms). */
export const FILTER_VIEW_OPTIONS = [
  { id: 0, title: "Все типы видов из окна" },
  { id: 1, title: "Парк" },
  { id: 2, title: "Город" },
  { id: 3, title: "Море" },
  { id: 4, title: "Внутренний двор" },
] as const;

export const FILTER_BALCONY_OPTIONS = [
  { id: 0, title: "Балкон" },
  { id: 1, title: "Есть балкон" },
  { id: 2, title: "Нет балкона" },
] as const;
