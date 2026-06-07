# Tarot Core API

AI-powered tarot card reading service. Uses OpenAI GPT-4o-mini to generate fortune-telling messages from randomly drawn tarot cards, with Valkey caching for performance optimization.

---

## Tech Stack

| Layer | Technology |
|------|------|
| **Framework** | NestJS v11 + TypeScript |
| **AI** | OpenAI API (gpt-4o-mini) |
| **Cache** | Valkey (Redis-compatible, via ioredis) |
| **Validation** | Zod |
| **Config** | YAML + environment variable overrides |
| **Container** | Docker (multi-stage build) |
| **Orchestration** | Kubernetes (Helm Chart) |

---

## Architecture

```mermaid
flowchart TB
    Client["Client"] -->|"GET /tarot/read"| App["NestJS App"]
    App --> Tarot["TarotService"]
    Tarot -->|"Check Cache"| Valkey[("Valkey<br/>Cache")]
    Tarot -->|"Cache Miss"| OpenAI[("OpenAI API<br/>GPT-4o-mini")]
    Valkey -->|"Cache Hit"| Response["Response"]
    OpenAI -->|"Generate Message"| Valkey
    OpenAI --> Response
    Response --> Client

    subgraph Config["Configuration"]
        YAML["config.yaml"]
        ENV["Environment Variables"]
    end

    Config --> App
```

---

## Flow

```mermaid
sequenceDiagram
    participant Client
    participant App as NestJS App
    participant Service as TarotService
    participant Cache as Valkey
    participant AI as OpenAI API

    Client->>App: GET /tarot/read
    App->>Service: readTarot()

    Service->>Service: Random Card (78 cards)
    Service->>Service: Random Direction (upright/reversed)
    Service->>Service: Random Bucket (1~10)
    Service->>Service: Random Keywords (4)

    Service->>Cache: GET tarot:read:{card}:{dir}:{bucket}

    alt Cache Hit
        Cache-->>Service: Cached Result
    else Cache Miss
        Service->>AI: Chat Completion (with Zod schema)
        AI-->>Service: {keywords, advice}
        Service->>Service: Inject card.name / card.nameKR
        Service->>Cache: SET tarot:read:{card}:{dir}:{bucket}
    end

    Service-->>App: ReadResponse
    App-->>Client: {message: "success", data: {...}}
```

---

## API

### Health Check
```
GET /health
```

### Tarot Reading
```
GET /tarot/read
```

**Response**
```json
{
  "message": "success",
  "data": {
    "title": "The Fool",
    "titleKR": "바보",
    "keywords": ["사랑", "시작", "설렘", "인간관계"],
    "advice": "새로운 시작을 두려워하지 마세요..."
  }
}
```

---

## Configuration

Configuration is YAML-based and can be overridden with environment variables.

### Priority (high to low)
1. Environment variables (`OPENAI_API_KEY`, `VALKEY_PASSWORD`, etc.)
2. YAML file (`CONFIG_PATH` or default `/app/config/config.yaml`)
3. Hardcoded defaults

### Environment Variables

| Variable | Description | Required |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI API key | **Yes** |
| `VALKEY_PASSWORD` | Valkey password | No |
| `VALKEY_HOST` | Valkey host (default: valkey) | No |
| `VALKEY_PORT` | Valkey port (default: 6379) | No |
| `VALKEY_PREFIX` | Key prefix | No |
| `CONFIG_PATH` | YAML config file path | No |

---

## Run

### Local Development
```bash
npm install
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Test
```bash
npm run test        # unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # coverage
```

---

## Deploy

### Docker
```bash
make docker-build
```

### Kubernetes (Helm)
```bash
make helm-install HELM_VALUES="--set config.openai.existingSecret=openai-secret"
```

---

## Project Structure

```
src/
├── config/          # YAML load, validation, env overrides
├── controllers/     # HTTP request handlers
├── filters/         # Exception filters
├── modules/         # NestJS modules
├── schemas/         # Zod schemas
└── services/        # Business logic (Tarot, OpenAI, Valkey)
```
