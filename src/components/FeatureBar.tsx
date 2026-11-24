import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Vote,
  Trophy,
  CheckCircle2,
  Clock,
  Lock,
  Radio,
  BarChart3,
  Compass,
  Users,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import {
  useCulturePolls,
  useCulturePollVotes,
  castCulturePollVote,
  getSavedUserPollVotes,
  getLocalPollVoteAdjustments,
  getOrCreateVoterToken,
  resolvePollStatus,
  LOCAL_POLL_SYNC_EVENT,
  CulturePoll,
  CultureVoteRow,
  ResolvedPollStatus,
} from '../hooks/useSupabaseData';

type PollFilter = 'ALL' | ResolvedPollStatus;

function formatCountdownAndDeadline(closesAt?: string, nowMs: number = Date.now(), isClosed: boolean = false) {
  if (!closesAt) {
    return {
      countdown: isClosed ? 'Voting closed' : 'Ongoing',
      deadline: isClosed ? 'Closed' : 'No deadline set',
    };
  }

  const endMs = Date.parse(closesAt);
  if (Number.isNaN(endMs)) {
    return {
      countdown: isClosed ? 'Voting closed' : 'Open',
      deadline: '',
    };
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(endMs));

  const diff = endMs - nowMs;
  if (diff <= 0 || isClosed) {
    return {
      countdown: 'Voting ended',
      deadline: `Closed ${formattedDate}`,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let countdown = '';
  if (days > 0) {
    countdown = `${days}d ${hours}h ${minutes}m left`;
  } else if (hours > 0) {
    countdown = `${hours}h ${minutes}m ${seconds}s left`;
  } else {
    countdown = `${minutes}m ${seconds}s left`;
  }

  return {
    countdown,
    deadline: `Closes ${formattedDate}`,
  };
}

export const FeatureBar: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: dbPolls, isLoading } = useCulturePolls();
  const { data: votesData } = useCulturePollVotes();

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [filter, setFilter] = useState<PollFilter>('ALL');
  const [myVotes, setMyVotes] = useState<Record<string, string>>(() => getSavedUserPollVotes());
  const [localAdjustments, setLocalAdjustments] = useState<Record<string, Record<string, number>>>(() =>
    getLocalPollVoteAdjustments()
  );
  const [peekPollIds, setPeekPollIds] = useState<Record<string, boolean>>({});
  const [submittingPollId, setSubmittingPollId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<Record<string, string>>({});
  const [mobileSlideIdx, setMobileSlideIdx] = useState<number>(0);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  const voterToken = useMemo(() => getOrCreateVoterToken(), []);

  // Tick every second for accurate countdown timers & automatic poll expiry
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Track signed-in user id so authenticated voters stay synced across devices
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id || null);
    });
  }, []);

  // Refresh local fallback vote counts & saved choices when synced across tabs
  useEffect(() => {
    const syncLocalState = () => {
      setMyVotes(getSavedUserPollVotes());
      setLocalAdjustments(getLocalPollVoteAdjustments());
    };
    window.addEventListener(LOCAL_POLL_SYNC_EVENT, syncLocalState);
    return () => window.removeEventListener(LOCAL_POLL_SYNC_EVENT, syncLocalState);
  }, []);

  const allPolls: CulturePoll[] = useMemo(() => {
    const source = Array.isArray(dbPolls) ? dbPolls : [];
    return source
      .filter((p) => Boolean(p.question?.trim()))
      .map((p) => ({
        ...p,
        options: (p.options || []).filter((o) => Boolean(o.title?.trim())),
      }))
      .filter((p) => p.options.length >= 2);
  }, [dbPolls]);

  const enrichedPolls = useMemo(() => {
    const remoteRows = votesData?.rows || [];
    const tableAvailable = votesData?.tableAvailable ?? false;

    return allPolls.map((poll) => {
      const status = resolvePollStatus(poll, nowMs);
      const counts: Record<string, number> = {};
      let userVotedOptionId: string | null = myVotes[poll.id] || null;

      for (const opt of poll.options) {
        counts[opt.id] = 0;
      }

      if (tableAvailable) {
        for (const row of remoteRows) {
          if (row.poll_id === poll.id && counts[row.option_id] !== undefined) {
            counts[row.option_id] += 1;
            const matchesToken = row.voter_token === voterToken;
            const matchesUser = Boolean(currentUserId && row.user_id === currentUserId);
            if (matchesToken || matchesUser) {
              userVotedOptionId = row.option_id;
            }
          }
        }
      } else {
        const localPollCounts = localAdjustments[poll.id] || {};
        for (const opt of poll.options) {
          counts[opt.id] = Number(localPollCounts[opt.id] || 0);
        }
      }

      let total = 0;
      let maxVotes = 0;
      for (const opt of poll.options) {
        const c = counts[opt.id] || 0;
        total += c;
        if (c > maxVotes) {
          maxVotes = c;
        }
      }

      const leadingIds =
        maxVotes > 0
          ? poll.options.filter((opt) => (counts[opt.id] || 0) === maxVotes).map((opt) => opt.id)
          : [];

      const winningOptions =
        status === 'CLOSED' && maxVotes > 0
          ? poll.options.filter((opt) => (counts[opt.id] || 0) === maxVotes)
          : [];

      return {
        poll,
        status,
        counts,
        total,
        maxVotes,
        leadingIds,
        winningOptions,
        userVotedOptionId,
      };
    });
  }, [allPolls, votesData, myVotes, localAdjustments, voterToken, currentUserId, nowMs]);

  const summaryStats = useMemo(() => {
    let totalVotes = 0;
    let liveCount = 0;
    let openCount = 0;
    let closedCount = 0;

    for (const item of enrichedPolls) {
      totalVotes += item.total;
      if (item.status === 'LIVE') liveCount += 1;
      else if (item.status === 'OPEN') openCount += 1;
      else closedCount += 1;
    }

    return {
      totalVotes,
      activePolls: liveCount + openCount,
      liveCount,
      openCount,
      closedCount,
    };
  }, [enrichedPolls]);

  const filteredPolls = useMemo(() => {
    const statusPriority: Record<ResolvedPollStatus, number> = {
      LIVE: 0,
      OPEN: 1,
      CLOSED: 2,
    };
    const list =
      filter === 'ALL'
        ? enrichedPolls
        : enrichedPolls.filter((item) => item.status === filter);
    return [...list].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
  }, [enrichedPolls, filter]);

  useEffect(() => {
    setMobileSlideIdx(0);
    if (mobileTrackRef.current) {
      mobileTrackRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [filter]);

  const handleMobileTrackScroll = () => {
    const el = mobileTrackRef.current;
    if (!el || filteredPolls.length <= 1) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 16 : el.clientWidth * 0.86;
    if (step > 0) {
      const idx = Math.round(el.scrollLeft / step);
      setMobileSlideIdx(Math.max(0, Math.min(filteredPolls.length - 1, idx)));
    }
  };

  const scrollToMobilePoll = (targetIdx: number) => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(filteredPolls.length - 1, targetIdx));
    const cardEl = el.children[clamped] as HTMLElement | undefined;
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    setMobileSlideIdx(clamped);
  };

  const handleVote = async (poll: CulturePoll, optionId: string) => {
    const resolved = resolvePollStatus(poll, Date.now());
    if (resolved === 'CLOSED') {
      setStatusMessage((prev) => ({
        ...prev,
        [poll.id]: 'This poll has closed and is no longer accepting votes.',
      }));
      return;
    }

    if (myVotes[poll.id]) {
      return;
    }

    setSubmittingPollId(poll.id);
    setStatusMessage((prev) => ({ ...prev, [poll.id]: '' }));

    try {
      const result = await castCulturePollVote(poll, optionId);
      const confirmedId = result.votedOptionId || optionId;

      setMyVotes((prev) => ({ ...prev, [poll.id]: confirmedId }));
      setLocalAdjustments(getLocalPollVoteAdjustments());

      if (result.persistedRemote) {
        queryClient.setQueryData<{ rows: CultureVoteRow[]; tableAvailable: boolean }>(
          ['culture-poll-votes'],
          (prev) => {
            if (!prev) return prev;
            const exists = prev.rows.some(
              (r) => r.poll_id === poll.id && r.voter_token === voterToken
            );
            if (exists) return prev;
            return {
              tableAvailable: true,
              rows: [
                ...prev.rows,
                {
                  poll_id: poll.id,
                  option_id: confirmedId,
                  voter_token: voterToken,
                  user_id: currentUserId,
                },
              ],
            };
          }
        );
      }

      if (result.alreadyVoted) {
        setStatusMessage((prev) => ({
          ...prev,
          [poll.id]: 'Your previous vote for this poll is already recorded.',
        }));
      }

      await queryClient.invalidateQueries({ queryKey: ['culture-poll-votes'] });
    } finally {
      setSubmittingPollId(null);
    }
  };

  if (isLoading && !dbPolls) {
    return (
      <section className="bg-white py-14 relative z-20 border-b border-slate-200 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section
      id="culture-updates"
      className="bg-white text-[#08121B] py-12 sm:py-16 lg:py-20 relative z-20 border-b border-slate-200 font-['Poppins',sans-serif] overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Hero Header & Dark Navy Community Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch mb-8 sm:mb-10">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold text-[#FF6A00] tracking-wide mb-2">
              Your Voice. Your Choice. &middot; Official Awards Voting
            </p>
            <h2 className="font-black text-3xl sm:text-4xl lg:text-[2.65rem] text-[#08121B] tracking-tight leading-[1.08] text-balance mb-3">
              Certified Adventures <span className="text-[#FF6A00]">Vuka Mwaka Awards 2026</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-['Inter',sans-serif]">
              Cast one verified vote per category in the Certified Adventures Vuka Mwaka Awards 2026 and follow live community standings.
            </p>
          </div>

          {/* Dark Navy Community Statistics Panel */}
          <div className="lg:col-span-5 bg-[#08121B] text-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-semibold text-slate-300">Community Participation</span>
              <Users className="w-4 h-4 text-[#FF6A00]" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">
                  {summaryStats.totalVotes.toLocaleString()}
                </div>
                <div className="text-xs text-slate-300 mt-1.5 font-['Inter',sans-serif]">
                  Total Votes
                </div>
              </div>

              <div className="border-x border-white/10 px-3">
                <div className="text-2xl sm:text-3xl font-black text-[#FF6A00] tabular-nums leading-none">
                  {summaryStats.activePolls}
                </div>
                <div className="text-xs text-slate-300 mt-1.5 font-['Inter',sans-serif]">
                  Active Polls
                </div>
              </div>

              <div className="pl-1">
                <div className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">
                  {summaryStats.closedCount}
                </div>
                <div className="text-xs text-slate-300 mt-1.5 font-['Inter',sans-serif]">
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-200">
          <div
            role="tablist"
            aria-label="Filter polls by status"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100"
          >
            {(
              [
                { key: 'ALL', label: `All (${enrichedPolls.length})` },
                { key: 'LIVE', label: `Live (${summaryStats.liveCount})` },
                { key: 'OPEN', label: `Open (${summaryStats.openCount})` },
                { key: 'CLOSED', label: `Closed (${summaryStats.closedCount})` },
              ] as { key: PollFilter; label: string }[]
            ).map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.key)}
                  className={`min-h-[40px] px-3.5 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
                    active
                      ? 'bg-[#08121B] text-white'
                      : 'text-slate-600 hover:text-[#08121B]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-500 font-['Inter',sans-serif]">
            One vote per participant &middot; Live updates enabled
          </span>
        </div>

        {/* Empty State when no admin polls exist or filtered tab has none */}
        {allPolls.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 sm:p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#08121B] text-[#FF6A00] flex items-center justify-center mx-auto mb-3">
              <Vote className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-base sm:text-lg font-bold text-[#08121B] mb-1">
              No Vuka Mwaka Awards 2026 polls published yet
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto font-['Inter',sans-serif]">
              Award categories and nominees added by our admin team will appear right here for voting.
            </p>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 sm:p-12 text-center">
            <p className="text-base font-bold text-[#08121B] mb-1">
              No {filter.toLowerCase()} polls right now
            </p>
            <p className="text-sm text-slate-600 mb-4 font-['Inter',sans-serif]">
              Switch tabs to view other active or completed community polls.
            </p>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className="min-h-[44px] px-5 rounded-xl bg-[#08121B] hover:bg-[#FF6A00] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Show All Polls
            </button>
          </div>
        ) : (
          <div>
            {/* Phone Horizontal Swipe Controls when multiple polls exist */}
            {filteredPolls.length > 1 && (
              <div className="flex md:hidden items-center justify-between gap-3 mb-3">
                <span className="text-xs font-semibold text-slate-600 tabular-nums">
                  Swipe live polls &middot; {mobileSlideIdx + 1} of {filteredPolls.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollToMobilePoll(mobileSlideIdx - 1)}
                    disabled={mobileSlideIdx === 0}
                    aria-label="Previous poll"
                    className="w-11 h-11 rounded-xl border border-slate-200 bg-white text-[#08121B] disabled:opacity-35 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToMobilePoll(mobileSlideIdx + 1)}
                    disabled={mobileSlideIdx >= filteredPolls.length - 1}
                    aria-label="Next poll"
                    className="w-11 h-11 rounded-xl border border-slate-200 bg-white text-[#08121B] disabled:opacity-35 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Horizontal Swipe Carousel on Phones, Clean 2-Column Grid on Tablet/Desktop */}
            <div
              ref={mobileTrackRef}
              onScroll={handleMobileTrackScroll}
              className={
                filteredPolls.length === 1
                  ? 'grid grid-cols-1 max-w-3xl gap-6 sm:gap-8'
                  : 'flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-2 scrollbar-hide md:grid md:grid-cols-2 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:gap-6 lg:gap-8'
              }
            >
              {filteredPolls.map(
                (
                  {
                    poll,
                    status,
                    counts,
                    total,
                    leadingIds,
                    winningOptions,
                    userVotedOptionId,
                  },
                  pollIdx
                ) => {
                  const isClosed = status === 'CLOSED';
                  const hasVoted = Boolean(userVotedOptionId);
                  const showResults = hasVoted || isClosed || Boolean(peekPollIds[poll.id]);
                  const timeInfo = formatCountdownAndDeadline(poll.closes_at, nowMs, isClosed);
                  const selectedOption = poll.options.find((o) => o.id === userVotedOptionId);

                  return (
                    <motion.article
                      key={poll.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: pollIdx * 0.05 }}
                      className={`${
                        filteredPolls.length > 1
                          ? 'w-[86vw] max-w-[380px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink'
                          : 'w-full'
                      } rounded-2xl border bg-white p-5 sm:p-7 flex flex-col justify-between transition-colors ${
                        isClosed
                          ? 'border-slate-200 bg-slate-50/40'
                          : 'border-slate-200 hover:border-[#08121B]/30'
                      }`}
                    >
                    <div>
                      {/* Clean Unboxed Status, Category & Deadline Metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {status === 'LIVE' && (
                            <span className="inline-flex items-center gap-1.5 text-[#FF6A00]">
                              <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>LIVE</span>
                            </span>
                          )}
                          {status === 'OPEN' && (
                            <span className="inline-flex items-center gap-1.5 text-[#08121B]">
                              <Vote className="w-3.5 h-3.5 text-[#FF6A00]" aria-hidden="true" />
                              <span>OPEN</span>
                            </span>
                          )}
                          {status === 'CLOSED' && (
                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>CLOSED</span>
                            </span>
                          )}
                          {poll.category && (
                            <>
                              <span className="text-slate-300" aria-hidden="true">
                                &middot;
                              </span>
                              <span className="font-medium text-slate-600">
                                {poll.category}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" aria-hidden="true" />
                          <span>{timeInfo.countdown}</span>
                        </div>
                      </div>

                      {/* Poll Heading & Description */}
                      <h3 className="font-bold text-xl sm:text-2xl text-[#08121B] tracking-tight leading-snug text-balance mb-1.5">
                        {poll.question}
                      </h3>
                      {poll.subtitle && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-4 font-['Inter',sans-serif]">
                          {poll.subtitle}
                        </p>
                      )}

                      {/* Automatic Winner Spotlight when Voting Closes */}
                      {isClosed && (
                        <div className="mb-4 rounded-xl bg-[#08121B] text-white px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#FF6A00] text-white flex items-center justify-center shrink-0">
                              <Trophy className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-[#FF6A00]">
                                {winningOptions.length > 1 ? 'Tied Winners' : 'Winning Choice'}
                              </div>
                              <div className="text-sm font-bold text-white truncate">
                                {winningOptions.length > 0
                                  ? winningOptions.map((w) => w.title).join(' & ')
                                  : 'No votes were recorded'}
                              </div>
                            </div>
                          </div>
                          {winningOptions.length > 0 && total > 0 && (
                            <span className="text-sm font-black text-[#FF6A00] tabular-nums shrink-0">
                              {Math.round(((counts[winningOptions[0].id] || 0) / total) * 100)}%
                            </span>
                          )}
                        </div>
                      )}

                      {/* Post-Vote Confirmation Banner */}
                      {hasVoted && selectedOption && (
                        <div className="mb-4 rounded-xl border border-[#FF6A00]/30 bg-orange-50/70 px-4 py-3 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#08121B]">
                          <CheckCircle2 className="w-4 h-4 text-[#FF6A00] shrink-0" aria-hidden="true" />
                          <span>
                            Vote confirmed for <strong className="text-[#FF6A00]">{selectedOption.title}</strong>
                          </span>
                        </div>
                      )}

                      {statusMessage[poll.id] && (
                        <p className="mb-3 text-xs font-medium text-[#FF6A00]">
                          {statusMessage[poll.id]}
                        </p>
                      )}

                      {/* Touch-Friendly Voting Options */}
                      <div className="space-y-3 mt-3">
                        {poll.options.map((opt) => {
                          const count = counts[opt.id] || 0;
                          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                          const isSelected = userVotedOptionId === opt.id;
                          const isLeading = showResults && leadingIds.includes(opt.id) && total > 0;
                          const isDisabled = hasVoted || isClosed || submittingPollId === poll.id;
                          const imageBroken = !opt.image_url || Boolean(failedImages[opt.id]);

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => handleVote(poll, opt.id)}
                              aria-pressed={isSelected}
                              className={`relative w-full min-h-[84px] text-left rounded-xl border overflow-hidden transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] ${
                                isSelected || isLeading
                                  ? 'border-[#FF6A00] bg-orange-50/35'
                                  : isDisabled
                                  ? 'border-slate-200 bg-white'
                                  : 'border-slate-200 bg-white hover:border-[#FF6A00] hover:bg-slate-50/50 cursor-pointer active:scale-[0.99]'
                              }`}
                            >
                              {/* GPU-Accelerated Animated Percentage Progress Bar (transform: scaleX) */}
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: showResults ? pct / 100 : 0 }}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                className={`absolute inset-0 origin-left pointer-events-none ${
                                  isSelected || isLeading
                                    ? 'bg-[#FF6A00]/14'
                                    : 'bg-[#08121B]/6'
                                }`}
                              />

                              <div className="relative z-10 p-3 sm:p-3.5 flex items-center gap-3.5">
                                {/* Relevant Option Thumbnail with Resilient Fallback */}
                                <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                                  {!imageBroken ? (
                                    <img
                                      src={opt.image_url}
                                      alt={opt.title}
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      onError={() =>
                                        setFailedImages((prev) => ({ ...prev, [opt.id]: true }))
                                      }
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#08121B] to-[#13293d] flex items-center justify-center text-[#FF6A00]">
                                      <Compass className="w-5 h-5" aria-hidden="true" />
                                    </div>
                                  )}
                                </div>

                                {/* Title & Short Description */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span className="font-bold text-sm sm:text-base text-[#08121B] leading-snug">
                                      {opt.title}
                                    </span>

                                    {isLeading && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6A00]">
                                        <Trophy className="w-3 h-3" aria-hidden="true" />
                                        <span>{isClosed ? 'Winner' : 'Leading'}</span>
                                      </span>
                                    )}

                                    {isSelected && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#08121B]">
                                        <Check className="w-3 h-3 text-[#FF6A00]" aria-hidden="true" />
                                        <span>Your Vote</span>
                                      </span>
                                    )}
                                  </div>

                                  {opt.subtitle && (
                                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 line-clamp-2 font-['Inter',sans-serif]">
                                      {opt.subtitle}
                                    </p>
                                  )}
                                </div>

                                {/* Percentage & Vote Count or Vote Button */}
                                <div className="shrink-0 pl-2 flex flex-col items-end justify-center">
                                  {showResults ? (
                                    <div className="text-right tabular-nums">
                                      <div
                                        className={`text-base sm:text-lg font-black leading-none ${
                                          isSelected || isLeading ? 'text-[#FF6A00]' : 'text-[#08121B]'
                                        }`}
                                      >
                                        {pct}%
                                      </div>
                                      <div className="text-[11px] font-medium text-slate-500 mt-1">
                                        {count.toLocaleString()} {count === 1 ? 'vote' : 'votes'}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="min-h-[38px] px-3.5 rounded-lg bg-[#08121B] group-hover:bg-[#FF6A00] text-white text-xs font-semibold inline-flex items-center justify-center transition-colors whitespace-nowrap">
                                      {submittingPollId === poll.id ? 'Saving...' : 'Vote'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Poll Card Footer: Live Total, Deadline & Standings Peek */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-['Inter',sans-serif] tabular-nums">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#08121B]">
                          {total.toLocaleString()} {total === 1 ? 'vote' : 'votes'}
                        </span>
                        {timeInfo.deadline && (
                          <>
                            <span aria-hidden="true">&middot;</span>
                            <span>{timeInfo.deadline}</span>
                          </>
                        )}
                      </div>

                      {!hasVoted && !isClosed && (
                        <button
                          type="button"
                          onClick={() =>
                            setPeekPollIds((prev) => ({ ...prev, [poll.id]: !prev[poll.id] }))
                          }
                          className="min-h-[36px] px-2 font-semibold text-[#08121B] hover:text-[#FF6A00] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{showResults ? 'Hide results' : 'View results'}</span>
                        </button>
                      )}
                    </div>
                  </motion.article>
                );
              }
            )}
            </div>

            {filteredPolls.length > 1 && (
              <div className="flex md:hidden items-center justify-center gap-2 mt-4">
                {filteredPolls.map((item, idx) => (
                  <button
                    key={item.poll.id}
                    type="button"
                    onClick={() => scrollToMobilePoll(idx)}
                    aria-label={`View poll ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      mobileSlideIdx === idx
                        ? 'w-7 bg-[#FF6A00]'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
