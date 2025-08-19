# Article Export - Serverless Content Extractor

A high-performance, serverless Node.js application that extracts article data from URLs while bypassing Cloudflare's anti-bot measures. Built with modern JavaScript (ES2022) and optimized for Node.js v18+ and Vercel deployment.

## ✨ Features

- **Anti-Bot Bypass**: Uses Humanoid-js to bypass Cloudflare and other anti-bot protections
- **Smart Caching**: Redis-based caching system for improved performance and reduced API calls
- **Content Extraction**: Extracts title, content, images, and metadata using article-extractor
- **Serverless Architecture**: Optimized for Vercel with automatic scaling
- **Security**: Secret key authentication system
- **CORS Support**: Built-in CORS headers for cross-origin requests
- **Error Handling**: Comprehensive error handling with production-safe error messages
- **Performance Monitoring**: Built-in response time tracking
- **Health Monitoring**: Built-in health check endpoint

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
   npm run dev
   ```

## 📡 API Usage

### Endpoints

#### Main API: `POST /api`

Extracts article content from a given URL.

#### Health Check: `GET /api/health`

Monitors service health and Redis connection status.

### Request Format

**Main API Request:**

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
  "processingTime": "1250ms",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

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

# Extract article content
curl -X POST https://your-app.vercel.app/api \
  -H "Content-Type: application/json" \
  -d '{
    "key": "your_secret_key",
    "url": "https://example.com/article"
  }'
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start local development server
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
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable                   | Description                      | Required | Default     |
| -------------------------- | -------------------------------- | -------- | ----------- |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis token         | ✅       | -           |
| `UPSTASH_REDIS_REST_URL`   | Your Upstash Redis URL           | ✅       | -           |
| `SECRET_KEY`               | Comma-separated secret keys      | ✅       | -           |
| `REDIS_CACHE_DAYS`         | Cache duration in days           | ❌       | 10          |
| `NODE_ENV`                 | Environment (production/staging) | ❌       | development |

### Redis Cache Settings

- **Default Cache Duration**: 10 days (configurable)
- **Cache Key**: SHA1 hash of the URL for efficient storage
- **Storage**: Hash-based storage for optimal performance
- **TTL**: Automatic expiration based on configuration

### Performance Optimizations

- **Function Timeout**: 30 seconds for main API, 10 seconds for health check
- **Caching Strategy**: Redis hash storage with configurable TTL
- **Error Handling**: Graceful degradation with user-friendly messages
- **Memory Management**: Optimized for Node.js v22 performance

## 🌟 Node.js v22 Compatibility

This project is fully optimized for Node.js v22 and includes:

- **ES2022 Features**: Modern JavaScript syntax and features
- **Performance Optimizations**: Leverages Node.js v22 improvements
- **Memory Management**: Efficient memory handling for serverless environments
- **Async Operations**: Optimized for Node.js v22 async performance

## 📊 Performance Characteristics

- **Response Time**: 500ms - 2s for new articles (depending on target site)
- **Cache Hit**: Sub-100ms for cached articles
- **Scalability**: Automatic scaling with Vercel's infrastructure
- **Reliability**: 99.9%+ uptime with Vercel's global edge network
- **Memory Usage**: Optimized for serverless function constraints

## 🔒 Security Features

- **Secret Key Authentication**: Required for all API calls
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Sanitization**: Production-safe error messages
- **CORS Protection**: Configurable cross-origin policies
- **Rate Limiting**: Built-in protection against abuse
- **Redis Security**: Secure connection handling with Upstash

## 🚀 Deployment

The project is configured for seamless Vercel deployment:

- **Automatic Build**: Creates required public directory
- **Function Configuration**: Optimized timeout and memory settings
- **Environment Management**: Easy environment variable configuration
- **Zero-Config**: Works out of the box with Vercel

To deploy, simply run `npm run deploy` for production or `npm run deploy:staging` for staging.

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Humanoid-js](https://github.com/evyatarmeged/Humanoid) - Anti-bot detection bypass
- [article-extractor](https://github.com/extractus/article-extractor) - Content extraction
- [Upstash Redis](https://upstash.com/) - Serverless Redis
- [Vercel](https://vercel.com/) - Serverless deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/davodm/article-export/issues) page
2. Create a new issue with detailed information
3. Include your Node.js version and environment details
4. Check the deployment scripts in package.json for deployment options

---

**Made with ❤️ by Davod Mozafari**
