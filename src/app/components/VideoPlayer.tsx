'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ChevronDownIcon,
  XMarkIcon,
  LinkIcon,
  ArrowUpTrayIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import {
  useToggleLikeDislikeMutation,
  useGetLikesQuery,
  useGetDislikesQuery,
  useAddViewMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useReportVideoMutation,
} from '../store/api/interactionApi';
import type { Comment, CommentAuthor } from '../store/api/interactionApi';
import type { VideoDetail } from '../store/api/videoApi';
import { toast } from 'react-hot-toast';
import { usePayoutWatchHeartbeat } from '../hooks/usePayoutWatchHeartbeat';

interface VideoPlayerProps {
  data: VideoDetail | null | undefined;
}

const MAX_COMMENT_LEN = 2000;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatRelativeTime(iso: string | Date | undefined): string {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function commentAuthorName(userId: Comment['userId']): string {
  if (!userId) return 'Anonymous';
  if (typeof userId === 'string') return userId;
  const u = userId as CommentAuthor;
  return u.name?.trim() || u.username?.trim() || 'Member';
}

function commentInitial(userId: Comment['userId']): string {
  const name = commentAuthorName(userId);
  return name.charAt(0).toUpperCase() || '?';
}

export default function VideoPlayer({ data }: VideoPlayerProps) {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const viewRecordedRef = useRef(false);
  const lockedSrcVideoIdRef = useRef<string | null>(null);
  const sharePopupRef = useRef<HTMLDivElement>(null);
  const reportPopupRef = useRef<HTMLDivElement>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [localDislikesCount, setLocalDislikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localCommentsCount, setLocalCommentsCount] = useState(0);
  const [sharePopup, setSharePopup] = useState(false);
  const [reportPopup, setReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState<string>('spam');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [descExpanded, setDescExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [embedSrc, setEmbedSrc] = useState<string | undefined>(undefined);

  const videoId = data?._id;
  const skipInteraction = !videoId;
  const dataSrc = data?.src;

  // Lock the first minted Bunny embed URL for this video so later refetches cannot remount the iframe.
  useEffect(() => {
    if (!videoId) {
      lockedSrcVideoIdRef.current = null;
      setEmbedSrc(undefined);
      return;
    }
    if (lockedSrcVideoIdRef.current !== videoId) {
      lockedSrcVideoIdRef.current = videoId;
      viewRecordedRef.current = false;
      setEmbedSrc(dataSrc);
      return;
    }
    if (dataSrc && !embedSrc) {
      setEmbedSrc(dataSrc);
    }
  }, [videoId, dataSrc, embedSrc]);

  usePayoutWatchHeartbeat(videoId, data?.monetization?.type, isPlaying);
  const creatorName =
    data?.creatorId?.name || data?.creatorId?.username || (data?.creatorId ? 'Creator' : '');

  const [toggleLikeDislike] = useToggleLikeDislikeMutation();
  const { data: likesData } = useGetLikesQuery(videoId as string, { skip: skipInteraction });
  const { data: dislikesData } = useGetDislikesQuery(videoId as string, { skip: skipInteraction });
  const [addView] = useAddViewMutation();
  const { data: commentsData, isLoading: commentsLoading } = useGetCommentsQuery(videoId as string, {
    skip: skipInteraction,
  });
  const [createComment, { isLoading: isPostingComment }] = useCreateCommentMutation();
  const [reportVideo, { isLoading: isPostingReport }] = useReportVideoMutation();

  useEffect(() => {
    setLocalLikesCount(likesData?.count || 0);
    setIsLiked(likesData?.likedByCurrentUser || false);
  }, [likesData]);

  useEffect(() => {
    setLocalDislikesCount(dislikesData?.count || 0);
    setIsDisliked(dislikesData?.dislikedByCurrentUser || false);
  }, [dislikesData]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const payload = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (payload?.event === 'play' || payload?.event === 'playing') {
          setIsPlaying(true);
        } else if (payload?.event === 'pause' || payload?.event === 'ended') {
          setIsPlaying(false);
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    viewRecordedRef.current = false;
  }, [videoId]);

  useEffect(() => {
    if (commentsData?.length !== undefined) setLocalCommentsCount(commentsData.length);
    else if (data?.stats?.comments !== undefined) setLocalCommentsCount(data.stats.comments);
  }, [commentsData?.length, data?.stats?.comments]);

  const handleLike = async () => {
    if (!videoId) return;
    try {
      await toggleLikeDislike({ videoId, isLiked: true }).unwrap();
    } catch {
      toast.error('Failed to update like');
    }
  };

  const handleDislike = async () => {
    if (!videoId) return;
    try {
      await toggleLikeDislike({ videoId, isLiked: false }).unwrap();
    } catch {
      toast.error('Failed to update dislike');
    }
  };

  const handleShare = () => {
    setSharePopup(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
    setSharePopup(false);
  };

  const handleNativeShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = data?.title || 'Video';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: data?.description?.slice(0, 140) || title, url });
        setSharePopup(false);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') toast.error('Could not share');
      }
    }
  };

  useEffect(() => {
    if (!sharePopup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSharePopup(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sharePopup]);

  useEffect(() => {
    if (!reportPopup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReportPopup(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reportPopup]);

  const handleVideoLoad = useCallback(async () => {
    if (!videoId || viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    try {
      await addView(videoId).unwrap();
    } catch {
      viewRecordedRef.current = false;
    }
  }, [videoId, addView]);

  const handleCommentSubmit = async () => {
    const text = commentText.trim();
    if (!text || !videoId) return;
    if (text.length > MAX_COMMENT_LEN) {
      toast.error(`Comment must be ${MAX_COMMENT_LEN} characters or less`);
      return;
    }
    try {
      await createComment({ videoId, text }).unwrap();
      setCommentText('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const toggleRepliesForComment = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleReportSubmit = async () => {
    if (!videoId) return;
    try {
      await reportVideo({ videoId, reason: reportReason, details: reportDetails }).unwrap();
      setReportSubmitted(true);
      setReportPopup(false);
      setReportDetails('');
      toast.success('Thanks for reporting. The creator has been notified.');
    } catch {
      toast.error('Failed to submit report');
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className="space-y-4 px-3 sm:px-0">
      {/* ── Video Player ──────────────────────────────── */}
      <div className="relative -mx-3 bg-black overflow-hidden shadow-none sm:mx-0 sm:rounded-xl sm:shadow-2xl">
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            ref={videoRef}
            src={embedSrc}
            title={data?.title ? `Video: ${data.title}` : 'Video player'}
            style={{ border: '0', position: 'absolute', top: '0', height: '100%', width: '100%' }}
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
            allowFullScreen
            onLoad={handleVideoLoad}
          />
        </div>
      </div>

      {/* ── Video Info ────────────────────────────────── */}
      <div className="space-y-3">
        <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {data?.title || 'Untitled Video'}
        </h1>

        {creatorName ? (
          <div className="flex items-center gap-2 text-xs text-grey-60">
            {data?.creatorId?.profileImage ? (
              <img
                src={data.creatorId.profileImage}
                alt={creatorName}
                className="h-5 w-5 rounded-full border border-white/[0.08] object-cover"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-dark-20 flex items-center justify-center border border-white/[0.06] text-[10px] font-bold text-grey-70">
                {creatorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="opacity-80">By</span>
            <span className="text-white font-medium">{creatorName}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 pb-3 border-b border-dark-20/30">
          <div className="flex shrink-0 items-center gap-2 text-sm text-grey-60">
            <span>{(data?.stats?.views ?? 0).toLocaleString()} views</span>
            {data?.createdAt && (
              <>
                <span>•</span>
                <span>
                  {new Date(data.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>

          <div className="watch-actions-row flex min-w-0 w-full flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:w-auto sm:gap-2 sm:overflow-visible sm:[scrollbar-width:auto]">
            <div
              className="flex shrink-0 items-center rounded-full overflow-hidden border border-dark-25"
              style={{ background: '#1a1a1a' }}
            >
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1 px-2 py-2 text-sm font-medium transition-all duration-200 sm:gap-1.5 sm:px-4 ${
                  isLiked ? 'text-green-500 bg-green-500/15' : 'text-grey-70 hover:text-white hover:bg-white/5'
                }`}
              >
                <HandThumbUpIcon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                <span>{formatCount(localLikesCount)}</span>
              </button>
              <div className="w-px h-6 bg-dark-25" />
              <button
                type="button"
                onClick={handleDislike}
                className={`flex items-center gap-1 px-2 py-2 text-sm font-medium transition-all duration-200 sm:gap-1.5 sm:px-4 ${
                  isDisliked ? 'text-red-45 bg-red-45/10' : 'text-grey-70 hover:text-white hover:bg-white/5'
                }`}
              >
                <HandThumbDownIcon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                <span>{formatCount(localDislikesCount)}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className={`btn-icon shrink-0 px-2.5 sm:px-4 ${showComments ? 'btn-icon-active' : ''}`}
              aria-expanded={showComments}
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{formatCount(localCommentsCount)}</span>
            </button>

            <div className="relative shrink-0">
              <button type="button" onClick={handleShare} className="btn-icon px-2.5 sm:px-4" aria-haspopup="dialog" aria-expanded={sharePopup}>
                <ShareIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              {sharePopup && (
                <div
                  ref={sharePopupRef}
                  role="dialog"
                  aria-label="Share video"
                  className="absolute right-0 mt-2 rounded-xl p-4 w-[min(100vw-2rem,18rem)] z-50 animate-scale-in"
                  style={{
                    background: 'rgba(20,20,20,0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Share video</span>
                    <button type="button" onClick={() => setSharePopup(false)} className="text-grey-60 hover:text-white rounded-lg p-1" aria-label="Close share dialog">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {canNativeShare && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2.5 text-sm font-medium text-white hover:bg-white/[0.1]"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Share via…
                    </button>
                  )}
                  <div
                    className="flex items-center gap-2 p-2 rounded-lg mb-2"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-xs text-grey-60 flex-1 truncate">{typeof window !== 'undefined' ? window.location.href : ''}</span>
                    <button type="button" onClick={copyLink} className="text-xs text-red-45 hover:text-red-55 font-medium flex items-center gap-1 shrink-0">
                      <LinkIcon className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                  <p className="text-[11px] text-grey-60">Press Esc to close</p>
                </div>
              )}
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setReportPopup(true)}
                className="btn-icon px-2.5 sm:px-4"
                aria-haspopup="dialog"
                aria-expanded={reportPopup}
              >
                <FlagIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </button>

              {reportPopup && (
                <div
                  ref={reportPopupRef}
                  role="dialog"
                  aria-label="Report video"
                  className="absolute right-0 mt-2 rounded-xl p-4 w-[min(100vw-2rem,18rem)] z-50 animate-scale-in"
                  style={{
                    background: 'rgba(20,20,20,0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Report video</span>
                    <button
                      type="button"
                      onClick={() => setReportPopup(false)}
                      className="text-grey-60 hover:text-white rounded-lg p-1"
                      aria-label="Close report dialog"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="report-reason" className="block text-xs font-medium uppercase tracking-wide text-grey-50 mb-2">
                        Reason
                      </label>
                      <select
                        id="report-reason"
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full bg-dark-12 text-white text-sm rounded-xl px-3 py-2 border border-dark-25 focus:outline-none focus:ring-2 focus:ring-red-45/40"
                      >
                        <option value="spam">Spam</option>
                        <option value="inappropriate">Inappropriate content</option>
                        <option value="copyright">Copyright violation</option>
                        <option value="harassment">Harassment</option>
                        <option value="misleading">Misleading / scam</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="report-details" className="block text-xs font-medium uppercase tracking-wide text-grey-50 mb-2">
                        Details (optional)
                      </label>
                      <textarea
                        id="report-details"
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        placeholder="Add any extra context for moderation..."
                        rows={3}
                        className="w-full bg-dark-12 text-white text-sm rounded-xl px-3 py-2 resize-none border border-dark-25 focus:outline-none focus:ring-2 focus:ring-red-45/40"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReportPopup(false)}
                        className="btn-secondary text-sm px-3 py-1.5"
                        disabled={isPostingReport}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleReportSubmit}
                        className="px-4 py-1.5 bg-red-45 hover:bg-red-55 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
                        disabled={isPostingReport}
                      >
                        {isPostingReport ? 'Submitting…' : 'Submit report'}
                      </button>
                    </div>
                  </div>

                  {reportSubmitted ? (
                    <p className="text-[11px] text-grey-60 mt-3">
                      Report submitted. The video may be removed shortly.
                    </p>
                  ) : (
                    <p className="text-[11px] text-grey-60 mt-3">Press Esc to close</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {data?.description && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className={`text-sm text-grey-70 leading-relaxed ${!descExpanded ? 'line-clamp-3' : ''}`}>{data.description}</p>
            {data.description.length > 200 && (
              <button
                type="button"
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

      {showComments && (
        <div
          className="rounded-2xl overflow-hidden border border-white/[0.08] bg-dark-10/80 shadow-xl backdrop-blur-sm animate-slide-up"
          role="region"
          aria-label="Comments"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-dark-10/90">
            <h3 className="text-sm font-semibold text-white">Comments ({localCommentsCount})</h3>
            <button type="button" onClick={() => setShowComments(false)} className="text-grey-60 hover:text-white rounded-lg p-1" aria-label="Close comments">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 border-b border-white/[0.06] bg-dark-8/50">
            <label htmlFor="watch-comment-input" className="mb-2 block text-xs font-medium uppercase tracking-wide text-grey-50">
              Add a comment
            </label>
            <textarea
              id="watch-comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, MAX_COMMENT_LEN))}
              placeholder="Share your thoughts…"
              rows={3}
              disabled={isPostingComment}
              className="w-full bg-dark-12 text-white text-sm rounded-xl p-3 resize-none border border-dark-25 focus:outline-none focus:ring-2 focus:ring-red-45/40 focus:border-red-45/50 placeholder:text-grey-60 transition-all disabled:opacity-50"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-grey-60">
                {commentText.length}/{MAX_COMMENT_LEN}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setCommentText('')} className="btn-secondary text-sm px-3 py-1.5" disabled={isPostingComment || !commentText.trim()}>
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleCommentSubmit}
                  disabled={isPostingComment || !commentText.trim()}
                  className="px-4 py-1.5 bg-red-45 hover:bg-red-55 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
                >
                  {isPostingComment ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain bg-dark-8/30">
            {commentsLoading ? (
              <div className="space-y-4 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-dark-20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 rounded bg-dark-20" />
                      <div className="h-3 w-full rounded bg-dark-15" />
                      <div className="h-3 w-4/5 rounded bg-dark-15" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !commentsData?.length ? (
              <div className="px-6 py-12 text-center">
                <ChatBubbleLeftIcon className="w-10 h-10 text-grey-60 mx-auto mb-3 opacity-80" />
                <p className="text-sm font-medium text-white">No comments yet</p>
                <p className="text-sm text-grey-60 mt-1">Start the conversation below.</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {commentsData.map((comment) => (
                  <li key={comment._id} className="px-4 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br from-dark-15 to-dark-25 text-xs font-bold text-white"
                        aria-hidden
                      >
                        {commentInitial(comment.userId)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                          <span className="text-sm font-semibold text-white">{commentAuthorName(comment.userId)}</span>
                          <time className="text-[11px] text-grey-60" dateTime={comment.timestamp ? new Date(comment.timestamp).toISOString() : undefined}>
                            {formatRelativeTime(comment.timestamp)}
                          </time>
                        </div>
                        <p className="text-sm text-grey-70 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>

                        {comment.replies?.length ? (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => toggleRepliesForComment(String(comment._id))}
                              className="text-[12px] text-grey-60 hover:text-white transition-colors flex items-center gap-2"
                            >
                              <span>
                                {expandedReplies[String(comment._id)] ? 'Hide' : 'Show'} replies ({comment.replies.length})
                              </span>
                            </button>

                            {expandedReplies[String(comment._id)] && (
                              <div className="mt-3 space-y-2 pl-3 border-l border-white/[0.06]">
                                {comment.replies.map((r, idx) => (
                                  <div key={(r as any)._id || idx} className="flex items-start gap-2">
                                    <div className="h-7 w-7 rounded-full bg-dark-20 border border-white/[0.06] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-grey-70">
                                      {commentInitial(r.fromUser)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-semibold text-white truncate">
                                          {commentAuthorName(r.fromUser)}
                                        </span>
                                        {r.createdAt && (
                                          <time className="text-[11px] text-grey-60">
                                            {formatRelativeTime(r.createdAt)}
                                          </time>
                                        )}
                                      </div>
                                      <p className="text-sm text-grey-70 leading-relaxed break-words whitespace-pre-wrap">
                                        {r.reply}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
