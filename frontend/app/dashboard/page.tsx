'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { ReviewStats, Review } from '@/types';
import StarRating from '@/components/ui/StarRating';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  HiOutlineStar,
  HiOutlineBell,
  HiOutlineTrendingUp,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/reviews/stats');
      setStats(res.data);
    } catch {
      // no-op
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function fetchGoogleReviews() {
    setIsFetching(true);
    try {
      const res = await api.post('/reviews/fetch');
      toast.success(res.data.count > 0 ? `Fetched ${res.data.count} new reviews!` : 'Reviews are up to date');
      await loadStats();
    } catch {
      toast.error('Failed to fetch reviews');
    } finally {
      setIsFetching(false);
    }
  }

  const ratingColor = (r: number) => {
    if (r >= 4) return 'text-emerald-600';
    if (r === 3) return 'text-amber-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.restaurantName
              ? `Here&apos;s what&apos;s happening at ${user.restaurantName}`
              : "Here's your reputation overview"}
          </p>
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

      {/* Stats grid */}
      {stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Average Rating"
              value={stats.averageRating > 0 ? `${stats.averageRating} ⭐` : '—'}
              subtitle={`${stats.total} total reviews`}
              icon={HiOutlineStar}
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <StatCard
              title="Positive Reviews"
              value={stats.positive}
              subtitle={stats.total > 0 ? `${Math.round((stats.positive / stats.total) * 100)}% of total` : 'No reviews yet'}
              icon={HiOutlineTrendingUp}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <StatCard
              title="Negative Reviews"
              value={stats.negative}
              subtitle="Need attention"
              icon={HiOutlineBell}
              color="text-red-600"
              bgColor="bg-red-50"
            />
            <StatCard
              title="Unread Reviews"
              value={stats.unread}
              subtitle="Awaiting your response"
              icon={HiOutlineCheckCircle}
              color="text-indigo-600"
              bgColor="bg-indigo-50"
            />
          </div>

          {/* Sentiment breakdown */}
          {stats.total > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Sentiment Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: 'Positive', count: stats.positive, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
                  { label: 'Neutral', count: stats.neutral, color: 'bg-amber-500', textColor: 'text-amber-700' },
                  { label: 'Negative', count: stats.negative, color: 'bg-red-500', textColor: 'text-red-700' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`w-20 text-sm font-medium ${item.textColor}`}>{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: stats.total > 0 ? `${(item.count / stats.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent reviews */}
          {stats.recentReviews.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Reviews</h2>
                <Link href="/reviews" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recentReviews.map((review: Review) => (
                  <div key={review.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 font-semibold text-sm">
                        {review.authorName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">{review.authorName}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {format(new Date(review.publishedAt), 'MMM d')}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      <p className="text-xs text-gray-600 mt-1 truncate">{review.text}</p>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${ratingColor(review.rating)}`}>
                      {review.rating}/5
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineSparkles className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500 mb-4">Click &quot;Fetch Reviews&quot; to sync your Google reviews</p>
              <button
                onClick={fetchGoogleReviews}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <HiOutlineRefresh className="w-4 h-4" />
                Fetch Reviews Now
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
