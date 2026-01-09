# Market Analytics Service - Сервис аналитики рынка

## Обзор

Сервис Market Analytics расширяет функциональность CEO-OS, добавляя автоматизированный сбор и анализ рыночных данных. Использует комбинацию из 3 MCP серверов для максимально эффективного парсинга данных.

---

## 1. Архитектура MCP Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MARKET ANALYTICS SERVICE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌───────────────┐    ┌─────────────────┐       │
│  │ BRAVE SEARCH │    │   FIRECRAWL   │    │   BRIGHT DATA   │       │
│  │     MCP      │    │      MCP      │    │      MCP        │       │
│  └──────┬───────┘    └───────┬───────┘    └────────┬────────┘       │
│         │                    │                      │                │
│         │  Поиск             │  Лёгкий              │  Тяжёлый      │
│         │  источников        │  скрапинг            │  скрапинг     │
│         │                    │                      │                │
│         └────────────────────┼──────────────────────┘                │
│                              │                                       │
│                              ▼                                       │
│                    ┌─────────────────┐                               │
│                    │   ORCHESTRATOR  │                               │
│                    │   (LangGraph)   │                               │
│                    └────────┬────────┘                               │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │ COMPETITOR  │    │   MARKET    │    │   TREND     │              │
│  │  ANALYSIS   │    │   SIZING    │    │   TRACKING  │              │
│  └─────────────┘    └─────────────┘    └─────────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. MCP Серверы - Детали интеграции

### 2.1 Brave Search MCP
**Назначение:** Первичный поиск и обнаружение источников

```python
# Конфигурация MCP
{
    "name": "brave-search",
    "command": "npx",
    "args": ["-y", "@anthropics/mcp-brave-search"],
    "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
    }
}
```

**Сценарии использования:**
- Поиск конкурентов по ключевым словам
- Обнаружение новостей отрасли
- Поиск отраслевых отчётов
- Мониторинг упоминаний бренда
- Поиск вакансий конкурентов (для оценки роста)

**Rate Limits:**
- Free: 2,000 запросов/месяц
- Paid: Pay as you go

---

### 2.2 Firecrawl MCP
**Назначение:** Лёгкий скрапинг сайтов без антибот-защиты

```python
# Конфигурация MCP
{
    "name": "firecrawl",
    "command": "npx",
    "args": ["-y", "firecrawl-mcp"],
    "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
    }
}
```

**Сценарии использования:**
- Скрапинг блогов и новостных сайтов
- Парсинг страниц продуктов конкурентов
- Извлечение ценовой информации (простые сайты)
- Сбор контента для анализа
- Скрапинг job-бордов

**Возможности:**
- `scrape` - одна страница → markdown/structured data
- `crawl` - весь сайт с фильтрами
- `map` - sitemap сайта
- `extract` - структурированные данные по схеме

**Когда НЕ справляется:**
- Cloudflare защита
- Сложные капчи
- JavaScript-heavy SPA
- Rate limiting

---

### 2.3 Bright Data MCP
**Назначение:** Тяжёлый скрапинг с обходом антибот-защиты

```python
# Конфигурация MCP
{
    "name": "bright-data",
    "command": "npx",
    "args": ["-y", "@anthropics/mcp-bright-data"],
    "env": {
        "BRIGHT_DATA_API_KEY": "${BRIGHT_DATA_API_KEY}"
    }
}
```

**Сценарии использования (Fallback от Firecrawl):**
- LinkedIn профили компаний и сотрудников
- Amazon/ecommerce данные
- Google Search результаты (SERP)
- Защищённые сайты конкурентов
- Social media данные

**Возможности:**
- Rotating proxies
- Browser fingerprint rotation
- CAPTCHA solving
- JavaScript rendering
- Residential/Datacenter IPs

---

## 3. Структура директорий

```
apps/api/app/
├── services/
│   └── market_analytics/
│       ├── __init__.py
│       ├── orchestrator.py      # LangGraph оркестратор
│       ├── mcp_clients/
│       │   ├── __init__.py
│       │   ├── brave_search.py  # Клиент Brave
│       │   ├── firecrawl.py     # Клиент Firecrawl
│       │   └── bright_data.py   # Клиент Bright Data
│       ├── pipelines/
│       │   ├── __init__.py
│       │   ├── competitor_analysis.py
│       │   ├── market_sizing.py
│       │   ├── trend_tracking.py
│       │   └── price_monitoring.py
│       ├── processors/
│       │   ├── __init__.py
│       │   ├── data_cleaner.py
│       │   ├── entity_extractor.py
│       │   └── sentiment_analyzer.py
│       └── schemas/
│           ├── __init__.py
│           ├── competitor.py
│           ├── market_report.py
│           └── trend.py
│
├── api/v1/
│   └── analytics/
│       ├── __init__.py
│       ├── router.py
│       └── schemas.py
│
├── models/
│   ├── competitor.py
│   ├── market_research.py
│   └── scrape_task.py
│
└── agents/
    └── market_analyst.py        # LangGraph агент-аналитик
```

---

## 4. Модели данных

### 4.1 SQLAlchemy Models

```python
# models/competitor.py
class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(UUID, primary_key=True, default=uuid4)
    organization_id = Column(UUID, ForeignKey("organizations.id"))

    name = Column(String(255), nullable=False)
    website = Column(String(512))
    description = Column(Text)

    # Parsed data
    products = Column(JSONB)           # [{name, price, features}]
    team_size_estimate = Column(Integer)
    funding_info = Column(JSONB)       # {total, rounds: [{date, amount}]}
    tech_stack = Column(ARRAY(String))

    # Social presence
    linkedin_url = Column(String(512))
    twitter_url = Column(String(512))

    # Metadata
    last_scraped_at = Column(DateTime)
    scrape_status = Column(String(50))  # pending, success, failed

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)


# models/market_research.py
class MarketResearch(Base):
    __tablename__ = "market_researches"

    id = Column(UUID, primary_key=True, default=uuid4)
    organization_id = Column(UUID, ForeignKey("organizations.id"))

    query = Column(Text, nullable=False)     # Исходный запрос
    research_type = Column(String(50))       # competitor, market_size, trend

    # Results
    summary = Column(Text)
    insights = Column(JSONB)    # [{title, description, confidence}]
    sources = Column(JSONB)     # [{url, title, scraped_at}]
    raw_data = Column(JSONB)    # Все собранные данные

    # Processing
    status = Column(String(50))  # pending, searching, scraping, analyzing, done
    progress = Column(Integer, default=0)
    error = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)


# models/scrape_task.py
class ScrapeTask(Base):
    __tablename__ = "scrape_tasks"

    id = Column(UUID, primary_key=True, default=uuid4)
    research_id = Column(UUID, ForeignKey("market_researches.id"))

    url = Column(String(2048), nullable=False)
    scraper_used = Column(String(50))  # firecrawl, bright_data

    status = Column(String(50))        # pending, running, success, failed
    retry_count = Column(Integer, default=0)

    # Results
    content = Column(Text)
    structured_data = Column(JSONB)
    error_message = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
```

---

## 5. API Endpoints

### 5.1 Router

```python
# api/v1/analytics/router.py

@router.post("/research", response_model=MarketResearchResponse)
async def start_research(
    request: MarketResearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Запустить маркетинговое исследование.

    Types:
    - competitor_analysis: Анализ конкурентов
    - market_sizing: Оценка размера рынка
    - trend_tracking: Отслеживание трендов
    - price_monitoring: Мониторинг цен
    """
    pass


@router.get("/research/{research_id}", response_model=MarketResearchResponse)
async def get_research(research_id: UUID):
    """Получить результаты исследования"""
    pass


@router.get("/research/{research_id}/stream")
async def stream_research(research_id: UUID):
    """SSE стрим прогресса исследования"""
    pass


@router.post("/competitors", response_model=CompetitorResponse)
async def add_competitor(request: AddCompetitorRequest):
    """Добавить конкурента для отслеживания"""
    pass


@router.get("/competitors", response_model=List[CompetitorResponse])
async def list_competitors():
    """Список отслеживаемых конкурентов"""
    pass


@router.post("/competitors/{competitor_id}/refresh")
async def refresh_competitor(competitor_id: UUID):
    """Обновить данные о конкуренте"""
    pass


@router.get("/dashboard", response_model=AnalyticsDashboard)
async def get_dashboard():
    """Дашборд аналитики с ключевыми метриками"""
    pass
```

### 5.2 Request/Response Schemas

```python
# api/v1/analytics/schemas.py

class MarketResearchRequest(BaseModel):
    query: str
    research_type: Literal[
        "competitor_analysis",
        "market_sizing",
        "trend_tracking",
        "price_monitoring"
    ]
    options: Optional[ResearchOptions] = None


class ResearchOptions(BaseModel):
    max_sources: int = 10
    include_social: bool = True
    deep_scrape: bool = False      # Использовать Bright Data
    competitor_ids: List[UUID] = []
    keywords: List[str] = []


class MarketResearchResponse(BaseModel):
    id: UUID
    status: str
    progress: int
    summary: Optional[str]
    insights: List[Insight]
    sources: List[Source]
    created_at: datetime
    completed_at: Optional[datetime]
```

---

## 6. LangGraph Orchestrator

### 6.1 Граф исследования рынка

```python
# services/market_analytics/orchestrator.py

from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator


class ResearchState(TypedDict):
    query: str
    research_type: str
    options: dict

    # Search phase
    search_results: list
    urls_to_scrape: list

    # Scrape phase
    scraped_content: Annotated[list, operator.add]
    failed_urls: list

    # Analysis phase
    extracted_entities: list
    insights: list
    summary: str

    # Meta
    progress: int
    current_step: str
    errors: list


def create_research_graph():
    workflow = StateGraph(ResearchState)

    # Nodes
    workflow.add_node("search", search_node)
    workflow.add_node("prioritize_urls", prioritize_urls_node)
    workflow.add_node("scrape_light", scrape_with_firecrawl)
    workflow.add_node("scrape_heavy", scrape_with_bright_data)
    workflow.add_node("extract_entities", extract_entities_node)
    workflow.add_node("analyze", analyze_node)
    workflow.add_node("synthesize", synthesize_node)

    # Edges
    workflow.set_entry_point("search")
    workflow.add_edge("search", "prioritize_urls")
    workflow.add_conditional_edges(
        "prioritize_urls",
        route_scraping,
        {
            "light": "scrape_light",
            "heavy": "scrape_heavy",
            "skip": "extract_entities"
        }
    )
    workflow.add_conditional_edges(
        "scrape_light",
        check_scrape_results,
        {
            "retry_heavy": "scrape_heavy",
            "continue": "extract_entities"
        }
    )
    workflow.add_edge("scrape_heavy", "extract_entities")
    workflow.add_edge("extract_entities", "analyze")
    workflow.add_edge("analyze", "synthesize")
    workflow.add_edge("synthesize", END)

    return workflow.compile()
```

### 6.2 Ноды графа

```python
# Search Node - Brave Search
async def search_node(state: ResearchState) -> ResearchState:
    """Поиск источников через Brave Search"""

    brave = BraveSearchMCP()

    # Формируем поисковые запросы
    queries = generate_search_queries(
        state["query"],
        state["research_type"]
    )

    all_results = []
    for q in queries:
        results = await brave.search(
            query=q,
            count=20,
            search_type="web"
        )
        all_results.extend(results)

    # Дедупликация по URL
    unique_results = deduplicate_by_url(all_results)

    return {
        **state,
        "search_results": unique_results,
        "progress": 20,
        "current_step": "search_complete"
    }


# Prioritize URLs
async def prioritize_urls_node(state: ResearchState) -> ResearchState:
    """Приоритизация URL для скрапинга"""

    urls = []
    for result in state["search_results"]:
        priority = calculate_priority(
            url=result["url"],
            title=result["title"],
            research_type=state["research_type"]
        )
        urls.append({
            "url": result["url"],
            "priority": priority,
            "scrape_difficulty": estimate_difficulty(result["url"])
        })

    # Сортировка по приоритету
    urls.sort(key=lambda x: x["priority"], reverse=True)

    return {
        **state,
        "urls_to_scrape": urls[:state["options"].get("max_sources", 10)],
        "progress": 30
    }


# Firecrawl Scraping
async def scrape_with_firecrawl(state: ResearchState) -> ResearchState:
    """Лёгкий скрапинг через Firecrawl"""

    firecrawl = FirecrawlMCP()
    scraped = []
    failed = []

    light_urls = [
        u for u in state["urls_to_scrape"]
        if u["scrape_difficulty"] == "light"
    ]

    for url_info in light_urls:
        try:
            content = await firecrawl.scrape(
                url=url_info["url"],
                formats=["markdown", "extract"],
                extract_schema=get_schema_for_type(state["research_type"])
            )
            scraped.append({
                "url": url_info["url"],
                "content": content,
                "scraper": "firecrawl"
            })
        except ScrapingError as e:
            if is_antibot_error(e):
                failed.append(url_info)
            else:
                state["errors"].append(str(e))

    return {
        **state,
        "scraped_content": scraped,
        "failed_urls": failed,
        "progress": 50
    }


# Bright Data Scraping (Fallback)
async def scrape_with_bright_data(state: ResearchState) -> ResearchState:
    """Тяжёлый скрапинг через Bright Data для защищённых сайтов"""

    bright = BrightDataMCP()
    scraped = []

    # URLs что не смог Firecrawl + изначально сложные
    heavy_urls = state["failed_urls"] + [
        u for u in state["urls_to_scrape"]
        if u["scrape_difficulty"] == "heavy"
    ]

    for url_info in heavy_urls:
        try:
            content = await bright.scrape(
                url=url_info["url"],
                render_js=True,
                proxy_type="residential",
                wait_for_selector=get_wait_selector(url_info["url"])
            )
            scraped.append({
                "url": url_info["url"],
                "content": content,
                "scraper": "bright_data"
            })
        except Exception as e:
            state["errors"].append(f"Bright Data failed for {url_info['url']}: {e}")

    return {
        **state,
        "scraped_content": scraped,
        "progress": 70
    }
```

---

## 7. MCP Client Implementations

### 7.1 Brave Search Client

```python
# services/market_analytics/mcp_clients/brave_search.py

class BraveSearchMCP:
    def __init__(self):
        self.api_key = settings.BRAVE_API_KEY
        self.base_url = "https://api.search.brave.com/res/v1"

    async def search(
        self,
        query: str,
        count: int = 20,
        search_type: str = "web",
        freshness: str = None,  # pd, pw, pm, py
        country: str = "RU"
    ) -> List[SearchResult]:
        """
        Поиск через Brave Search API

        search_type: web, news, images
        freshness: pd (day), pw (week), pm (month), py (year)
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/{search_type}/search",
                headers={"X-Subscription-Token": self.api_key},
                params={
                    "q": query,
                    "count": count,
                    "country": country,
                    "freshness": freshness
                }
            )
            data = response.json()

            return [
                SearchResult(
                    title=r["title"],
                    url=r["url"],
                    description=r.get("description", ""),
                    published_date=r.get("age")
                )
                for r in data.get("web", {}).get("results", [])
            ]

    async def news_search(self, query: str, count: int = 10) -> List[NewsResult]:
        """Поиск новостей"""
        return await self.search(query, count, search_type="news")
```

### 7.2 Firecrawl Client

```python
# services/market_analytics/mcp_clients/firecrawl.py

class FirecrawlMCP:
    def __init__(self):
        self.api_key = settings.FIRECRAWL_API_KEY
        self.base_url = "https://api.firecrawl.dev/v1"

    async def scrape(
        self,
        url: str,
        formats: List[str] = ["markdown"],
        extract_schema: dict = None,
        wait_for: int = 0,
        timeout: int = 30000
    ) -> ScrapeResult:
        """
        Скрапинг одной страницы

        formats: markdown, html, rawHtml, links, screenshot, extract
        """
        async with httpx.AsyncClient() as client:
            payload = {
                "url": url,
                "formats": formats,
                "timeout": timeout
            }

            if extract_schema:
                payload["extract"] = {"schema": extract_schema}

            response = await client.post(
                f"{self.base_url}/scrape",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload
            )

            if response.status_code != 200:
                raise ScrapingError(response.json().get("error"))

            return ScrapeResult(**response.json()["data"])

    async def crawl(
        self,
        url: str,
        max_pages: int = 10,
        include_paths: List[str] = None,
        exclude_paths: List[str] = None
    ) -> CrawlResult:
        """Краулинг всего сайта"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/crawl",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "url": url,
                    "limit": max_pages,
                    "includePaths": include_paths,
                    "excludePaths": exclude_paths
                }
            )
            return CrawlResult(**response.json())

    async def extract(
        self,
        urls: List[str],
        schema: dict,
        prompt: str = None
    ) -> List[ExtractResult]:
        """Структурированное извлечение данных"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/extract",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "urls": urls,
                    "schema": schema,
                    "prompt": prompt
                }
            )
            return [ExtractResult(**r) for r in response.json()["data"]]
```

### 7.3 Bright Data Client

```python
# services/market_analytics/mcp_clients/bright_data.py

class BrightDataMCP:
    def __init__(self):
        self.api_key = settings.BRIGHT_DATA_API_KEY
        self.base_url = "https://api.brightdata.com"

    async def scrape(
        self,
        url: str,
        render_js: bool = True,
        proxy_type: str = "datacenter",  # datacenter, residential, mobile
        country: str = "RU",
        wait_for_selector: str = None,
        timeout: int = 60000
    ) -> ScrapeResult:
        """
        Скрапинг с обходом антибот-защиты

        proxy_type:
        - datacenter: быстрый, дешёвый, меньше обход защиты
        - residential: медленнее, дороже, лучший обход
        - mobile: самый дорогой, максимальный обход
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/scrape",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "url": url,
                    "render_js": render_js,
                    "proxy": {
                        "type": proxy_type,
                        "country": country
                    },
                    "wait_for": wait_for_selector,
                    "timeout": timeout
                }
            )

            if response.status_code != 200:
                raise ScrapingError(response.json().get("error"))

            return ScrapeResult(**response.json())

    async def scrape_serp(
        self,
        query: str,
        engine: str = "google",
        country: str = "RU",
        num_results: int = 100
    ) -> List[SERPResult]:
        """Скрапинг поисковой выдачи (Google, Yandex, Bing)"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/serp",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "query": query,
                    "engine": engine,
                    "country": country,
                    "num": num_results
                }
            )
            return [SERPResult(**r) for r in response.json()["results"]]

    async def scrape_social(
        self,
        platform: str,  # linkedin, twitter, facebook
        profile_url: str
    ) -> SocialProfile:
        """Скрапинг социальных профилей"""
        # Использует специализированные датасеты Bright Data
        pass
```

---

## 8. Пайплайны аналитики

### 8.1 Competitor Analysis Pipeline

```python
# services/market_analytics/pipelines/competitor_analysis.py

class CompetitorAnalysisPipeline:
    """Полный пайплайн анализа конкурентов"""

    def __init__(self):
        self.brave = BraveSearchMCP()
        self.firecrawl = FirecrawlMCP()
        self.bright = BrightDataMCP()
        self.llm = ChatAnthropic(model="claude-sonnet-4-20250514")

    async def analyze(
        self,
        competitor_name: str,
        website: str = None,
        aspects: List[str] = None
    ) -> CompetitorReport:
        """
        Полный анализ конкурента

        aspects: products, pricing, team, funding, tech_stack, marketing
        """
        aspects = aspects or ["products", "pricing", "team", "marketing"]

        # 1. Собираем информацию
        data = await self._gather_data(competitor_name, website)

        # 2. Анализируем каждый аспект
        analysis = {}
        for aspect in aspects:
            analysis[aspect] = await self._analyze_aspect(
                aspect,
                data,
                competitor_name
            )

        # 3. Генерируем отчёт
        report = await self._generate_report(competitor_name, analysis)

        return report

    async def _gather_data(self, name: str, website: str) -> dict:
        """Сбор данных из всех источников"""

        tasks = []

        # Поиск информации
        tasks.append(self.brave.search(f"{name} company"))
        tasks.append(self.brave.news_search(f"{name} startup funding"))

        # Скрапинг сайта
        if website:
            tasks.append(self._scrape_website(website))

        # LinkedIn (через Bright Data)
        tasks.append(self._scrape_linkedin(name))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        return {
            "search_results": results[0] if not isinstance(results[0], Exception) else [],
            "news": results[1] if not isinstance(results[1], Exception) else [],
            "website_content": results[2] if len(results) > 2 and not isinstance(results[2], Exception) else None,
            "linkedin_data": results[3] if len(results) > 3 and not isinstance(results[3], Exception) else None
        }

    async def _scrape_website(self, website: str) -> dict:
        """Скрапинг сайта с fallback на Bright Data"""

        try:
            # Сначала пробуем Firecrawl
            result = await self.firecrawl.crawl(
                url=website,
                max_pages=20,
                include_paths=["/pricing", "/product", "/about", "/team"]
            )
            return result
        except ScrapingError:
            # Fallback на Bright Data
            result = await self.bright.scrape(
                url=website,
                render_js=True,
                proxy_type="residential"
            )
            return result
```

### 8.2 Market Sizing Pipeline

```python
# services/market_analytics/pipelines/market_sizing.py

class MarketSizingPipeline:
    """Оценка размера рынка"""

    async def estimate(
        self,
        market_description: str,
        geography: str = "Russia",
        methodology: str = "top_down"  # top_down, bottom_up
    ) -> MarketSizeReport:
        """
        Оценка TAM/SAM/SOM
        """

        # 1. Поиск отраслевых отчётов
        reports = await self._find_industry_reports(market_description)

        # 2. Сбор данных о конкурентах
        competitors_data = await self._gather_competitors_data(market_description)

        # 3. Макроэкономические данные
        macro_data = await self._get_macro_data(geography)

        # 4. LLM анализ и расчёт
        estimate = await self._calculate_market_size(
            reports=reports,
            competitors=competitors_data,
            macro=macro_data,
            methodology=methodology
        )

        return estimate
```

### 8.3 Trend Tracking Pipeline

```python
# services/market_analytics/pipelines/trend_tracking.py

class TrendTrackingPipeline:
    """Отслеживание трендов рынка"""

    async def track(
        self,
        keywords: List[str],
        timeframe: str = "month",  # week, month, quarter, year
        sources: List[str] = None
    ) -> TrendReport:
        """
        Отслеживание трендов по ключевым словам

        sources: news, social, blogs, forums
        """
        sources = sources or ["news", "blogs"]

        # 1. Сбор упоминаний за период
        mentions = await self._collect_mentions(keywords, timeframe, sources)

        # 2. Временной анализ
        timeline = self._build_timeline(mentions)

        # 3. Sentiment анализ
        sentiment = await self._analyze_sentiment(mentions)

        # 4. Выявление emerging topics
        emerging = await self._find_emerging_topics(mentions)

        return TrendReport(
            keywords=keywords,
            timeframe=timeframe,
            mentions_count=len(mentions),
            timeline=timeline,
            sentiment=sentiment,
            emerging_topics=emerging,
            top_sources=self._get_top_sources(mentions)
        )
```

---

## 9. Frontend компоненты

### 9.1 Страница аналитики

```typescript
// apps/web/app/(dashboard)/dashboard/analytics/page.tsx

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Аналитика рынка</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Анализ конкурента"
          description="Полный анализ компании-конкурента"
          icon={<Users />}
          href="/dashboard/analytics/competitor"
        />
        <QuickActionCard
          title="Оценка рынка"
          description="Расчёт TAM/SAM/SOM"
          icon={<TrendingUp />}
          href="/dashboard/analytics/market-size"
        />
        <QuickActionCard
          title="Тренды"
          description="Отслеживание трендов"
          icon={<Activity />}
          href="/dashboard/analytics/trends"
        />
      </div>

      {/* Active Researches */}
      <ActiveResearchesList />

      {/* Tracked Competitors */}
      <CompetitorsDashboard />

      {/* Recent Insights */}
      <RecentInsights />
    </div>
  );
}
```

### 9.2 Компонент исследования

```typescript
// apps/web/components/analytics/ResearchProgress.tsx

interface ResearchProgressProps {
  researchId: string;
}

export function ResearchProgress({ researchId }: ResearchProgressProps) {
  const { data, isLoading } = useResearchStream(researchId);

  const steps = [
    { key: 'searching', label: 'Поиск источников', icon: Search },
    { key: 'scraping', label: 'Сбор данных', icon: Download },
    { key: 'analyzing', label: 'Анализ', icon: Brain },
    { key: 'synthesizing', label: 'Формирование отчёта', icon: FileText },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогресс исследования</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <Progress value={data?.progress || 0} />

          {/* Steps */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <StepIndicator
                key={step.key}
                {...step}
                status={getStepStatus(data?.current_step, step.key)}
              />
            ))}
          </div>

          {/* Live updates */}
          {data?.current_step && (
            <div className="text-sm text-muted-foreground animate-pulse">
              {getStepMessage(data.current_step)}
            </div>
          )}

          {/* Sources found */}
          {data?.sources && (
            <SourcesList sources={data.sources} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 10. Конфигурация

### 10.1 Environment Variables

```bash
# .env.example (additions)

# Brave Search
BRAVE_API_KEY=your_brave_api_key

# Firecrawl
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Bright Data
BRIGHT_DATA_API_KEY=your_bright_data_api_key
BRIGHT_DATA_ZONE=your_zone_name

# Rate Limits
BRAVE_RATE_LIMIT=100          # requests per minute
FIRECRAWL_RATE_LIMIT=50       # requests per minute
BRIGHT_DATA_RATE_LIMIT=20     # requests per minute

# Scraping Settings
SCRAPE_TIMEOUT=60000          # ms
MAX_CONCURRENT_SCRAPES=5
FALLBACK_TO_BRIGHT_DATA=true
```

### 10.2 MCP Configuration

```json
// .claude/mcp.json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@anthropics/mcp-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
    "bright-data": {
      "command": "npx",
      "args": ["-y", "@anthropics/mcp-bright-data"],
      "env": {
        "BRIGHT_DATA_API_KEY": "${BRIGHT_DATA_API_KEY}"
      }
    }
  }
}
```

---

## 11. Логика выбора скрапера

```python
# services/market_analytics/scraper_selector.py

class ScraperSelector:
    """Умный выбор скрапера на основе URL и истории"""

    # Домены, требующие Bright Data
    HEAVY_DOMAINS = {
        "linkedin.com",
        "facebook.com",
        "instagram.com",
        "twitter.com",
        "amazon.com",
        "google.com/search",
        "yandex.ru/search"
    }

    # Паттерны Cloudflare
    CLOUDFLARE_SIGNATURES = [
        "cloudflare",
        "cf-ray",
        "checking your browser"
    ]

    def __init__(self):
        self.failure_cache = TTLCache(maxsize=1000, ttl=3600)

    def select(self, url: str) -> str:
        """
        Возвращает рекомендуемый скрапер: 'firecrawl' или 'bright_data'
        """
        domain = urlparse(url).netloc

        # 1. Проверяем известные тяжёлые домены
        if any(hd in domain for hd in self.HEAVY_DOMAINS):
            return "bright_data"

        # 2. Проверяем кэш неудачных попыток
        if url in self.failure_cache:
            return "bright_data"

        # 3. По умолчанию - лёгкий скрапинг
        return "firecrawl"

    def record_failure(self, url: str, error: str):
        """Записываем неудачную попытку Firecrawl"""
        if any(sig in error.lower() for sig in self.CLOUDFLARE_SIGNATURES):
            self.failure_cache[url] = True
```

---

## 12. Roadmap реализации

### Phase 1: Foundation (Week 1)
- [ ] Модели данных (SQLAlchemy)
- [ ] MCP клиенты (Brave, Firecrawl, Bright Data)
- [ ] Базовые API endpoints
- [ ] Unit тесты для MCP клиентов

### Phase 2: Core Pipelines (Week 2)
- [ ] LangGraph orchestrator
- [ ] Competitor Analysis pipeline
- [ ] Smart scraper selector
- [ ] Error handling & retries

### Phase 3: Advanced Features (Week 3)
- [ ] Market Sizing pipeline
- [ ] Trend Tracking pipeline
- [ ] Price Monitoring pipeline
- [ ] SSE streaming для прогресса

### Phase 4: Frontend & Polish (Week 4)
- [ ] Analytics dashboard страница
- [ ] Компоненты визуализации
- [ ] Интеграция с Board Meeting (советники могут использовать аналитику)
- [ ] Документация

---

## 13. Интеграция с существующей системой

### Связь с Board Meeting

```python
# Советники могут использовать данные аналитики

class BoardMeetingWithAnalytics:
    """Расширенный Board Meeting с доступом к аналитике рынка"""

    async def get_context(self, question: str, org_id: UUID) -> str:
        # Существующий RAG контекст
        doc_context = await self.get_document_context(question, org_id)

        # Добавляем контекст аналитики
        analytics_context = await self.get_analytics_context(question, org_id)

        return f"""
        ## Документы компании:
        {doc_context}

        ## Данные аналитики рынка:
        {analytics_context}
        """
```

---

## 14. Стоимость и лимиты

| Сервис | Тарификация | Примерный расход |
|--------|-------------|------------------|
| Brave Search | $0.009/запрос | ~$9/1000 запросов |
| Firecrawl | $0.001/страница | ~$1/1000 страниц |
| Bright Data | $0.01-0.05/запрос | ~$20/1000 запросов |

**Рекомендация:** Использовать Bright Data только как fallback для экономии бюджета.

---

## 15. Безопасность

1. **API ключи** - хранятся в secrets, не в коде
2. **Rate limiting** - на уровне API и MCP клиентов
3. **Валидация URL** - защита от SSRF
4. **Логирование** - все запросы логируются для аудита
5. **Кэширование** - уменьшает нагрузку и стоимость

---

*Документ создан: 2026-01-09*
*Автор: Claude Code*
