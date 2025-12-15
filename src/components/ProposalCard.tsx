import { useNavigate } from 'react-router-dom'
import type { Proposal } from '../types'
import { StatusBadge, PriorityBadge } from './ui/Badge'

interface ProposalCardProps {
    proposal: Proposal
}

export function ProposalCard({ proposal }: ProposalCardProps) {
    const navigate = useNavigate()

    const formatCurrency = (low: number, high: number) => {
        const formatK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`
        return `${formatK(low)} - ${formatK(high)}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div
            onClick={() => navigate(`/proposal/${proposal.id}`)}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {proposal.prospect?.company_name || 'Unknown Company'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {proposal.prospect?.contact_name}
                        {proposal.prospect?.contact_role && `, ${proposal.prospect.contact_role}`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <StatusBadge status={proposal.status} />
                    <PriorityBadge priority={proposal.priority} />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">
                    {formatCurrency(proposal.total_estimate_low, proposal.total_estimate_high)}
                </span>
                <span className="text-gray-400">
                    {formatDate(proposal.created_at)}
                </span>
            </div>
        </div>
    )
}
