export type ClanPrivacy = 'OPEN' | 'INVITE' | 'PRIVATE';

export type VoteType = 'KICK' | 'POLICY' | 'UPGRADE' | 'CHARITY';

export type VoteStatus = 'OPEN' | 'PASSED' | 'FAILED';

export interface Clan {
    id: string;
    name: string;
    description: string | null;
    privacy: ClanPrivacy;
    treasury_balance: number;
    created_at: string;
}

export interface ClanMember {
    user_id: string;
    username: string;
    total_donated: number;
    joined_at: string;
}

export interface ClanVote {
    id: number;
    clan_id: string;
    vote_type: VoteType;
    target_id: string | null;
    status: VoteStatus;
    yes_votes: number;
    no_votes: number;
    created_at: string;
    expires_at: string;
    initiator_id: string;
}

export interface ClanInvite {
    id: number;
    clan_name: string;
    inviter_username: string;
    created_at: string;
}
