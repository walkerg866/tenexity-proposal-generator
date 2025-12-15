import { AlertTriangle } from 'lucide-react'
import { Card, CardTitle } from '../ui/Card'
import { MaturityBadge } from '../ui/Badge'
import type { ProposalAnalysis } from '../../types'

interface AnalysisTabProps {
    analysis: ProposalAnalysis
}

export function AnalysisTab({ analysis }: AnalysisTabProps) {
    return (
        <div className="space-y-6">
            {/* Company Assessment */}
            <Card>
                <CardTitle>Company Assessment</CardTitle>
                <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600">Maturity Level:</span>
                        <MaturityBadge level={analysis.company_context.current_maturity_level} />
                    </div>
                    <p className="text-gray-600 italic">"{analysis.company_context.maturity_rationale}"</p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                            <span className="text-sm text-gray-500">Technical Environment</span>
                            <p className="font-medium text-gray-900">{analysis.company_context.technical_environment}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Urgency Score</span>
                            <p className="font-medium text-gray-900">
                                {analysis.timeline_signals.urgency_score}/10
                                {analysis.timeline_signals.deadlines_mentioned.length > 0 &&
                                    ` - ${analysis.timeline_signals.deadlines_mentioned[0]}`}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stakeholder Map */}
            <Card>
                <CardTitle>Stakeholder Map</CardTitle>
                <div className="space-y-4 mt-4">
                    {/* Champion */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-sm font-medium text-green-700">Champion</span>
                        <p className="text-gray-900 font-medium">
                            {analysis.stakeholder_map.champion.name} ({analysis.stakeholder_map.champion.role}) — {analysis.stakeholder_map.champion.stance}
                        </p>
                    </div>

                    {/* Decision Makers */}
                    <div>
                        <span className="text-sm font-medium text-gray-500 mb-2 block">Decision Makers</span>
                        <div className="space-y-2">
                            {analysis.stakeholder_map.decision_makers.map((dm, i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                    <span className="text-gray-900">{dm.name} {dm.role && `(${dm.role})`}</span>
                                    <span className={`text-sm ${dm.stance === 'supportive' ? 'text-green-600' :
                                            dm.stance === 'resistant' ? 'text-red-600' : 'text-amber-600'
                                        }`}>
                                        {dm.notes || dm.stance}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Political Note */}
                    {analysis.stakeholder_map.political_notes && (
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-medium text-amber-800">Political Note</span>
                                <p className="text-amber-700 text-sm">{analysis.stakeholder_map.political_notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Pain Signals */}
            <Card>
                <CardTitle>Pain Signals Detected</CardTitle>
                <div className="space-y-3 mt-4">
                    {analysis.pain_signals.map((signal, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-900 font-medium mb-2">"{signal.signal}"</p>
                            <div className="flex gap-4 text-sm">
                                <span className="text-gray-500">
                                    Category: <span className="text-gray-700">{signal.category}</span>
                                </span>
                                <span className="text-gray-500">
                                    Maps to: <span className="text-blue-600 font-medium">{signal.maps_to_offerings.join(', ')}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Budget Signals */}
            <Card>
                <CardTitle>Budget Signals</CardTitle>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-500">Low friction threshold</span>
                        <p className="text-xl font-bold text-green-700">
                            {analysis.budget_signals.low_friction_threshold || 'Not specified'}
                        </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                        <span className="text-sm text-gray-500">Requires business case</span>
                        <p className="text-xl font-bold text-amber-700">
                            {analysis.budget_signals.requires_business_case_above || 'Not specified'}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
