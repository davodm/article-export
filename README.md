# Article Export - Serverless Content Extractor

A high-performance, serverless Node.js application that extracts article data from URLs while bypassing Cloudflare's anti-bot measures. Built with modern JavaScript (ES2022) and optimized for Node.js v18+ and Vercel deployment.

## ✨ Features

### 🚀 Core Functionality
- **Dual Bypass Strategy**: Two-tier anti-bot bypass system
  - Primary: `humanoid-js` for basic-medium Cloudflare protection
  - Secondary: `impit` with browser fingerprint spoofing
  - Automatic fallback if primary method fails
- **Smart Caching**: Redis-based caching with configurable TTL (default: 10 days)
- **Content Extraction**: Extracts title, content, images, author, published date, and metadata
- **Quality Validation**: Automatic detection of cookie walls, paywalls, and invalid content
- **Dual HTTP Methods**: Supports both GET and POST requests

### 🔒 Security & Reliability
- **Secret Key Authentication**: Multi-key support with comma-separated values
- **Input Validation**: URL format validation and sanitization
- **Redis Fallback**: Service continues without cache if Redis is unavailable
- **Timeout Handling**: 25-second timeout prevents hanging requests
- **Error Sanitization**: Production-safe error messages

### 📊 Monitoring & Observability
- **Strategy Reporting**: Shows which bypass method succeeded (`humanoid` or `impit`)
- **Performance Tracking**: Response time measurement for every request
- **Content Validation**: Reports on article quality and detected blockers
- **Health Endpoint**: Service health and Redis connectivity monitoring
- **Cache Status**: Indicates if content was served from cache or freshly fetched

### 🌐 Developer Experience
- **CORS Support**: Cross-origin requests enabled for all methods
- **RESTful API**: Clean, consistent JSON responses
- **Comprehensive Testing**: 7 automated checks for project integrity
- **Modern Tooling**: ESLint v9, Prettier, ES2022 features
- **Serverless Ready**: Optimized for Vercel free tier (<50MB)

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or later (fully compatible with Node.js v22)
- **Vercel CLI**: Install globally with `npm i -g vercel`
- **Upstash Redis**: For caching (free tier available at [upstash.com](https://upstash.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/davodm/article-export.git
   cd article-export
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:

   ```bash
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   UPSTASH_REDIS_REST_URL=your_redis_url
   SECRET_KEY=your_secret_key1,your_secret_key2
   REDIS_CACHE_DAYS=10
   ```

4. **Run tests to verify setup**

   ```bash
   npm test
   ```

5. **Start local development**
   ```bash
   vercel dev
   ```

## 📡 API Usage

### Endpoints

#### Main API: `GET /api` or `POST /api`

Extracts article content from a given URL. Supports both GET and POST methods.

#### Health Check: `GET /api/health`

Monitors service health and Redis connection status.

### Request Format

The API supports both GET and POST methods with the same parameters:

**GET Request (Query Parameters):**

```bash
GET /api?key=your_secret_key&url=https://example.com/article
```

**POST Request (JSON Body):**

```json
{
  "key": "your_secret_key",
  "url": "https://example.com/article"
}
```

### Response Format

**Success Response (200):**

```json
{
  "status": 0,
  "article": {
    "title": "Article Title",
    "content": "Article content...",
    "image": "https://example.com/image.jpg",
    "author": "Author Name",
    "publishedTime": "2024-01-01T00:00:00.000Z"
  },
  "cached": false,
  "strategy": "humanoid",
  "validation": {
    "isValid": true,
    "hasBlocker": false,
    "issues": [],
    "quality": {
      "hasValidTitle": true,
      "hasValidContent": true,
      "hasValidDescription": true,
      "contentLength": 2540
    }
  },
  "processingTime": "1250ms",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response Fields:**
- `status`: `0` for success, `-1` for error
- `article`: Extracted article data (title, content, author, etc.)
- `cached`: `true` if served from cache, `false` if freshly fetched
- `strategy`: Which fetch method was used (`"humanoid"` or `"impit"`), `null` if from cache
- `validation`: Content quality and blocker detection (see below)
- `processingTime`: Total processing time in milliseconds
- `timestamp`: ISO timestamp of the response

**Validation Object:**
- `isValid`: `true` if content is valid, `false` if issues detected
- `hasBlocker`: `true` if cookie wall or paywall detected
- `issues`: Array of detected issues (cookie walls, paywalls, etc.)
- `quality`: Quality metrics (title, content, description validity)

**Error Response (4xx/5xx):**

```json
{
  "status": -1,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Health Check Response:**

```json
{
  "status": 0,
  "message": "Service is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "nodeVersion": "v22.15.1",
  "redis": "connected",
  "uptime": 123.456
}
```

### Example Usage

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Extract article content (GET method - simple and easy)
curl "https://your-app.vercel.app/api?key=your_secret_key&url=https://example.com/article"

# Extract article content (POST method - recommended for long URLs)
curl -X POST https://your-app.vercel.app/api \
  -H "Content-Type: application/json" \
  -d '{
    "key": "your_secret_key",
    "url": "https://example.com/article"
  }'
```

## 🛠️ Development

### Available Scripts

- `vercel dev` - Start local development server
- `npm run build` - Build the project (creates public directory for Vercel)
- `npm run deploy` - Deploy to production
- `npm run deploy:staging` - Deploy to staging
- `npm run lint` - Run ESLint for code quality
- `npm run format` - Format code with Prettier
- `npm test` - Run project validation tests
- `npm run clean` - Clean Vercel build files

### Code Quality

The project uses modern development tools:

- **ESLint v9** with flat config for code linting
- **Prettier** for consistent code formatting
- **ES2022** features for modern JavaScript
- **Comprehensive testing** with automated validation

### Local Development

1. **Install Vercel CLI globally:**

   ```bash
   npm i -g vercel
   ```

2. **Link your project:**

   ```bash
   vercel link
   ```

3. **Run locally:**
   ```bash
   vercel dev
   ```

## 📦 Dependencies

### Production Dependencies

| Package | Version | Status | Purpose |
|---------|---------|--------|---------|
| `@extractus/article-extractor` | ^8.0.20 | ✅ **Active** | Extracts article content, metadata, and structured data from HTML |
| `@upstash/redis` | ^1.35.6 | ✅ **Active** | Serverless Redis client for caching with REST API |
| `humanoid-js` | ^1.0.1 | ⚠️ **Deprecated** | Primary Cloudflare bypass (7 years old, but still functional) |
| `impit` | ^0.6.0 | ✅ **Active** | HTTP client with browser impersonation for secondary bypass |

### Development Dependencies

| Package | Version | Status | Purpose |
|---------|---------|--------|---------|
| `eslint` | ^9.38.0 | ✅ **Active** | Code linting with flat config support |
| `globals` | ^16.4.0 | ✅ **Active** | ESLint global variables for Node.js v24 compatibility |
| `prettier` | ^3.6.2 | ✅ **Active** | Code formatting |

### 📝 Dependency Notes

**humanoid-js (⚠️ Unmaintained)**
- Last updated: 7 years ago (2018)
- Status: Works for basic-medium Cloudflare protection
- Why we keep it: Simple, lightweight, no browser needed
- Fallback: `impit` automatically used if humanoid-js fails
- Future: Will replace when it stops working or better alternatives emerge

**Why This Approach Works:**
- ✅ Two bypass strategies provide redundancy
- ✅ Automatic fallback ensures reliability
- ✅ All dependencies work on Vercel free tier
- ✅ No browser automation needed (keeps function size <50MB)
- ✅ Total package size: ~15MB (well under 50MB limit)

### 🔄 Update Strategy

```bash
# Update all dependencies (safe - follows semver)
npm update

# Check for outdated packages
npm outdated

# Rebuild native modules after Node.js upgrade
npm rebuild
```

## 🏗️ Architecture

### Data Flow

```
Request → Validate Key & URL
    ↓
Check Redis Cache
    ↓
Cache Hit? → Return Cached Article ✅
    ↓
Cache Miss? → Fetch with Bypass Strategy
    ↓
Try humanoid-js → Success? → Extract & Cache → Return ✅
    ↓
Failed? → Try impit → Success? → Extract & Cache → Return ✅
    ↓
Failed? → Return Error ❌
```

### Bypass Strategy Logic

```javascript
// Automatic fallback system
1. Try humanoid-js (fast, lightweight)
   ↓ Success → Cache & Return
   ↓ Fail
2. Try impit (browser impersonation)
   ↓ Success → Cache & Return
   ↓ Fail
3. Return error with details
```

### Content Validation Flow

```
Extract Article → Validate Content
    ↓
Check for:
- Cookie walls (40+ confidence threshold)
- Paywalls (30+ confidence threshold)  
- Short content (< 200 chars)
- Missing title (< 10 chars)
    ↓
Return validation object with:
- isValid: boolean
- hasBlocker: boolean
- issues: array
- quality: metrics
```

## 🎯 Use Cases

### ✅ **What This API Is Great For:**
- 📰 News aggregators
- 📱 RSS feed readers
- 🔖 Bookmark managers with content preview
- 📊 Content analysis tools
- 🤖 Research bots
- 📚 Article archiving services
- 🔍 Content discovery platforms

### ⚠️ **Limitations:**
- **Cookie Walls**: Detects but cannot automatically accept (requires browser automation)
- **Paywalls**: Detects but cannot bypass (premium content protected)
- **JavaScript-heavy sites**: May return incomplete content
- **Rate limiting**: Subject to target site's rate limits
- **Dynamic content**: May miss content loaded via AJAX after initial render

### 💡 **Best Practices:**
- Cache aggressively (10-day default is reasonable for most content)
- Handle `validation.hasBlocker` in your client code
- Monitor `strategy` field to track bypass success rates
- Use POST for long URLs (avoid URL length limits)
- Implement retry logic with exponential backoff
- Check `cached` field to understand performance

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `UPSTASH_REDIS_REST_TOKEN` | ✅ Yes | - | Your Upstash Redis REST token |
| `UPSTASH_REDIS_REST_URL` | ✅ Yes | - | Your Upstash Redis REST URL (https://...) |
| `SECRET_KEY` | ✅ Yes | - | Comma-separated API keys for authentication |
| `REDIS_CACHE_DAYS` | ❌ No | `10` | Cache duration in days (recommend 10-30) |
| `NODE_ENV` | ❌ No | `development` | Environment (`development`, `production`) |

### Example Configuration

**`.env.local` for local development:**
```bash
UPSTASH_REDIS_REST_TOKEN=xxxx...
UPSTASH_REDIS_REST_URL=https://frank-lizard-12345.upstash.io
SECRET_KEY=my_dev_key_123,another_key_456
REDIS_CACHE_DAYS=10
NODE_ENV=development
```

**Vercel Environment Variables:**
1. Go to your Vercel project → Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Vercel will automatically inject them during deployment

### Cache Configuration Recommendations

| Content Type | Recommended TTL | Setting |
|--------------|----------------|---------|
| News articles | 1-3 days | `REDIS_CACHE_DAYS=1` |
| Blog posts | 7-14 days | `REDIS_CACHE_DAYS=7` |
| Static content | 30+ days | `REDIS_CACHE_DAYS=30` |
| **General use (default)** | **10 days** | `REDIS_CACHE_DAYS=10` |

## 🚀 Deployment

### Deploy to Vercel

**Quick Deploy:**
```bash
# Production deployment
npm run deploy

# Staging deployment
npm run deploy:staging
```

**First-time Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Link project: `vercel link`
3. Add environment variables in Vercel dashboard
4. Deploy: `npm run deploy`

## 🧪 Testing

### Automated Tests

The project includes 7 automated validation checks:

```bash
npm test
```

**What's tested:**
1. ✅ Project structure (all required files exist)
2. ✅ Code quality (ESLint passes)
3. ✅ Package scripts (deploy, test, lint, etc.)
4. ✅ Dependencies (all installed correctly)
5. ✅ Node.js compatibility (v18+)
6. ✅ Module exports (fetcher functions work)
7. ✅ Environment template (all variables documented)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow ESLint rules (run `npm run lint`)
- Use Prettier for formatting (run `npm run format`)
- Write meaningful commit messages
- Test your changes locally before submitting
- Ensure all tests pass (`npm test`)
- Update README if adding new features
- Keep dependencies up to date

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Davod Mozafari**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)
