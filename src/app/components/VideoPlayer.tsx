'use client';

import { useRef, useState, useEffect } from 'react';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ChevronDownIcon,
  XMarkIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import {
  useToggleLikeDislikeMutation,
  useGetLikesQuery,
  useGetDislikesQuery,
  useAddViewMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
} from '../store/api/interactionApi';
import { toast } from 'react-hot-toast';

interface VideoPlayerProps {
  data: any;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function VideoPlayer({ data }: VideoPlayerProps) {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [localDislikesCount, setLocalDislikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localCommentsCount, setLocalCommentsCount] = useState(0);
  const [sharePopup, setSharePopup] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const [toggleLikeDislike] = useToggleLikeDislikeMutation();
  const { data: likesData, refetch: refetchLikes } = useGetLikesQuery(data?._id);
  const { data: dislikesData, refetch: refetchDislikes } = useGetDislikesQuery(data?._id);
  const [addView] = useAddViewMutation();
  const { data: commentsData, refetch: refetchComments } = useGetCommentsQuery(data?._id);
  const [createComment] = useCreateCommentMutation();

  useEffect(() => {
    setLocalLikesCount(likesData?.count || 0);
    setIsLiked(likesData?.likedByCurrentUser || false);
  }, [likesData]);

  useEffect(() => {
    setLocalDislikesCount(dislikesData?.count || 0);
    setIsDisliked(dislikesData?.dislikedByCurrentUser || false);
  }, [dislikesData]);

  useEffect(() => {
    if (commentsData?.length !== undefined) setLocalCommentsCount(commentsData.length);
    else if (data?.stats?.comments !== undefined) setLocalCommentsCount(data.stats.comments);
  }, [commentsData?.length, data?.stats?.comments]);

  const handleLike = async () => {
    if (!data?._id) return;
    try {
      await toggleLikeDislike({ videoId: data._id, isLiked: true }).unwrap();
      refetchLikes(); refetchDislikes();
    } catch { toast.error('Failed to update like'); }
  };

  const handleDislike = async () => {
    if (!data?._id) return;
    try {
      await toggleLikeDislike({ videoId: data._id, isLiked: false }).unwrap();
      refetchLikes(); refetchDislikes();
    } catch { toast.error('Failed to update dislike'); }
  };

  const handleShare = async () => {
    setSharePopup(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
    setSharePopup(false);
  };

  const handleVideoLoad = () => {
    if (data?._id) addView(data._id);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !data?._id) return;
    setLocalCommentsCount(p => p + 1);
    try {
      await createComment({ videoId: data._id, text: commentText.trim() }).unwrap();
      refetchComments();
      setCommentText('');
      toast.success('Comment posted!');
    } catch {
      setLocalCommentsCount(p => p - 1);
      toast.error('Failed to post comment');
    }
  };

  return (
    <div className="space-y-4 px-3 sm:px-0">
      {/* ── Video Player ──────────────────────────────── */}
      <div className="relative -mx-3 bg-black overflow-hidden shadow-none sm:mx-0 sm:rounded-xl sm:shadow-2xl">
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            ref={videoRef}
            src={data?.src}
            loading="lazy"
            style={{ border: '0', position: 'absolute', top: '0', height: '100%', width: '100%' }}
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
            allowFullScreen
            onLoad={handleVideoLoad}
          />
        </div>
      </div>

      {/* ── Video Info ────────────────────────────────── */}
      <div className="space-y-3">
        {/* Title */}
        <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {data?.title || 'Untitled Video'}
        </h1>

        {/* Interaction Row — actions stay one row on mobile (scroll if needed) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 pb-3 border-b border-dark-20/30">
          {/* Left: stats */}
          <div className="flex shrink-0 items-center gap-2 text-sm text-grey-60">
            <span>{(data?.stats?.views || 0).toLocaleString()} views</span>
            {data?.createdAt && (
              <>
                <span>•</span>
                <span>{new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </>
            )}
          </div>

          {/* Right: action buttons — nowrap + horizontal scroll on very narrow screens */}
          <div className="watch-actions-row flex min-w-0 w-full flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:w-auto sm:gap-2 sm:overflow-visible sm:[scrollbar-width:auto]">
            {/* Like / Dislike pill */}
            <div
              className="flex shrink-0 items-center rounded-full overflow-hidden border border-dark-25"
              style={{ background: '#1a1a1a' }}
            >
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-2 py-2 text-sm font-medium transition-all duration-200 sm:gap-1.5 sm:px-4 ${isLiked ? 'text-red-45 bg-red-45/10' : 'text-grey-70 hover:text-white hover:bg-white/5'
                  }`}
              >
                <HandThumbUpIcon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                <span>{formatCount(localLikesCount)}</span>
              </button>
              <div className="w-px h-6 bg-dark-25" />
              <button
                onClick={handleDislike}
                className={`flex items-center gap-1 px-2 py-2 text-sm font-medium transition-all duration-200 sm:gap-1.5 sm:px-4 ${isDisliked ? 'text-blue-400 bg-blue-400/10' : 'text-grey-70 hover:text-white hover:bg-white/5'
                  }`}
              >
                <HandThumbDownIcon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                <span>{formatCount(localDislikesCount)}</span>
              </button>
            </div>

            {/* Comments */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className={`btn-icon shrink-0 px-2.5 sm:px-4 ${showComments ? 'btn-icon-active' : ''}`}
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{formatCount(localCommentsCount)}</span>
            </button>

            {/* Share */}
            <div className="relative shrink-0">
              <button type="button" onClick={handleShare} className="btn-icon px-2.5 sm:px-4">
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </button>
              {sharePopup && (
                <div
                  className="absolute right-0 mt-2 rounded-xl p-4 w-72 z-50 animate-scale-in"
                  style={{ background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Share video</span>
                    <button onClick={() => setSharePopup(false)} className="text-grey-60 hover:text-white">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs text-grey-60 flex-1 truncate">{typeof window !== 'undefined' ? window.location.href : ''}</span>
                    <button onClick={copyLink} className="text-xs text-red-45 hover:text-red-55 font-medium flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {data?.description && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className={`text-sm text-grey-70 leading-relaxed ${!descExpanded ? 'line-clamp-3' : ''}`}>
              {data.description}
            </p>
            {data.description.length > 200 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-xs text-grey-60 hover:text-white mt-2 flex items-center gap-1 transition-colors"
              >
                {descExpanded ? 'Show less' : 'Show more'}
                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Comments Section (Inline) ─────────────────── */}
      {showComments && (
        <div className="rounded-xl overflow-hidden animate-slide-up" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold text-white">Comments ({localCommentsCount})</h3>
            <button onClick={() => setShowComments(false)} className="text-grey-60 hover:text-white transition-colors">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Comment Input */}
          <div className="p-4" style={{ background: 'rgba(15,15,15,0.8)' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="w-full bg-dark-12 text-white text-sm rounded-xl p-3 resize-none border border-dark-25 focus:outline-none focus:border-red-45/60 placeholder-grey-60 transition-all"
            />
            {commentText.trim() && (
              <div className="flex justify-end mt-2 gap-2">
                <button onClick={() => setCommentText('')} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
                <button onClick={handleCommentSubmit} className="px-4 py-1.5 bg-red-45 hover:bg-red-55 text-white text-sm font-medium rounded-lg transition-all">
                  Post
                </button>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="divide-y max-h-[400px] overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(15,15,15,0.5)' }}>
            {!commentsData?.length ? (
              <div className="px-4 py-8 text-center">
                <ChatBubbleLeftIcon className="w-8 h-8 text-grey-60 mx-auto mb-2" />
                <p className="text-sm text-grey-60">No comments yet. Be the first!</p>
              </div>
            ) : (
              commentsData.map((comment: any) => (
                <div key={comment._id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-dark-20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-grey-70">
                      {comment.userId?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-white">{comment.userId || 'Anonymous'}</span>
                        {comment.timestamp && (
                          <span className="text-[11px] text-grey-60">
                            {new Date(comment.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-grey-70 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
