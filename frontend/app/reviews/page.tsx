'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Review } from '@/types';
import ReviewCard from '@/components/reviews/ReviewCard';
import toast from 'react-hot-toast';
import { HiOutlineRefresh, HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';

const FILTERS = [
  { label: 'All', value: '' },
  { label: '5 Stars', value: '5' },
  { label: '4 Stars', value: '4' },
  { label: '3 Stars', value: '3' },
  { label: '2 Stars', value: '2' },
  { label: '1 Star', value: '1' },
];

const SENTIMENT_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');

  const loadReviews = useCallback(async (p = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: 10 };
      if (search) params.search = search;
      if (ratingFilter) params.rating = ratingFilter;
      if (sentimentFilter) params.sentiment = sentimentFilter;
      const res = await api.get('/reviews', { params });
      setReviews(res.data.reviews);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [search, ratingFilter, sentimentFilter]);

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  async function fetchGoogleReviews() {
    setIsFetching(true);
    try {
      const res = await api.post('/reviews/fetch');
      toast.success(res.data.count > 0 ? `Fetched ${res.data.count} new reviews!` : 'Reviews are up to date');
      await loadReviews(1);
    } catch {
      toast.error('Failed to fetch reviews');
    } finally {
      setIsFetching(false);
    }
  }

  function handleReviewUpdate(updated: Review) {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 mt-1">{total} total reviews</p>
        </div>
        <button
          onClick={fetchGoogleReviews}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Fetching...' : 'Fetch Reviews'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900"
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Rating:</span>
            <div className="flex gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setRatingFilter(f.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    ratingFilter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sentiment:</span>
            <div className="flex gap-1">
              {SENTIMENT_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSentimentFilter(f.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    sentimentFilter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">No reviews found. Try fetching reviews or adjusting filters.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onUpdate={handleReviewUpdate} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total} reviews
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => loadReviews(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                  {page}
                </span>
                <button
                  onClick={() => loadReviews(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
