import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'

type TranscriptSource = 'fireflies' | 'paste'

export default function NewProposalPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [source, setSource] = useState<TranscriptSource>('paste')
    const [loading, setLoading] = useState(false)

    // Form fields
    const [companyName, setCompanyName] = useState('')
    const [contactName, setContactName] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactRole, setContactRole] = useState('')
    const [discoveryNotes, setDiscoveryNotes] = useState('')
    const [additionalContext, setAdditionalContext] = useState('')
    const [selectedMeetingId, _setSelectedMeetingId] = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if (!companyName.trim()) {
            toast.error('Company name is required')
            return
        }

        if (!discoveryNotes.trim()) {
            toast.error('Discovery notes are required')
            return
        }

        setLoading(true)

        // Ensure user is defined before accessing id, though useAuth usually handles this if protected
        if (!user) {
            toast.error('You must be logged in')
            setLoading(false)
            return
        }

        const result = await api.generateProposal({
            user_id: user.id,
            prospect: {
                company_name: companyName,
                contact_name: contactName || undefined,
                contact_email: contactEmail || undefined,
                contact_role: contactRole || undefined,
            },
            discovery_notes: discoveryNotes,
            additional_context: additionalContext || undefined,
            fireflies_meeting_id: selectedMeetingId || undefined,
        })

        if (result.success && result.data) {
            toast.success('Proposal generated successfully!')
            navigate(`/proposal/${result.data.proposal_id}`)
        } else {
            toast.error(result.error || 'Failed to generate proposal')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">New Proposal</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <Card padding="lg">
                    <form onSubmit={handleSubmit}>
                        {/* Source Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Transcript Source
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSource('fireflies')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-colors text-left ${source === 'fireflies'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${source === 'fireflies' ? 'border-blue-600' : 'border-gray-300'
                                            }`}>
                                            {source === 'fireflies' && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900">Select from Fireflies</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSource('paste')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-colors text-left ${source === 'paste'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${source === 'paste' ? 'border-blue-600' : 'border-gray-300'
                                            }`}>
                                            {source === 'paste' && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900">Paste Transcript</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Fireflies Meeting List */}
                        {source === 'fireflies' && (
                            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-sm text-gray-500 mb-3">
                                    {user?.fireflies_api_key
                                        ? 'Select a recent meeting:'
                                        : 'Configure Fireflies API key in Settings to use this feature.'}
                                </p>
                                {/* TODO: Implement Fireflies meeting list fetch */}
                                <p className="text-sm text-gray-400 italic">
                                    Meeting list will appear here when Fireflies is configured.
                                    {/* Placeholder for now to avoid unused state variable error if we weren't using selectedMeetingId elsewhere, 
                      but we are using it in handleSubmit. To be safe, let's assume value setting is handled in future. 
                      I'll add a dummy handler to avoid 'selectedMeetingId' unused warning if TS is strict about unused state setters 
                      (it's not usually, but good to be clean). 
                      Actually, setSelectedMeetingId IS used in the TODO impl, but not here. 
                      I will just leave it as is, or add a comment. 
                  */}
                                </p>
                                {/* Temporary usage to silence unused vars if necessary:
                   <button type="button" onClick={() => setSelectedMeetingId('123')} hidden />
                */}
                            </div>
                        )}

                        {/* Prospect Information */}
                        <div className="border-t border-gray-200 pt-8 mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Prospect Information</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g., EB Horsman"
                                    required
                                />
                                <Input
                                    label="Contact Name"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    placeholder="e.g., Amy Moore"
                                />
                                <Input
                                    label="Contact Email"
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="e.g., amy@ebhorsman.com"
                                />
                                <Input
                                    label="Contact Role"
                                    value={contactRole}
                                    onChange={(e) => setContactRole(e.target.value)}
                                    placeholder="e.g., Director of IT"
                                />
                            </div>
                        </div>

                        {/* Discovery Notes */}
                        <div className="border-t border-gray-200 pt-8 mb-8">
                            <Textarea
                                label="Discovery Notes"
                                value={discoveryNotes}
                                onChange={(e) => setDiscoveryNotes(e.target.value)}
                                placeholder="Paste your transcript, Granola summary, or meeting notes here..."
                                rows={8}
                                required
                            />
                        </div>

                        {/* Additional Context */}
                        <div className="border-t border-gray-200 pt-8 mb-8">
                            <Textarea
                                label="Additional Context"
                                value={additionalContext}
                                onChange={(e) => setAdditionalContext(e.target.value)}
                                placeholder={`Add any context not captured in the transcript that should influence the proposal:

Examples:
- "Budget is tight now but Q2 opens up"
- "CEO retiring soon - focus on quick wins"
- "They've been burned by consultants - go slow"
- "Champion is new in role, needs internal win"`}
                                rows={5}
                                helperText="Optional: Include insights that should influence the AI's recommendations"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="border-t border-gray-200 pt-8">
                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full py-4 text-lg"
                            >
                                Analyze & Generate Proposal
                            </Button>
                        </div>
                    </form>
                </Card>
            </main>
        </div>
    )
}
