const prisma = require('../lib/prisma');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mock Google reviews data for demo purposes
const MOCK_REVIEWS = [
  {
    googleReviewId: 'google_review_001',
    authorName: 'Sarah Johnson',
    authorPhotoUrl: null,
    rating: 5,
    text: 'Absolutely amazing experience! The food was outstanding and the service was impeccable. Our server was attentive without being intrusive. The pasta was cooked to perfection. Will definitely be coming back!',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    googleReviewId: 'google_review_002',
    authorName: 'Mike Chen',
    authorPhotoUrl: null,
    rating: 4,
    text: 'Great food and atmosphere. The steak was cooked perfectly. Service was a bit slow during peak hours but overall a wonderful dining experience. The dessert menu is fantastic.',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    googleReviewId: 'google_review_003',
    authorName: 'Emily Rodriguez',
    authorPhotoUrl: null,
    rating: 2,
    text: 'Very disappointing visit. We waited 45 minutes for our food and when it arrived, it was cold. The waiter seemed overwhelmed and forgot our drink order twice. Expected much better based on previous visits.',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    googleReviewId: 'google_review_004',
    authorName: 'David Park',
    authorPhotoUrl: null,
    rating: 5,
    text: 'Best restaurant in town! Every dish we ordered was a masterpiece. The chef clearly has a passion for quality ingredients. The ambiance is perfect for a romantic dinner. Highly recommended!',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    googleReviewId: 'google_review_005',
    authorName: 'Lisa Thompson',
    authorPhotoUrl: null,
    rating: 3,
    text: 'Decent place but nothing special. Food was okay, service was average. The price point is a bit high for the quality offered. I might come back to try their specials.',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    googleReviewId: 'google_review_006',
    authorName: 'James Wilson',
    authorPhotoUrl: null,
    rating: 1,
    text: 'Terrible experience. Found a hair in my food and the manager was dismissive about it. The place was also not very clean. I will never return and I am warning everyone to stay away.',
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    googleReviewId: 'google_review_007',
    authorName: 'Amanda Foster',
    authorPhotoUrl: null,
    rating: 5,
    text: 'Incredible dining experience from start to finish! The sommelier helped us pick the perfect wine pairing. The tasting menu was exceptional. This is our new favorite spot for special occasions.',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    googleReviewId: 'google_review_008',
    authorName: 'Robert Kim',
    authorPhotoUrl: null,
    rating: 4,
    text: 'Very good food and nice staff. The seafood risotto was creamy and flavorful. The only downside was the noise level - quite loud during dinner service. Would recommend for lunch.',
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
];

function analyzeSentiment(rating) {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

async function fetchReviews(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const createdReviews = [];

    for (const mockReview of MOCK_REVIEWS) {
      const existing = await prisma.review.findFirst({
        where: { userId: req.userId, googleReviewId: mockReview.googleReviewId },
      });

      if (!existing) {
        const sentiment = analyzeSentiment(mockReview.rating);
        const review = await prisma.review.create({
          data: {
            userId: req.userId,
            googleReviewId: mockReview.googleReviewId,
            authorName: mockReview.authorName,
            authorPhotoUrl: mockReview.authorPhotoUrl,
            rating: mockReview.rating,
            text: mockReview.text,
            publishedAt: mockReview.publishedAt,
            sentiment,
          },
        });

        // Create alert for negative reviews
        if (sentiment === 'negative') {
          await prisma.alert.create({
            data: { userId: req.userId, reviewId: review.id },
          });
        }

        createdReviews.push(review);
      }
    }

    res.json({ message: `Fetched ${createdReviews.length} new reviews`, count: createdReviews.length });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getReviews(req, res) {
  const { page = 1, limit = 10, rating, sentiment, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = { userId: req.userId };
  if (rating) where.rating = Number(rating);
  if (sentiment) where.sentiment = sentiment;
  if (search) {
    where.OR = [
      { authorName: { contains: search, mode: 'insensitive' } },
      { text: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.review.count({ where }),
    ]);

    res.json({ reviews, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getReviewById(req, res) {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    console.error('Get review error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function generateResponse(req, res) {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { user: { select: { restaurantName: true, name: true } } },
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const restaurantName = review.user.restaurantName || 'our restaurant';
    const ownerName = review.user.name;

    const prompt = `You are a professional restaurant owner responding to a Google review. Write a helpful, empathetic, and professional response.

Restaurant: ${restaurantName}
Owner/Manager: ${ownerName}
Review Rating: ${review.rating}/5 stars
Review Text: "${review.text}"

Guidelines:
- Be warm, professional, and authentic
- For positive reviews: thank the customer and highlight specific things they mentioned
- For negative reviews: apologize sincerely, acknowledge the issue, explain what you're doing to fix it, and invite them back
- For neutral reviews: thank them and encourage another visit
- Keep the response concise (2-4 sentences)
- Sign off with the owner/manager name
- Do NOT include any meta-commentary, just the response itself`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content.trim();

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: { aiResponse, responseStatus: 'generated' },
    });

    res.json({ aiResponse, review: updated });
  } catch (err) {
    console.error('Generate response error:', err);
    if (err.code === 'invalid_api_key' || (err.status && err.status === 401)) {
      return res.status(402).json({ error: 'Invalid OpenAI API key. Please configure a valid key.' });
    }
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
}

async function markReviewRead(req, res) {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(review);
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStats(req, res) {
  try {
    const [total, positive, neutral, negative, unread, avgRating] = await Promise.all([
      prisma.review.count({ where: { userId: req.userId } }),
      prisma.review.count({ where: { userId: req.userId, sentiment: 'positive' } }),
      prisma.review.count({ where: { userId: req.userId, sentiment: 'neutral' } }),
      prisma.review.count({ where: { userId: req.userId, sentiment: 'negative' } }),
      prisma.review.count({ where: { userId: req.userId, isRead: false } }),
      prisma.review.aggregate({ where: { userId: req.userId }, _avg: { rating: true } }),
    ]);

    const recentReviews = await prisma.review.findMany({
      where: { userId: req.userId },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    res.json({
      total,
      positive,
      neutral,
      negative,
      unread,
      averageRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : 0,
      recentReviews,
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { fetchReviews, getReviews, getReviewById, generateResponse, markReviewRead, getStats };
