/**
 * Content Validator - Detects cookie walls, paywalls, and invalid content
 */

/**
 * Detect if content is a cookie consent wall
 * @param {Object} article - Extracted article object
 * @returns {Object} Detection result with isCookieWall boolean and confidence
 */
export function detectCookieWall(article) {
  if (!article || !article.content) {
    return { isCookieWall: false, confidence: 0 };
  }

  const content = article.content.toLowerCase();
  const title = (article.title || '').toLowerCase();
  const description = (article.description || '').toLowerCase();

  // Cookie wall indicators
  const cookieIndicators = [
    'accept all',
    'reject all',
    'accept cookies',
    'cookie consent',
    'cookie policy',
    'privacy settings',
    'manage privacy',
    'we use cookies',
    'iab transparency',
    'consent framework',
    'your privacy',
    'our partners',
    'cookie banner',
  ];

  // Count how many indicators are present
  let indicatorCount = 0;
  for (const indicator of cookieIndicators) {
    if (
      content.includes(indicator) ||
      title.includes(indicator) ||
      description.includes(indicator)
    ) {
      indicatorCount++;
    }
  }

  // Additional checks
  const hasAcceptButton =
    content.includes('accept all') || content.includes('accept cookies');
  const hasRejectButton =
    content.includes('reject all') || content.includes('reject cookies');
  const shortContent = article.content.length < 1000;
  const genericTitle =
    title.includes('cookies') ||
    title.includes('privacy') ||
    title.includes('consent');

  // Calculate confidence (0-100)
  let confidence = 0;
  confidence += indicatorCount * 10;
  if (hasAcceptButton) confidence += 20;
  if (hasRejectButton) confidence += 15;
  if (shortContent && indicatorCount > 2) confidence += 15;
  if (genericTitle) confidence += 10;

  // Cap at 100
  confidence = Math.min(confidence, 100);

  // Decision threshold
  const isCookieWall = confidence >= 40;

  return {
    isCookieWall,
    confidence,
    indicators: indicatorCount,
    details: {
      hasAcceptButton,
      hasRejectButton,
      shortContent,
      genericTitle,
      contentLength: article.content.length,
    },
  };
}

/**
 * Detect if content is a paywall
 * @param {Object} article - Extracted article object
 * @returns {Object} Detection result with isPaywall boolean and confidence
 */
export function detectPaywall(article) {
  if (!article || !article.content) {
    return { isPaywall: false, confidence: 0 };
  }

  const content = article.content.toLowerCase();
  const title = (article.title || '').toLowerCase();

  const paywallIndicators = [
    'subscribe',
    'subscription',
    'paywall',
    'premium content',
    'member only',
    'members only',
    'sign in to continue',
    'login to read',
    'this article is for subscribers',
    'become a member',
    'unlock this article',
  ];

  let indicatorCount = 0;
  for (const indicator of paywallIndicators) {
    if (content.includes(indicator) || title.includes(indicator)) {
      indicatorCount++;
    }
  }

  const shortContent = article.content.length < 500;
  const confidence = Math.min(indicatorCount * 15 + (shortContent ? 20 : 0), 100);
  const isPaywall = confidence >= 30;

  return {
    isPaywall,
    confidence,
    indicators: indicatorCount,
  };
}

/**
 * Validate article quality
 * @param {Object} article - Extracted article object
 * @returns {Object} Validation result with issues detected
 */
export function validateArticleQuality(article) {
  const cookieWall = detectCookieWall(article);
  const paywall = detectPaywall(article);

  const hasValidTitle = article.title && article.title.length > 10;
  const hasValidContent = article.content && article.content.length > 200;
  const hasValidDescription =
    article.description && article.description.length > 20;

  const issues = [];
  if (cookieWall.isCookieWall) {
    issues.push({
      type: 'cookie_wall',
      severity: 'high',
      confidence: cookieWall.confidence,
      message: 'Content appears to be a cookie consent wall',
      details: cookieWall.details,
    });
  }
  if (paywall.isPaywall) {
    issues.push({
      type: 'paywall',
      severity: 'high',
      confidence: paywall.confidence,
      message: 'Content appears to be behind a paywall',
    });
  }
  if (!hasValidTitle) {
    issues.push({
      type: 'invalid_title',
      severity: 'medium',
      message: 'Title is missing or too short',
    });
  }
  if (!hasValidContent) {
    issues.push({
      type: 'insufficient_content',
      severity: 'high',
      message: 'Content is missing or too short',
    });
  }

  return {
    isValid: issues.length === 0,
    hasBlocker: cookieWall.isCookieWall || paywall.isPaywall,
    issues,
    quality: {
      hasValidTitle,
      hasValidContent,
      hasValidDescription,
      contentLength: article.content ? article.content.length : 0,
    },
  };
}

