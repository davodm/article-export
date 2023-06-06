# Simple Serverless Node.js Export Article App
This is a simple serverless Node.js application that uses [Humanoid-js](https://github.com/evyatarmeged/Humanoid) and [article-extractor](https://github.com/extractus/article-extractor) to bypass Cloudflare's anti-bot measures and fetch article details such as image and title.

The details will be stored in Redis cache for faster retrieval in the future.

### Prerequisites
Before you can run this application, you will need to have the following installed:

- Node.js v14.x or later 
- Serverless Redis [upstash.com](https://upstash.com)

### Installation
Clone the repository to your local machine.

Navigate to the project directory and deploy the package on Vercel or AWS Lambda.

Use the following environment variables:

```bash
UPSTASH_REDIS_REST_TOKEN=<your Redis token>
UPSTASH_REDIS_REST_URL=<your Redis url>
SECRET_KEY=<secret key 1>,<secret key2>,...
REDIS_CACHE_DAYS=10
```

You can run a development version locally via `vercel dev`.

### Usage
Once the application is running, you can access it by sending a POST request to the following endpoint:
```
http://<ENDPOINT_URL>:3000/api
```
The request should include a JSON body with the following parameters:
```JSON
{
  "key": "<your secret key>",
  "url": "<article URL>"
}
```
Replace `<article URL>` with the URL of the article you want to fetch details for. Replace `<Your secret key>` with one of the keys that you have set in enviornments key.

## Contributing

We welcome contributions to this project! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch with your changes
3. Submit a pull request to the main branch

Before submitting your pull request, please ensure that your code follows the project's coding standards and that all tests are passing.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.