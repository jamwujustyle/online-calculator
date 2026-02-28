# Deliverables — 3D Cost Calculator

Mapping of all PDF requirements to implementation status.

## 1. Пользователи (Users) ✅

| Requirement | Status | Implementation |
|---|---|---|
| Регистрация / вход | ✅ | Email auth + Google OAuth (`/login`, `/register`) |
| Видеть только свои проекты | ✅ | `current_user.id` filter on all project queries |
| Создавать любое количество проектов | ✅ | Dashboard "New Project" button, no limits |
| Возвращаться к ним позже | ✅ | Persistent DB storage (PostgreSQL) |
| Данные сохраняются после перезагрузки | ✅ | Server-side DB, JWT auth with localStorage |

## 2. Проект (Project Entity) ✅

| Field | Status | Location |
|---|---|---|
| Название | ✅ | Editable inline title in ProjectEditor header |
| Дата | ✅ | `created_at` shown with CalendarDays icon in header |
| Клиент | ✅ | Editable inline `client_name` field |
| Контакт | ✅ | Editable inline `contact` field |
| Заметки | ✅ | Expandable `notes` editor in header |

Project is stored in PostgreSQL and editable at any time.

## 3. Загрузка 3D-модели (3D File Upload) ✅

| Requirement | Status | Implementation |
|---|---|---|
| Поддержка STL | ✅ | Frontend accept + backend trimesh |
| Поддержка OBJ | ✅ | Frontend accept + backend trimesh |
| Поддержка 3MF | ✅ | Frontend accept + backend trimesh + ThreeMFLoader |
| Файл сохраняется | ✅ | `FileService.save_upload_file()` → `uploads/` dir |
| Обработка в фоне | ✅ | Celery worker task `process_3d_file` |
| Статус обработки виден | ✅ | `file_status`: pending → processing → ready/error |
| Интерфейс не зависает | ✅ | Async Celery + polling on frontend |
| Ограничение форматов | ✅ | `accept=".stl,.obj,.3mf"` + JS ext validation |

## 4. Автоматический анализ модели (Auto Analysis) ✅

| Parameter | Status | Implementation |
|---|---|---|
| Габариты X/Y/Z | ✅ | `trimesh.bounding_box.extents` → `dim_x/y/z` |
| Объём | ✅ | `trimesh.volume` → `volume_mm3` |
| Количество полигонов | ✅ | `len(mesh.faces)` → `poly_count` |

Data saved to DB and displayed in ViewerPanel "Model Specs" overlay.

## 5. 3D-просмотр (3D Viewer) ✅

| Requirement | Status | Implementation |
|---|---|---|
| Вращение | ✅ | OrbitControls — left click drag |
| Приближение | ✅ | OrbitControls — scroll wheel |
| Сброс вида | ✅ | Reset button (RotateCcw icon) with `saveState()`/`reset()` |
| Статус при обработке | ✅ | Spinner + "Analyzing 3D geometry..." text |

ThreeViewer uses `@react-three/fiber` + `@react-three/drei` with CameraFramer for auto-framing.

## 6. Параметры производства (Production Parameters) ✅

| Parameter | Status | Field Name |
|---|---|---|
| Технология (FDM/SLA/etc) | ✅ | `technology` select |
| Материал | ✅ | `material` text input |
| Плотность | ✅ | `density` number input |
| Цена | ✅ | `pricePerKg` number input |
| Расход (отходы) | ✅ | `wastePercent` number input |
| Заполнение (%) | ✅ | `infill` number input |
| Поддержки (%) | ✅ | `supports` number input |
| Время печати | ✅ | `printTimeHours` number input |
| Время постобработки | ✅ | `postProcessHours` number input |
| Время моделирования | ✅ | `modelPrepMins` number input |
| Количество деталей | ✅ | `quantity` number input |
| Коэффициент наценки | ✅ | `markupPercent` number input |
| Вероятность брака | ✅ | `defectRiskPercent` number input |
| Налог | ✅ | `taxPercent` number input |
| Амортизация | ✅ | `amortizationCostPerHour` number input |
| Стоимость электроэнергии | ✅ | `electricityCostPerHour` number input |
| Валюта | ✅ | `currency` select (USD/EUR/RUB/GBP) |
| Язык интерфейса | ✅ | EN/RU toggle in Dashboard header, persisted in localStorage |

## 7. Автоматический расчёт (Auto Calculation) ✅

Recalculates on every parameter change via `useMemo` in `ProjectEditor`.

| Calculated Value | Status | Implementation |
|---|---|---|
| Вес детали | ✅ | `volume × density × infillFactor` |
| Расход материала | ✅ | `weight × (1 + waste/100)` |
| Время производства | ✅ | `printTime + postProcess` |
| Себестоимость | ✅ | Material + labor + power costs |
| Стоимость электроэнергии | ✅ | `electricityCostPerHour × totalHours` |
| Амортизация | ✅ | `amortizationCostPerHour × totalHours` |
| Стоимость подготовки | ✅ | `modelPrepMins / 60 × laborRate` |
| Брак | ✅ | `baseCost × defectRisk/100` |
| Прибыль | ✅ | `sellingPrice - totalCost` |
| Налог | ✅ | `priceBeforeTax × tax/100` |
| Цена за 1 шт | ✅ | Full unit selling price with markup |
| Цена за партию | ✅ | `unitPrice × quantity` |

Right panel shows clear price breakdown with dynamic currency symbols.

## 8. LLM-сервис (AI Service) ✅

| Requirement | Status | Implementation |
|---|---|---|
| Кнопка "AI" | ✅ | "Generate AI Descriptions" button in ResultsPanel |
| Описание детали | ✅ | `ai_description` field, shown under "Technical Description" |
| Коммерческий текст | ✅ | `commercial_text` field, shown under "Commercial Pitch" |
| Результат сохраняется | ✅ | `update_ai_texts()` persists to DB |
| Локализация ответов | ✅ | `lang` param passed to OpenAI prompt for EN/RU output |

Uses OpenAI GPT-4o. Key is optional — feature gracefully disabled without it.

## 9. Очереди (Task Queues) ✅

| Requirement | Status | Implementation |
|---|---|---|
| Обработка не в запросе | ✅ | Celery task `process_3d_file` |
| Очередь задач | ✅ | Redis as Celery broker |
| Воркер обработал → данные в проекте | ✅ | Worker writes to DB, frontend polls |
| Статус: обработка/готово/ошибка | ✅ | `file_status` field: `processing`/`ready`/`error` |

## 10. Интерфейс (UI) ✅

| Requirement | Status | Implementation |
|---|---|---|
| Три части: параметры / модель / расчёт | ✅ | 3-column layout in ProjectEditor |
| Не админка, не JSON-форма | ✅ | Premium dark UI with glassmorphism, animations |
| Удобный и логичный | ✅ | Inline editing, responsive layout, toast notifications |

## 11. Сохранение данных (Data Persistence) ✅

| Data | Status | Storage |
|---|---|---|
| Проекты | ✅ | PostgreSQL `projects` table |
| Параметры | ✅ | `production_params` JSON column |
| Результаты | ✅ | `calculated_results` JSON column |
| Тексты AI | ✅ | `ai_description` + `commercial_text` columns |
| Пользователь видит всё при возврате | ✅ | Full state restoration from DB on project load |

## Что сдавать (Deliverables) ✅

| Item | Status | Location |
|---|---|---|
| Репозиторий/архив | ✅ | Git repository |
| Инструкция запуска | ✅ | `README.md` with `docker compose up --build` |


## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + Three.js
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Worker**: Celery + Redis + Trimesh
- **AI**: OpenAI GPT-4o (optional)
- **Auth**: Email/password + Google OAuth (optional)
- **Deploy**: Docker Compose (all services)
- **i18n**: Custom React Context (EN/RU) with localStorage persistence
