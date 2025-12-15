import { useState } from 'react'
import { Copy, Check, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { api } from '../../lib/api'
import type { Proposal } from '../../types'
import { OutcomeModal } from './OutcomeModal'

interface EmailTabProps {
    proposal: Proposal
    onStatusUpdate: () => void
    userId: string
}

export function EmailTab({ proposal, onStatusUpdate, userId }: EmailTabProps) {
    const [subject, setSubject] = useState(proposal.draft_email_subject)
    const [body, setBody] = useState(proposal.draft_email_body)
    const [copied, setCopied] = useState(false)
    const [markingSent, setMarkingSent] = useState(false)
    const [outcomeModal, setOutcomeModal] = useState<'won' | 'lost' | 'stalled' | null>(null)

    async function handleCopy() {
        const emailText = `Subject: ${subject}\n\n${body}`

        try {
            await navigator.clipboard.writeText(emailText)
            setCopied(true)
            toast.success('Copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy')
        }
    }

    async function handleMarkSent() {
        setMarkingSent(true)

        const result = await api.updateProposalStatus({
            action: 'update_status',
            proposal_id: proposal.id,
            user_id: userId,
            status: 'sent',
        })

        if (result.success) {
            toast.success('Proposal marked as sent')
            onStatusUpdate()
        } else {
            toast.error('Failed to update status')
        }

        setMarkingSent(false)
    }

    async function handleOutcome(outcome: 'won' | 'lost' | 'stalled', notes?: string, whatWorked?: string, tags?: string[], saveAsExample?: boolean) {
        const result = await api.updateProposalStatus({
            action: saveAsExample ? 'save_example' : 'update_status',
            proposal_id: proposal.id,
            user_id: userId,
            status: outcome,
            outcome_notes: notes,
            what_worked: whatWorked,
            tags,
            save_as_example: saveAsExample,
        })

        if (result.success) {
            toast.success(`Proposal marked as ${outcome}`)
            onStatusUpdate()
        } else {
            toast.error('Failed to update status')
        }

        setOutcomeModal(null)
    }

    return (
        <div className="space-y-6">
            {/* Email Editor */}
            <Card padding="none" className="overflow-hidden">
                <div className="p-6 border-b border-gray-200 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">To</label>
                        <p className="text-gray-900">{proposal.prospect?.contact_email || 'No email provided'}</p>
                    </div>

                    <Input
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>

                <div className="p-6">
                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={16}
                        className="font-normal leading-relaxed"
                    />
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleCopy}>
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </Button>

                        {proposal.status !== 'sent' && proposal.status !== 'won' && proposal.status !== 'lost' && (
                            <Button
                                variant="secondary"
                                onClick={handleMarkSent}
                                loading={markingSent}
                            >
                                <Send className="w-5 h-5" />
                                Mark as Sent
                            </Button>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                        After pasting in Gmail and sending, come back to mark the outcome.
                    </p>
                </div>
            </Card>

            {/* Track Outcome */}
            {proposal.status === 'sent' && (
                <Card>
                    <CardTitle>Track Outcome</CardTitle>
                    <p className="text-gray-600 mt-2 mb-4">After sending, how did this proposal turn out?</p>

                    <div className="flex gap-3">
                        <Button
                            variant="success"
                            onClick={() => setOutcomeModal('won')}
                        >
                            🎉 Won
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setOutcomeModal('lost')}
                        >
                            😔 Lost
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setOutcomeModal('stalled')}
                        >
                            ⏸️ Stalled
                        </Button>
                    </div>
                </Card>
            )}

            {/* Outcome Modal */}
            {outcomeModal && (
                <OutcomeModal
                    outcome={outcomeModal}
                    onClose={() => setOutcomeModal(null)}
                    onSubmit={handleOutcome}
                />
            )}
        </div>
    )
}
