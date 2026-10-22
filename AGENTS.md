# professionals — «Форма роста»

Конкурсное задание «Профессионалы 2026», компетенция «Веб-технологии».
Сервис фитнес-трекинга с геймификацией: тренировки и результаты, поиск упражнений, прогресс, очки, достижения, рейтинг.
8 часов, два модуля по 4 ч: **A** — клиент (интерфейс), **B** — сервер (REST API + хранилище).
Критерии: соответствие кейсу 25 · дизайн и погружение 30 · функциональность 30 · стабильность и завершённость 15.

Приоритет: 60 % оценки — дизайн и работающая функциональность. Бэкенд делаем ровно настолько, насколько нужно фронту. Время — на экраны, данные и полировку.

Статус: кода ещё нет, стек зафиксирован. Следующий шаг — scaffold и зелёный `npm run build` до первой фичи.

## Стек

- Node 22, npm (`pnpm` в системе нет; `npm.ps1` блокирует ExecutionPolicy — вызывать `npm.cmd`).
- Next.js 15.5.x (App Router) + React 19 + TypeScript strict. Один процесс: фронт и API, без CORS и второго терминала. Next 16 не берём: незнакомые изменения на 8-часовом бюджете дороже выгоды.
- Tailwind CSS v4 + shadcn/ui + lucide-react.
- Motion (`motion/react`) для анимаций, Recharts для графиков.
- Drizzle ORM + better-sqlite3, файл `data/app.db`. Fallback, если нативный модуль не ставится: JSON-файл за тем же интерфейсом `lib/repo`.
- Zod — валидация на границе API и форм.
- Auth: bcryptjs + JWT-сессия в httpOnly cookie (`jose`). Без NextAuth, без внешних сервисов.
- Шрифты через `@fontsource-variable/unbounded` (заголовки) и `@fontsource-variable/onest` (текст, цифры `tabular-nums`). Кириллица, без сетевых запросов в рантайме.
- Тесты — Vitest только для `lib/scoring.ts`; CI и покрытие не нужны.

Версии фиксировать точные после scaffold, `package-lock.json` — в git. Обновлять зависимости по ходу конкурса запрещено.

## Команды

```
install:      npm install
dev:          npm run dev
db:push:      npx drizzle-kit push
db:seed:      npm run db:seed
lint:         npx eslint .
typecheck:    npx tsc --noEmit
build:        npm run build
```

`npm run dev` должен поднимать приложение с уже засеянной базой: судья не должен ничего настраивать.
Демо-аккаунт и порядок запуска — в README.

## Структура

```
src/app/(auth)/login, register
src/app/(app)/dashboard          сводка, прогресс, достижения, мини-рейтинг
src/app/(app)/workouts           список + создание
src/app/(app)/workouts/[id]      тренировка: упражнения, результаты, редактирование
src/app/(app)/exercises          каталог: поиск, фильтр по группе мышц, инструкция, видео
src/app/(app)/leaderboard        рейтинг по метрике
src/app/(app)/profile            профиль, история, достижения
src/app/api/*                    REST
src/components/ui                shadcn
src/components/app               доменные компоненты
src/components/charts            обёртки Recharts
src/lib/db.ts, schema.ts, auth.ts, scoring.ts, validators.ts, api-client.ts
src/db/seed.ts
docs/decisions.md
```

## Модель данных

- `User`: id, email (unique), passwordHash, name, goal, createdAt.
- `Exercise`: id, name, muscleGroup, description, mediaUrl, mediaType (`video` | `animation`), equipment.
- `Workout`: id, userId, title, performedAt, notes.
- `WorkoutExercise`: id, workoutId, exerciseId, order, sets, reps, weightKg, durationSec, distanceM, note.
- `Achievement`: id, code, title, description, icon.
- `UserAchievement`: userId, achievementId, unlockedAt.
- `PointEvent`: id, userId, amount, reason, workoutId, createdAt.

Правило: единицы — в имени поля (`weightKg`, `durationSec`, `distanceM`). Никаких «просто number».

## API (REST, JSON)

| Метод | Путь | Что делает |
|---|---|---|
| POST | `/api/auth/register` | регистрация, ставит cookie |
| POST | `/api/auth/login` | вход |
| POST | `/api/auth/logout` | выход |
| GET/PATCH | `/api/me` | профиль |
| GET | `/api/exercises?q=&muscle=` | поиск упражнений |
| GET/POST | `/api/workouts` | список / создание |
| GET/PATCH/DELETE | `/api/workouts/:id` | тренировка |
| POST/DELETE | `/api/workouts/:id/exercises` | добавить/убрать упражнение |
| GET | `/api/stats?period=week\|month\|all` | агрегаты для графиков |
| GET | `/api/leaderboard?metric=points\|workouts\|volume\|streak` | рейтинг |
| GET | `/api/achievements` | достижения пользователя |

Ошибки: `{ error: { code, message, fields? } }`, статусы 400/401/403/404/409/500. Доступ к чужим тренировкам — 403/404, не 200.
Клиент ходит только через `lib/api-client.ts`. В модуле A тот же интерфейс отдаёт мок-адаптер — компоненты не знают, откуда данные.

## Геймификация

- Очки за тренировку: `10 + floor(volumeKg / 100)`, где `volumeKg = Σ(reps × weightKg)`; бонус серии `×(1 + 0.1 × min(streak, 5))`.
- Достижения: первая тренировка, 5 и 10 тренировок, серия 7 дней, объём 10 000 кг, 3 группы мышц, 1000 очков.
- Рейтинг: топ-3 подиум + таблица, своя строка закреплена. Метрики переключаются табами.
- Формулы — только в `lib/scoring.ts`, чистыми функциями. Их же использует seed.

## Дизайн

Настроение: энергия и рост, а не медицинский трекер. Тёмная база, кислотный акцент, крупные цифры, чистые поверхности.

Черновик токенов (финал — после `better-colors`, менять только через токены):

```
--bg        #0A0C0B
--surface   #121614
--surface-2 #182019
--line      rgba(255,255,255,.08)
--fg        #F2F5F1
--muted     #98A29B
--accent    #C8F751   лайм
--accent-2  #6EE7B7   мята
--danger    #FF6B5E
--warn      #FFC857
```

- Радиусы: 12 контролы, 20 карточки, 999 пилюли. Тени мягкие, вместо них — 1px бордер и внутренний хайлайт.
- Одна доведённая тема. Переключатель тем — только если останется время.
- Типографика: Unbounded 500/700 для заголовков и цифр, Onest 400/500/600 для текста. Шкала фиксируется один раз.
- Данные-виз: кольцо недельной цели, бары объёма, линия веса, донат групп мышц. Без 3D и «понаехавших» библиотек.
- Анимации 150–300 мс, ease-out; spring — для sheet/модалок. Всегда `prefers-reduced-motion`.
- Мобилка: bottom tab bar, safe-area, тапы ≥ 44px, проверка на 360px и 1440px.
- Аватары — инициалы на градиенте, без внешних картинок. Видео упражнений — внешние ссылки (YouTube), не хостим.
- Каждый экран обязан иметь loading (skeleton), empty (с действием) и error (с retry) состояния.
- Seed — часть результата: демо-аккаунт с 4 неделями тренировок, достижениями и 8 пользователями рейтинга. Пустые графики на защите = потерянные баллы.

## Порядок работы (8 ч)

Модуль A, 4 ч:
1. 0:00–0:25 — каркас, токены, шрифты, навигация, `npm run build` зелёный.
2. 0:25–1:10 — login/register (валидация, мок-сессия), брендовый сплит-скрин.
3. 1:10–2:10 — dashboard: сводка, кольцо цели, графики, достижения, топ рейтинга.
4. 2:10–3:10 — тренировки: список, создание, карточка, упражнения, результаты.
5. 3:10–3:40 — каталог упражнений: поиск, фильтр, инструкция, добавление в тренировку.
6. 3:40–4:00 — адаптив, пустые состояния, демо-данные, прогон сценария.

Модуль B, 4 ч:
1. 0:00–0:30 — схема, миграция, seed.
2. 0:30–1:10 — auth API, `/me`, защита маршрутов.
3. 1:10–2:10 — workouts/exercises CRUD, zod, проверка владельца.
4. 2:10–2:50 — stats, leaderboard, achievements, очки.
5. 2:50–3:30 — подключение фронта к API, замена мока, ошибки и загрузки.
6. 3:30–4:00 — README, `.env.example`, сборка, git push, финальный прогон.

## Навыки

Скрытые от индекса, грузятся по `@id`: `shadcn`, `animate`, `animation-performance`, `mobile-native`, `apple-design`, `emil-design-eng`, `improve-animations`, `break`, `break-ui`, `variant`, `prototype`, `state-machine`, `interface-review`, `review-animations`, `ask-sonner`, `write-swift`, `animate-expo`, `animation-vocabulary`, `find-animation-opportunities`, `migrate-radix-to-base`, `build-design`, `technical-drawing`.

| Момент | Навык | Зачем |
|---|---|---|
| Каркас, палитра, шрифты | `better-colors`, `better-typography` | токены, контраст, кириллица, цифры |
| shadcn init и компоненты | `@shadcn` | не изобретать базовые контролы |
| Сетки и экраны | `better-layout` | иерархия, адаптив, длинные переводы |
| Поверхности, иконки, тени | `better-ui` | polished-вид без вкусовщины |
| Тексты интерфейса | `better-writing` | кнопки, ошибки, пустые состояния |
| Анимации | `@animate`, `@emil-design-eng`, `@apple-design` | переходы, sheet, жесты, пружины |
| Проверка моушена | `@animation-performance`, `@improve-animations` | не ронять FPS, аудит перед сдачей |
| Мобилка | `@mobile-native` | 100vh, safe-area, tap-highlight, зум инпутов |
| Тосты | `@ask-sonner` | подтверждения CRUD, ошибки |
| Выбор варианта | `@variant`, `@prototype` | 3 варианта компонента / экрана за пикером |
| Состояния компонента | `@state-machine` | карточка тренировки во всех состояниях |
| Худшие данные | `@break-ui` | длинные имена, нули, эмодзи, гигантские числа |
| Финальное ревью | `better-accessibility`, `better-interface`, `@interface-review` | клавиатура, фокус, ARIA, сводный отчёт |
| Гигиена кода | `karpathy-guidelines` | минимальные правки, проверяемый результат |

`@build-design` — только если появится макет или референс-картинка. `@technical-drawing`, `write-swift`, `animate-expo`, `migrate-radix-to-base` в этом проекте не нужны.

## Правила

- Сначала допущения и развилки, потом код. Есть путь проще — озвучить до реализации.
- Код пишет агент, пользователь знает базовый JS. Решения объяснять коротко и без жаргона, незнакомые места — комментарием в коде или абзацем в README.
- Данные только через `lib/api-client.ts`; моки не живут в компонентах.
- Не тащить новые зависимости без нужды. Всё, что уже в стеке, решает 95 % задач.
- Русский интерфейс, английский код и коммиты.
- Не коммитить `.env`, `data/*.db`, `node_modules`. `.env.example` — обязательно.
- Перед сдачей: `npx tsc --noEmit`, `npm run build`, ручной прогон «регистрация → тренировка → результат → достижение → рейтинг».
- README: стек, запуск, демо-логин, скриншоты, ссылка на репозиторий.

## Не делать

- NextAuth/Clerk/Auth.js — лишняя настройка на 4 часа.
- SSR-оптимизации, ISR, кэш, middleware-магия — приложение маленькое.
- Тесты ради тестов, CI, Docker.
- Загрузку файлов и хостинг видео — только внешние ссылки.
- Светлую тему «для галочки», если тёмная не доведена.
- Фейковый бэкенд «на будущее»: API нужен ровно под экраны из ТЗ.
