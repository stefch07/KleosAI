'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Alert } from '@/types';
import { format } from 'date-fns';
import StarRating from '@/components/ui/StarRating';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { HiOutlineBell, HiOutlineCheck, HiOutlineCheckCircle, HiOutlineSparkles } from 'react-icons/hi';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [alertsRes, countRes] = await Promise.all([
        api.get('/alerts', { params: { limit: 20, unreadOnly: showUnreadOnly } }),
        api.get('/alerts/unread-count'),
      ]);
      setAlerts(alertsRes.data.alerts);
      setTotal(alertsRes.data.total);
      setUnreadCount(countRes.data.count);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, [showUnreadOnly]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  async function markAllRead() {
    try {
      await api.patch('/alerts/mark-all-read');
      toast.success('All alerts marked as read');
      await loadAlerts();
    } catch {
      toast.error('Failed to mark alerts as read');
    }
  }

  async function markAlertRead(alertId: string) {
    try {
      await api.patch(`/alerts/${alertId}/read`);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">Negative reviews that need your attention</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <HiOutlineCheckCircle className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowUnreadOnly(false)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !showUnreadOnly ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({total})
        </button>
        <button
          onClick={() => setShowUnreadOnly(true)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showUnreadOnly ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All clear!</h3>
          <p className="text-gray-500">No {showUnreadOnly ? 'unread ' : ''}negative review alerts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                !alert.isRead ? 'border-red-200 shadow-sm' : 'border-gray-200'
              }`}
            >
              {/* Alert header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!alert.isRead ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <HiOutlineBell className={`w-4 h-4 ${!alert.isRead ? 'text-red-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${!alert.isRead ? 'text-red-700' : 'text-gray-500'}`}>
                    {!alert.isRead ? 'New negative review' : 'Negative review'}
                  </span>
                  <span className="text-xs text-gray-400">
                    · {format(new Date(alert.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => markAlertRead(alert.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <HiOutlineCheck className="w-3.5 h-3.5" />
                    Mark read
                  </button>
                )}
              </div>

              {/* Review content */}
              <div className="ml-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-700 font-semibold text-xs">
                      {alert.review.authorName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{alert.review.authorName}</p>
                    <StarRating rating={alert.review.rating} size="sm" />
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">{alert.review.text}</p>

                {alert.review.aiResponse ? (
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <HiOutlineSparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Response Ready</span>
                    </div>
                    <p className="text-gray-700 text-sm">{alert.review.aiResponse}</p>
                  </div>
                ) : (
                  <Link
                    href="/reviews"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <HiOutlineSparkles className="w-4 h-4" />
                    Generate AI response →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
