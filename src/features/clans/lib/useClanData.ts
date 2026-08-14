import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@app/lib/api';
import { useGame } from '@app/context/GameContext';
import type { Clan, ClanMember, ClanVote, ClanInvite, ClanPerk } from '@app/types/clan';

export interface ClanTransaction {
    id: number;
    clan_id: string;
    user_id: string | null;
    username?: string | null;
    amount: number;
    type: string;
    timestamp: string;
}

/**
 * Every REST read the clan feature needs, in one place, so the management page
 * and the operations page stay consistent instead of each rolling their own
 * fetch soup.
 */
export function useClanData() {
    const { gameState } = useGame();
    const clanId = gameState.clan_id;

    const [clan, setClan] = useState<Clan | null>(null);
    const [members, setMembers] = useState<ClanMember[]>([]);
    const [votes, setVotes] = useState<ClanVote[]>([]);
    const [perks, setPerks] = useState<ClanPerk[]>([]);
    const [invites, setInvites] = useState<ClanInvite[]>([]);
    const [publicClans, setPublicClans] = useState<Clan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // A slow response must not clobber a newer one.
    const requestSeq = useRef(0);

    const refresh = useCallback(async () => {
        const seq = ++requestSeq.current;
        setRefreshing(true);
        try {
            const lobby = await Promise.allSettled([
                api.get<Clan[]>('/clan/'),
                api.get<ClanInvite[]>('/clan/invites/me'),
            ]);
            if (seq !== requestSeq.current) return;
            if (lobby[0].status === 'fulfilled') setPublicClans(lobby[0].value.data ?? []);
            if (lobby[1].status === 'fulfilled') setInvites(lobby[1].value.data ?? []);

            if (clanId) {
                const [clanRes, membersRes, votesRes, perksRes] = await Promise.allSettled([
                    api.get<Clan>(`/clan/${clanId}`),
                    api.get<ClanMember[]>(`/clan/${clanId}/members`),
                    api.get<ClanVote[]>(`/clan/${clanId}/votes`),
                    api.get<ClanPerk[]>('/clan/perks'),
                ]);
                if (seq !== requestSeq.current) return;
                if (clanRes.status === 'fulfilled') setClan(clanRes.value.data);
                if (membersRes.status === 'fulfilled') setMembers(membersRes.value.data ?? []);
                if (votesRes.status === 'fulfilled') setVotes(votesRes.value.data ?? []);
                if (perksRes.status === 'fulfilled') setPerks(perksRes.value.data ?? []);
            } else {
                setClan(null);
                setMembers([]);
                setVotes([]);
                setPerks([]);
            }
        } finally {
            if (seq === requestSeq.current) {
                setRefreshing(false);
                setLoading(false);
            }
        }
    }, [clanId]);

    useEffect(() => {
        // Fetching on mount is exactly what effects are for; the "refreshing"
        // flag it raises is the point, not a cascading render to avoid.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refresh();
    }, [refresh]);

    return {
        clanId,
        clan,
        members,
        votes,
        perks,
        invites,
        publicClans,
        loading,
        refreshing,
        refresh,
        setClan,
        setPerks,
    };
}

/** Members sorted by what they actually gave to the treasury. */
export function topDonors(members: ClanMember[], count = 3): ClanMember[] {
    return [...members]
        .sort((a, b) => b.total_donated - a.total_donated)
        .filter(m => m.total_donated > 0)
        .slice(0, count);
}
