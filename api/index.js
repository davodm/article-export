import Humanoid from "humanoid-js";
import { extractFromHtml } from "@extractus/article-extractor";
import { Redis } from "@upstash/redis";
import Crypto from "crypto";

/**
 * Generate SHA1
 * @param {String} data
 * @returns {String}
 */
function sha1(data) {
  return Crypto.createHash("sha1").update(data, "binary").digest("hex");
}

/**
 * Serverless function to provide parsed article of an URL
 * @param {*} request 
 * @param {*} response 
 * @returns {String}
 */
export default async function handler(request, response) {
  try {
    //Check request body
    if (!request.body || !request?.body?.url || !request?.body?.key) {
      throw new Error("No body attributes received");
    }
    //Check Secret Key
    if (!process.env.SECRET_KEY.split(",").includes(request.body.key)) {
      throw new Error("Secret key is wrong");
    }
    //Start Redis client
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    //Hash of URL
    const hash = sha1(request.body.url);
    //Get cache from redis
    let article = await redis.hgetall(hash);
    //There is no cache, fetch the URL
    if (article === null) {
      //Fetch with humanoid
      const hmo = new Humanoid();
      const req = await hmo.get(request.body.url);
      //Parse Article
      article = await extractFromHtml(req.body, request.body.url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        },
      });
      //Nothing to extract
      if (article === null) {
        throw new Error("Can not extract article");
      }
      //Set Cache by using pipeline since it's hmset
      const p = redis.pipeline();
      await p
        .hmset(hash, article)
        .expire(hash, 3600 * 24 * parseInt(process.env.REDIS_CACHE_DAYS))
        .exec();
    }
    //Response
    return response.status(200).json({
      status: 0,
      article: article,
    });
  } catch (err) {
    return response.status(500).json({
      status: -1,
      error: err.message,
    });
  }
}
