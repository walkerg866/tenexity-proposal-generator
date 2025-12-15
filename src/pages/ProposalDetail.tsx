import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { AnalysisTab } from '../components/proposal/AnalysisTab'
import { ProposalTab } from '../components/proposal/ProposalTab'
import { EmailTab } from '../components/proposal/EmailTab'
import type { Proposal } from '../types'

type TabType = 'analysis' | 'proposal' | 'email'

export default function ProposalDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<TabType>('analysis')

    const { data: proposal, isLoading, refetch } = useQuery({
        queryKey: ['proposal', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('proposals')
                .select('*, prospect:prospects(*)')
                .eq('id', id)
                .single()

            if (error) throw error
            return data as Proposal
        },
        enabled: !!id,
    })

    // We need to fetch outcome buttons functionality if they are clicked in the header.
    // The provided design shows "Won" and "Lost" buttons in the HEADER.
    // Their onClick handlers are empty in the prompt: `onClick={() => {}}`.
    // I should probably map these to the EmailTab's outcome modal or implement similar logic.
    // However, the OutcomeModal is currently nested in EmailTab.
    // To avoid prop drilling or complex state lifting for now, I will leave them as placeholders 
    // OR I can make them switch to the Email tab where the tracking logic lives, or duplicate the logic.
    // Given the instruction "Won/Lost buttons" in header, I'll just add a TODO or basic alert for now,
    // or better, I will implement a minimal updateStatus function here too if I want them functional.
    // But wait, `EmailTab` has `OutcomeModal` which handles notes, tags, etc.
    // Clicking "Won" in header should probably open that modal.
    // For now, I will remove the onClick placeholders or add a toast "Please track outcome in Email tab" to guide user,
    // or just leave as is if I don't want to overengineer without specific instructions on shared state.
    // Visuals: The prompt specifically asks for "Won with win rate % (green)" in DASHBOARD, but here "Won/Lost buttons".
    // I will just add a localized update function or toast.

    // Actually, I can just leave them as non-functional UI elements if not specified, 
    // but better to allow them to do *something*.
    // I'll make them switch to the 'email' tab and scroll to outcome section?
    // Or just simply:

    const handleHeaderAction = () => {
        // Just switch to email tab where the action is fully supported with modal
        setActiveTab('email')
        // potentially scroll to bottom
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        )
    }

    if (!proposal) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="text-center py-12 px-8">
                    <p className="text-gray-500 mb-4">Proposal not found</p>
                    <Link to="/">
                        <Button>Back to Dashboard</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    const tabs: { id: TabType; label: string }[] = [
        { id: 'analysis', label: 'Analysis' },
        { id: 'proposal', label: 'Proposal' },
        { id: 'email', label: 'Email' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {proposal.prospect?.company_name || 'Unknown Company'}
                            </h1>
                            <p className="text-gray-500">
                                {proposal.prospect?.contact_name}
                                {proposal.prospect?.contact_role && `, ${proposal.prospect.contact_role}`}
                            </p>
                            <div className="flex gap-2 mt-2">
                                <StatusBadge status={proposal.status} />
                                <PriorityBadge priority={proposal.priority} />
                            </div>
                        </div>

                        {(proposal.status === 'sent' || proposal.status === 'pending_review') && (
                            <div className="flex gap-3">
                                <Button variant="success" onClick={handleHeaderAction}>
                                    Won
                                </Button>
                                <Button variant="danger" onClick={handleHeaderAction}>
                                    Lost
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex gap-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <main className="max-w-5xl mx-auto px-6 py-8">
                {activeTab === 'analysis' && <AnalysisTab analysis={proposal.ai_analysis} />}
                {activeTab === 'proposal' && user && (
                    <ProposalTab
                        analysis={proposal.ai_analysis}
                        proposalId={proposal.id}
                        userId={user.id}
                    />
                )}
                {activeTab === 'email' && user && (
                    <EmailTab
                        proposal={proposal}
                        onStatusUpdate={refetch}
                        userId={user.id}
                    />
                )}
            </main>
        </div>
    )
}
