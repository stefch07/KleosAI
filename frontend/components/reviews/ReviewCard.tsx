'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Review } from '@/types';
import StarRating from '@/components/ui/StarRating';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlineClipboardCopy, HiOutlineCheck } from 'react-icons/hi';

interface ReviewCardProps {
  review: Review;
  onUpdate?: (review: Review) => void;
}

const sentimentColors = {
  positive: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  neutral: 'bg-amber-50 text-amber-700 border-amber-100',
  negative: 'bg-red-50 text-red-700 border-red-100',
};

export default function ReviewCard({ review, onUpdate }: ReviewCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateResponse() {
    setIsGenerating(true);
    try {
      const res = await api.post(`/reviews/${review.id}/generate-response`);
      const updated = { ...review, aiResponse: res.data.aiResponse, responseStatus: 'generated' as const };
      onUpdate?.(updated);
      toast.success('AI response generated!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to generate response';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyResponse() {
    if (!review.aiResponse) return;
    await navigator.clipboard.writeText(review.aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Response copied to clipboard!');
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-semibold">
              {review.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{review.authorName}</p>
            <p className="text-xs text-gray-500">{format(new Date(review.publishedAt), 'MMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.sentiment && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${sentimentColors[review.sentiment]}`}>
              {review.sentiment}
            </span>
          )}
          <StarRating rating={review.rating} />
        </div>
      </div>

      {/* Review text */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.text}</p>

      {/* AI Response section */}
      {review.aiResponse ? (
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HiOutlineSparkles className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">AI Response</p>
            </div>
            <button
              onClick={copyResponse}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {copied ? <HiOutlineCheck className="w-4 h-4" /> : <HiOutlineClipboardCopy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{review.aiResponse}</p>
        </div>
      ) : (
        <button
          onClick={generateResponse}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <HiOutlineSparkles className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Generate AI Response'}
        </button>
      )}
    </div>
  );
}
