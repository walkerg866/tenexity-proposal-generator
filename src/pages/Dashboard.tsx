import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProposalCard } from '../components/ProposalCard'
import type { Proposal, ProposalStatus } from '../types'

const filters: { label: string; value: ProposalStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Pending Review', value: 'pending_review' },
    { label: 'Sent', value: 'sent' },
    { label: 'Won', value: 'won' },
    { label: 'Lost', value: 'lost' },
]

export default function DashboardPage() {
    const { user } = useAuth()
    const [activeFilter, setActiveFilter] = useState<ProposalStatus | 'all'>('all')

    const { data: proposals = [], isLoading } = useQuery({
        queryKey: ['proposals', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('proposals')
                .select('*, prospect:prospects(*)')
                .eq('created_by', user?.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Proposal[]
        },
        enabled: !!user?.id,
    })

    // Filter only if not 'all'. Type assertion needed because filters state is strongly typed but simple comparison might be tricky in some TS versions with string literals.
    const filteredProposals = activeFilter === 'all'
        ? proposals
        : proposals.filter(p => p.status === activeFilter)

    const stats = {
        total: proposals.length,
        pending: proposals.filter(p => p.status === 'pending_review').length,
        sent: proposals.filter(p => p.status === 'sent').length,
        won: proposals.filter(p => p.status === 'won').length,
    }

    const winRate = stats.sent + stats.won > 0
        ? Math.round((stats.won / (stats.sent + stats.won)) * 100)
        : 0

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <Card>
                        <p className="text-sm text-gray-500 mb-1">Total Proposals</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-500 mb-1">Pending Review</p>
                        <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-500 mb-1">Sent</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.sent}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-500 mb-1">Won</p>
                        <p className="text-3xl font-bold text-green-600">{stats.won}</p>
                        <p className="text-xs text-gray-400 mt-1">{winRate}% win rate</p>
                    </Card>
                </div>

                {/* Filter Tabs + New Button */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        {filters.map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setActiveFilter(filter.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === filter.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <Link to="/proposal/new">
                        <Button>
                            <Plus className="w-5 h-5" />
                            New Proposal
                        </Button>
                    </Link>
                </div>

                {/* Proposal Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredProposals.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-gray-500 mb-4">
                            {activeFilter === 'all'
                                ? "No proposals yet. Create your first one!"
                                : `No ${activeFilter.replace('_', ' ')} proposals.`}
                        </p>
                        {activeFilter === 'all' && (
                            <Link to="/proposal/new">
                                <Button>
                                    <Plus className="w-5 h-5" />
                                    New Proposal
                                </Button>
                            </Link>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        {filteredProposals.map(proposal => (
                            <ProposalCard key={proposal.id} proposal={proposal} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
