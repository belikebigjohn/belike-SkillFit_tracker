/* Demo data — same shapes the REST API will return.
   Ported from the design stand (variants/assets/data.js). */

import type {
  Achievement,
  ChartSeries,
  Exercise,
  LeaderRow,
  MuscleSlice,
  PersonalRecord,
  Session,
  User,
  WeekSummary,
  WorkoutDetail,
} from "@/lib/types";

export const mockUser: User = {
  name: "Максим Орлов",
  initials: "МО",
  goal: "Набор массы",
  streak: 12,
  points: 2480,
  workouts: 34,
  rank: 4,
};

export const mockWeek: WeekSummary = {
  label: "19–25 октября",
  volumeKg: 12480,
  targetKg: 15000,
  points: 636,
  pointsTarget: 750,
  workouts: 3,
  workoutsTarget: 4,
  minutes: 161,
  deltaPct: 18,
  exercises: 41,
};

export const mockCharts: Record<"weeks" | "months" | "year", ChartSeries> = {
  weeks: {
    label: "8 недель",
    labels: ["1 сен", "8 сен", "15 сен", "22 сен", "29 сен", "6 окт", "13 окт", "20 окт"],
    values: [8400, 9200, 8800, 10400, 11100, 9900, 10800, 12480],
    avg: 9800,
    best: 12480,
  },
  months: {
    label: "6 месяцев",
    labels: ["май", "июн", "июл", "авг", "сен", "окт"],
    values: [26400, 31200, 28800, 34500, 38900, 42800],
    avg: 33767,
    best: 42800,
  },
  year: {
    label: "Год",
    labels: ["ноя", "дек", "янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт"],
    values: [21800, 19400, 24600, 27300, 25100, 29800, 26400, 31200, 28800, 34500, 38900, 42800],
    avg: 29242,
    best: 42800,
  },
};

export const mockMuscles: MuscleSlice[] = [
  { name: "Ноги", pct: 28, color: "#c8f751" },
  { name: "Спина", pct: 24, color: "#6ee7b7" },
  { name: "Грудь", pct: 21, color: "#8fb33a" },
  { name: "Плечи", pct: 15, color: "#4e7a5e" },
  { name: "Руки", pct: 12, color: "#2f4038" },
];

export const mockAchievements: Achievement[] = [
  { code: "first", title: "Первый шаг", desc: "Первая тренировка", icon: "zap", date: "2 сен", unlocked: true },
  { code: "five", title: "Пять тренировок", desc: "5 занятий в журнале", icon: "check", date: "18 сен", unlocked: true },
  { code: "ten", title: "Десятка", desc: "10 тренировок", icon: "layers", date: "6 окт", unlocked: true },
  { code: "streak7", title: "Серия 7 дней", desc: "Неделя без пропусков", icon: "flame", date: "15 окт", unlocked: true },
  { code: "tons10", title: "10 тонн", desc: "10 000 кг за неделю", icon: "medal", date: "19 окт", unlocked: true },
  { code: "groups3", title: "Три группы", desc: "Грудь, спина и ноги", icon: "target", date: "19 окт", unlocked: true },
  { code: "points1k", title: "1000 очков", desc: "Первая тысяча", icon: "trophy", date: "20 окт", unlocked: true },
  { code: "streak30", title: "Серия 30 дней", desc: "Ещё 18 дней", icon: "lock", date: "", unlocked: false, progress: 12, total: 30 },
];

export const mockLeaderboard: LeaderRow[] = [
  { rank: 1, name: "Мария Ветрова", initials: "МВ", points: 3120, workouts: 41, volumeKg: 148200, streak: 21, from: "#d9ff6e", to: "#6ee7b7", me: false },
  { rank: 2, name: "Артём Соколов", initials: "АС", points: 2940, workouts: 38, volumeKg: 139400, streak: 9, from: "#8fb33a", to: "#4e7a5e", me: false },
  { rank: 3, name: "Дана Гареева", initials: "ДГ", points: 2610, workouts: 36, volumeKg: 121600, streak: 14, from: "#6ee7b7", to: "#2f7d63", me: false },
  { rank: 4, name: "Максим Орлов", initials: "МО", points: 2480, workouts: 34, volumeKg: 116800, streak: 12, from: "#c8f751", to: "#6ee7b7", me: true },
  { rank: 5, name: "Илья Ковалёв", initials: "ИК", points: 2210, workouts: 31, volumeKg: 98400, streak: 5, from: "#d9e8c7", to: "#8fb33a", me: false },
  { rank: 6, name: "Софья Лебедева", initials: "СЛ", points: 2040, workouts: 29, volumeKg: 91200, streak: 8, from: "#ffc857", to: "#c8f751", me: false },
  { rank: 7, name: "Тимур Хайруллин", initials: "ТХ", points: 1890, workouts: 27, volumeKg: 84600, streak: 3, from: "#9aa7a0", to: "#5c6b62", me: false },
  { rank: 8, name: "Ника Соловьёва", initials: "НС", points: 1720, workouts: 24, volumeKg: 76300, streak: 6, from: "#a9e02c", to: "#3f6b58", me: false },
];

export const mockSessions: Session[] = [
  {
    id: "w-103", weekday: "ЧТ", day: "22", month: "окт", date: "22 октября",
    title: "Ноги и ягодицы", group: "Ноги", exercises: 4, minutes: 41,
    volumeKg: 3500, points: 62, top: "Приседания со штангой · 80 кг × 8", today: true,
  },
  {
    id: "w-102", weekday: "СР", day: "21", month: "окт", date: "21 октября",
    title: "Спина и бицепс", group: "Спина", exercises: 5, minutes: 58,
    volumeKg: 4860, points: 78, top: "Становая тяга · 110 кг × 5", today: false,
  },
  {
    id: "w-101", weekday: "ПН", day: "19", month: "окт", date: "19 октября",
    title: "Грудь и трицепс", group: "Грудь", exercises: 6, minutes: 62,
    volumeKg: 4120, points: 70, top: "Жим лёжа · 82,5 кг × 6 · рекорд", today: false, record: true,
  },
  {
    id: "w-100", weekday: "ВС", day: "16", month: "окт", date: "16 октября",
    title: "Бег в парке", group: "Кардио", exercises: 1, minutes: 34,
    volumeKg: 0, points: 34, top: "5 км · средний темп 6:48", today: false,
  },
  {
    id: "w-99", weekday: "ПТ", day: "14", month: "окт", date: "14 октября",
    title: "Плечи и руки", group: "Плечи", exercises: 5, minutes: 48,
    volumeKg: 3240, points: 58, top: "Жим гантелей сидя · 22 кг × 10", today: false,
  },
];

export const mockWorkoutDetails: Record<string, WorkoutDetail> = {
  "w-103": {
    id: "w-103", title: "Ноги и ягодицы", performedAt: "2026-10-22", group: "Ноги",
    notes: "Передняя стойка, темп спокойный. Отметила 8-е повторение на 80 кг.",
    minutes: 41, volumeKg: 3500, points: 62,
    items: [
      { id: "we-1", exerciseId: "e-squat", name: "Приседания со штангой", order: 1, sets: [{ reps: 8, weightKg: 60 }, { reps: 8, weightKg: 70 }, { reps: 8, weightKg: 80 }, { reps: 6, weightKg: 80 }] },
      { id: "we-2", exerciseId: "e-press", name: "Жим ногами в тренажёре", order: 2, sets: [{ reps: 12, weightKg: 140 }, { reps: 12, weightKg: 160 }, { reps: 10, weightKg: 160 }] },
      { id: "we-3", exerciseId: "e-hyper", name: "Гиперэкстензия", order: 3, sets: [{ reps: 15, weightKg: 10 }, { reps: 15, weightKg: 10 }, { reps: 12, weightKg: 10 }] },
      { id: "we-4", exerciseId: "e-calf", name: "Подъёмы на носки стоя", order: 4, sets: [{ reps: 16, weightKg: 40 }, { reps: 16, weightKg: 40 }, { reps: 14, weightKg: 40 }] },
    ],
  },
  "w-102": {
    id: "w-102", title: "Спина и бицепс", performedAt: "2026-10-21", group: "Спина",
    notes: "Становая 110 кг пошла уверенно — на следующей неделе пробуем 115.",
    minutes: 58, volumeKg: 4860, points: 78,
    items: [
      { id: "we-5", exerciseId: "e-deadlift", name: "Становая тяга", order: 1, sets: [{ reps: 6, weightKg: 90 }, { reps: 5, weightKg: 100 }, { reps: 5, weightKg: 110 }, { reps: 4, weightKg: 110 }] },
      { id: "we-6", exerciseId: "e-pullup", name: "Подтягивания", order: 2, sets: [{ reps: 8, weightKg: 0 }, { reps: 7, weightKg: 0 }, { reps: 6, weightKg: 0 }] },
      { id: "we-7", exerciseId: "e-row", name: "Тяга штанги в наклоне", order: 3, sets: [{ reps: 10, weightKg: 50 }, { reps: 10, weightKg: 50 }, { reps: 8, weightKg: 55 }] },
      { id: "we-8", exerciseId: "e-curl", name: "Подъём штанги на бицепс", order: 4, sets: [{ reps: 12, weightKg: 20 }, { reps: 10, weightKg: 22.5 }, { reps: 10, weightKg: 22.5 }] },
      { id: "we-9", exerciseId: "e-hammer", name: "Молотки с гантелями", order: 5, sets: [{ reps: 12, weightKg: 10 }, { reps: 12, weightKg: 10 }, { reps: 10, weightKg: 12 }] },
    ],
  },
  "w-101": {
    id: "w-101", title: "Грудь и трицепс", performedAt: "2026-10-19", group: "Грудь",
    notes: "Рекорд жима: 82,5 кг на 6 раз. Локти держал близко к корпусу.",
    minutes: 62, volumeKg: 4120, points: 70,
    items: [
      { id: "we-10", exerciseId: "e-bench", name: "Жим лёжа", order: 1, sets: [{ reps: 8, weightKg: 60 }, { reps: 6, weightKg: 72.5 }, { reps: 6, weightKg: 82.5 }, { reps: 5, weightKg: 82.5 }] },
      { id: "we-11", exerciseId: "e-incline", name: "Жим гантелей на наклонной", order: 2, sets: [{ reps: 10, weightKg: 22 }, { reps: 10, weightKg: 22 }, { reps: 8, weightKg: 24 }] },
      { id: "we-12", exerciseId: "e-fly", name: "Разводка гантелей лёжа", order: 3, sets: [{ reps: 12, weightKg: 10 }, { reps: 12, weightKg: 10 }, { reps: 10, weightKg: 12 }] },
      { id: "we-13", exerciseId: "e-dip", name: "Отжимания на брусьях", order: 4, sets: [{ reps: 10, weightKg: 0 }, { reps: 8, weightKg: 0 }, { reps: 8, weightKg: 0 }] },
      { id: "we-14", exerciseId: "e-pushdown", name: "Французский жим", order: 5, sets: [{ reps: 12, weightKg: 20 }, { reps: 10, weightKg: 22.5 }, { reps: 10, weightKg: 22.5 }] },
      { id: "we-15", exerciseId: "e-kickback", name: "Разгибания на блоке", order: 6, sets: [{ reps: 14, weightKg: 12 }, { reps: 14, weightKg: 12 }, { reps: 12, weightKg: 14 }] },
    ],
  },
  "w-100": {
    id: "w-100", title: "Бег в парке", performedAt: "2026-10-16", group: "Кардио",
    notes: "Легко по пульсу, темп держал ровно.",
    minutes: 34, volumeKg: 0, points: 34,
    items: [
      { id: "we-16", exerciseId: "e-run", name: "Бег на улице", order: 1, sets: [{ reps: 1, weightKg: 0 }] },
    ],
  },
  "w-99": {
    id: "w-99", title: "Плечи и руки", performedAt: "2026-10-14", group: "Плечи",
    notes: "Жим сидя 22 кг × 10 — техника без читинга.",
    minutes: 48, volumeKg: 3240, points: 58,
    items: [
      { id: "we-17", exerciseId: "e-ohp", name: "Жим гантелей сидя", order: 1, sets: [{ reps: 10, weightKg: 18 }, { reps: 10, weightKg: 20 }, { reps: 10, weightKg: 22 }] },
      { id: "we-18", exerciseId: "e-lateral", name: "Махи гантелей в стороны", order: 2, sets: [{ reps: 14, weightKg: 8 }, { reps: 12, weightKg: 8 }, { reps: 12, weightKg: 10 }] },
      { id: "we-19", exerciseId: "e-facepull", name: "Тяга к лицу на блоке", order: 3, sets: [{ reps: 14, weightKg: 15 }, { reps: 14, weightKg: 15 }, { reps: 12, weightKg: 17.5 }] },
      { id: "we-20", exerciseId: "e-curl", name: "Подъём штанги на бицепс", order: 4, sets: [{ reps: 12, weightKg: 20 }, { reps: 10, weightKg: 22.5 }] },
      { id: "we-21", exerciseId: "e-pushdown", name: "Разгибания на блоке", order: 5, sets: [{ reps: 14, weightKg: 12 }, { reps: 12, weightKg: 14 }] },
    ],
  },
};

export const mockExercises: Exercise[] = [
  { id: "e-squat", name: "Приседания со штангой", muscleGroup: "Ноги", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=barbell+squat+form", description: "Базовое движение для ног и ягодиц. Пятки прижаты, спина прямая, колено по направлению носка." },
  { id: "e-press", name: "Жим ногами в тренажёре", muscleGroup: "Ноги", equipment: "Тренажёр", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=leg+press", description: "Мощная нагрузка на квадрицепс без осевой нагрузки на позвоночник." },
  { id: "e-deadlift", name: "Становая тяга", muscleGroup: "Спина", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=deadlift+form", description: "Самое объёмное движение: спина, ноги, хват. Снимайте штангу с середины стопы." },
  { id: "e-pullup", name: "Подтягивания", muscleGroup: "Спина", equipment: "Свой вес", mediaType: "animation", mediaUrl: "https://www.youtube.com/results?search_query=pull+up+technique", description: "Вертикальная тяга для широчайших. Полный диапазон — до параллели и выше." },
  { id: "e-row", name: "Тяга штанги в наклоне", muscleGroup: "Спина", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=bent+over+row", description: "Толчковое движение для толщины спины. Корпус 45°, лопатки сводите в верхней точке." },
  { id: "e-hyper", name: "Гиперэкстензия", muscleGroup: "Спина", equipment: "Римский стул", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=back+extension", description: "Укрепление разгибателей спины и бицепса бедра. Не переразгибайте вверху." },
  { id: "e-bench", name: "Жим лёжа", muscleGroup: "Грудь", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=bench+press+form", description: "Главное жимовое движение для груди и трицепса. Лопатки сведены, лёгкий прогиб." },
  { id: "e-incline", name: "Жим гантелей на наклонной", muscleGroup: "Грудь", equipment: "Гантели", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=incline+dumbbell+press", description: "Акцент на верх груди. Угол скамьи 30–45°." },
  { id: "e-fly", name: "Разводка гантелей лёжа", muscleGroup: "Грудь", equipment: "Гантели", mediaType: "animation", mediaUrl: "https://www.youtube.com/results?search_query=dumbbell+fly", description: "Изоляция груди через растяжение. Локти чуть согнуты, движение медленное." },
  { id: "e-dip", name: "Отжимания на брусьях", muscleGroup: "Грудь", equipment: "Свой вес", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=parallel+bar+dips", description: "Корпус с наклоном — акцент на грудь, вертикальный — на трицепс." },
  { id: "e-ohp", name: "Жим гантелей сидя", muscleGroup: "Плечи", equipment: "Гантели", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=seated+dumbbell+press", description: "Базовый жим для дельт. Спинка скамьи 85°, не прогибайте поясницу." },
  { id: "e-lateral", name: "Махи гантелей в стороны", muscleGroup: "Плечи", equipment: "Гантели", mediaType: "animation", mediaUrl: "https://www.youtube.com/results?search_query=lateral+raise", description: "Средняя дельта — ширина плеч. Вес меньше, чем хочется, техника важнее." },
  { id: "e-facepull", name: "Тяга к лицу на блоке", muscleGroup: "Плечи", equipment: "Блок", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=face+pull", description: "Задняя дельта и ротаторы — здоровье плеча. Тяните к уровню глаз." },
  { id: "e-curl", name: "Подъём штанги на бицепс", muscleGroup: "Руки", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=barbell+curl", description: "Классика для бицепса. Локти прижаты, корпус не раскачивайте." },
  { id: "e-hammer", name: "Молотки с гантелями", muscleGroup: "Руки", equipment: "Гантели", mediaType: "animation", mediaUrl: "https://www.youtube.com/results?search_query=hammer+curl", description: "Бицепс и брахиалис — рука в толщину. Нейтральный хват." },
  { id: "e-pushdown", name: "Разгибания на блоке", muscleGroup: "Руки", equipment: "Блок", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=triceps+pushdown", description: "Изоляция трицепса. Локти неподвижны, разгибайте до полного выпрямления." },
  { id: "e-kickback", name: "Французский жим", muscleGroup: "Руки", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=close+grip+bench+press", description: "Длинная головка трицепса. Узкий хват, локти идут вдоль корпуса." },
  { id: "e-calf", name: "Подъёмы на носки стоя", muscleGroup: "Ноги", equipment: "Тренажёр", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=standing+calf+raise", description: "Икры любят полную амплитуду и паузу в нижней точке." },
  { id: "e-run", name: "Бег на улице", muscleGroup: "Кардио", equipment: "Кроссовки", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=running+cadence+tips", description: "Ровный темп и каденс 160–180 шагов в минуту берегут колени." },
];

export const mockRecords: PersonalRecord[] = [
  { name: "Жим лёжа", value: "82,5", unit: "кг", date: "19 окт" },
  { name: "Становая тяга", value: "120", unit: "кг", date: "21 сен" },
  { name: "Приседания", value: "100", unit: "кг", date: "5 окт" },
];

export const mockSparklines: Record<string, number[]> = {
  points: [12, 18, 15, 24, 22, 30, 26, 34],
  streak: [4, 4, 5, 5, 6, 7, 7, 8],
  workouts: [8, 10, 9, 12, 11, 13, 12, 14],
  volume: [22, 26, 24, 30, 28, 33, 31, 36],
};
