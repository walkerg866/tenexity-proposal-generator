import { useState } from 'react'
import { FileText, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { api } from '../../lib/api'
import type { ProposalAnalysis } from '../../types'

interface ProposalTabProps {
    analysis: ProposalAnalysis
    proposalId: string
    userId: string
}

export function ProposalTab({ analysis, proposalId, userId }: ProposalTabProps) {
    const [generatingPdf, setGeneratingPdf] = useState(false)

    const formatCurrency = (amount: number) => {
        return amount >= 1000 ? `$${(amount / 1000).toFixed(0)}K` : `$${amount}`
    }

    async function handleGeneratePdf() {
        setGeneratingPdf(true)

        // Check if result is void or has other props
        // api.generatePdf returns Promise<{ success: boolean; data?: { pdf_url: string }; error?: string }>
        // wait, looking at api.ts: `generatePdf: (proposalId: string, userId: string) => callWebhook<{ pdf_url: string }>('/proposal/pdf', ...)`
        // So it returns ApiResponse<{ pdf_url: string }>

        const result = await api.generatePdf(proposalId, userId)

        if (result.success && result.data?.pdf_url) {
            window.open(result.data.pdf_url, '_blank')
            toast.success('PDF generated successfully!')
        } else {
            // If no data, implies failure or not implemented fully in backend yet?
            if (!result.success) {
                toast.error(result.error || 'Failed to generate PDF')
            } else {
                toast.info('PDF generated but no URL returned.')
            }
        }

        setGeneratingPdf(false)
    }

    const phases = analysis.recommended_approach.phases

    // Calculate totals
    const initialLow = phases.reduce((sum, p) => sum + (p.pricing_note ? 0 : p.phase_total_low), 0)
    const initialHigh = phases.reduce((sum, p) => sum + (p.pricing_note ? 0 : p.phase_total_high), 0)
    const ongoingPhase = phases.find(p => p.pricing_note?.includes('month'))

    return (
        <div className="space-y-6">
            {/* Summary */}
            <Card>
                <CardTitle>Recommended Approach</CardTitle>
                <p className="text-gray-600 mt-2">{analysis.recommended_approach.summary}</p>
            </Card>

            {/* Phases */}
            {phases.map((phase) => (
                <Card key={phase.phase_number} padding="none" className="overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <span className="text-sm text-gray-500">Phase {phase.phase_number}</span>
                            <h3 className="font-semibold text-gray-900">{phase.phase_label}</h3>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(phase.phase_total_low)} - {formatCurrency(phase.phase_total_high)}
                            {phase.pricing_note && <span className="text-sm font-normal text-gray-500">/mo</span>}
                        </span>
                    </div>

                    <div className="p-6 space-y-4">
                        {phase.offerings.map((offering, i) => (
                            <div key={i} className={i > 0 ? 'pt-4 border-t border-gray-100' : ''}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                        {offering.code}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{offering.name}</h4>
                                        <p className="text-gray-600 mt-1">{offering.rationale}</p>
                                        {offering.custom_scope && (
                                            <p className="text-gray-500 text-sm mt-1">{offering.custom_scope}</p>
                                        )}
                                        <div className="flex gap-6 mt-3 text-sm">
                                            <span className="text-gray-500">
                                                Timeline: <span className="text-gray-700 font-medium">{offering.timeline}</span>
                                            </span>
                                            <span className="text-gray-500">
                                                Investment: <span className="text-gray-700 font-medium">
                                                    {formatCurrency(offering.price_low)} - {formatCurrency(offering.price_high)}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}

            {/* Investment Summary */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-4">Investment Summary</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <span className="text-sm text-blue-700">Initial Investment</span>
                        <p className="text-2xl font-bold text-blue-900">
                            {formatCurrency(initialLow)} - {formatCurrency(initialHigh)}
                        </p>
                    </div>
                    {ongoingPhase && (
                        <div>
                            <span className="text-sm text-blue-700">Ongoing Monthly</span>
                            <p className="text-2xl font-bold text-blue-900">
                                {formatCurrency(ongoingPhase.phase_total_low)} - {formatCurrency(ongoingPhase.phase_total_high)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cautions */}
            {analysis.cautions.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900 mb-2">Cautions</h3>
                            <ul className="text-amber-800 space-y-1 text-sm">
                                {analysis.cautions.map((caution, i) => (
                                    <li key={i}>• {caution}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate PDF */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">Generate PDF</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Create a branded PDF proposal document for this prospect.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleGeneratePdf}
                        loading={generatingPdf}
                    >
                        <FileText className="w-5 h-5" />
                        Generate PDF
                    </Button>
                </div>
            </Card>
        </div>
    )
}
