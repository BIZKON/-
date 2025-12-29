# CEO-OS

AI-powered Operating System for Small Business - Операционная система для малого бизнеса на базе мульти-агентного ИИ.

## Ключевая фича: Совет Директоров

Симуляция совещания с цифровыми двойниками известных предпринимателей (Маск, Тиньков, Дуров, Jobs, Bezos), которые дают персонализированные советы на основе загруженных документов компании.

## Технологический стек

### Backend
- **Python 3.11+** с FastAPI (async)
- **LangGraph** для мульти-агентной оркестрации
- **LangChain** для LLM абстракций
- **SQLAlchemy 2.0** (async ORM)
- **Qdrant** для векторного поиска
- **PostgreSQL 16** как основная БД

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** + **Shadcn/UI**
- **React Query** для работы с данными

### Infrastructure
- **Docker Compose** для локальной разработки
- **PostgreSQL 16**
- **Qdrant** (vector database)
- **MinIO** (S3-compatible storage)
- **Redis** (cache)

## Структура проекта

```
ceo-os/
├── apps/
│   ├── web/                  # Next.js Dashboard
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   └── lib/              # Utilities & API client
│   │
│   └── api/                  # FastAPI Backend
│       └── app/
│           ├── api/v1/       # API endpoints
│           ├── agents/       # LangGraph agents
│           ├── core/         # Config, DB, Qdrant
│           ├── models/       # SQLAlchemy models
│           └── services/     # Business logic
│
├── packages/
│   └── ai/                   # Shared AI code
│
├── docker-compose.yml
├── package.json              # Monorepo config
└── turbo.json
```

## Быстрый старт

### 1. Запустите инфраструктуру

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Qdrant на порту 6333
- Redis на порту 6379
- MinIO на порту 9000 (console: 9001)

### 2. Настройте переменные окружения

```bash
cp .env.example apps/api/.env
```

Отредактируйте `apps/api/.env` и добавьте ваши API ключи:
- `ANTHROPIC_API_KEY` - для Claude
- `OPENAI_API_KEY` - для embeddings

### 3. Установите зависимости

Backend:
```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
```

Frontend:
```bash
npm install
```

### 4. Запустите приложение

Backend:
```bash
cd apps/api
uvicorn app.main:app --reload --port 8000
```

Frontend:
```bash
npm run dev:web
```

Откройте http://localhost:3000

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Авторизация
- `GET /api/v1/auth/me` - Текущий пользователь

### Documents
- `GET /api/v1/documents` - Список документов
- `POST /api/v1/documents/upload` - Загрузка файла
- `DELETE /api/v1/documents/{id}` - Удаление
- `GET /api/v1/documents/{id}/status` - Статус обработки

### Agents
- `GET /api/v1/agents/personas` - Список советников
- `POST /api/v1/agents/board-meeting` - Запуск совета директоров

## Доступные персоны (советники)

| ID | Имя | Стиль |
|----|-----|-------|
| `tinkoff` | Олег Тиньков | Агрессивный маркетинг |
| `durov` | Павел Дуров | Минимализм, долгосрок |
| `musk` | Elon Musk | First principles |
| `jobs` | Steve Jobs | Фокус, простота |
| `bezos` | Jeff Bezos | Customer obsession |
| `branson` | Richard Branson | Авантюризм, бренд |

## Основные функции

1. **Регистрация и авторизация** - JWT-based аутентификация
2. **Загрузка документов** - PDF, DOCX, TXT с автоматическим парсингом
3. **Векторный поиск** - Индексация документов в Qdrant
4. **Совет директоров** - Параллельные LLM вызовы для каждой персоны
5. **Синтез рекомендаций** - Объединение советов с выделением консенсуса
6. **Streaming ответы** - Realtime обновление UI

## Разработка

### Структура базы данных

- `organizations` - Организации
- `users` - Пользователи
- `documents` - Загруженные документы
- `conversations` - Сессии общения
- `messages` - Сообщения в сессиях

### Архитектура агента Board Meeting

```
START
  │
  ▼
[retrieve_context] ──► Qdrant RAG
  │
  ▼
[parallel_advisors] ──► LLM вызовы для каждой персоны
  │
  ▼
[synthesize] ──► Синтез рекомендаций
  │
  ▼
END
```

## License

MIT
