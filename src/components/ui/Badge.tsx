import type { ProposalStatus, Priority, MaturityLevel } from '../../types'

const statusStyles: Record<ProposalStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_review: 'bg-amber-100 text-amber-700',
    sent: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
    stalled: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<ProposalStatus, string> = {
    draft: 'Draft',
    pending_review: 'Pending Review',
    sent: 'Sent',
    won: 'Won',
    lost: 'Lost',
    stalled: 'Stalled',
}

export function StatusBadge({ status }: { status: ProposalStatus }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            {statusLabels[status]}
        </span>
    )
}

const priorityStyles: Record<Priority, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[priority]}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    )
}

const maturityLabels = ['', 'Ad Hoc', 'Early Learning', 'Applied AI', 'Integrated AI', 'Autonomous AI']
const maturityStyles = ['', 'bg-red-100 text-red-700', 'bg-amber-100 text-amber-700', 'bg-yellow-100 text-yellow-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700']

export function MaturityBadge({ level }: { level: MaturityLevel }) {
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${maturityStyles[level]}`}>
            Level {level}: {maturityLabels[level]}
        </span>
    )
}
