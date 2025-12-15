export type ProposalStatus = 'draft' | 'pending_review' | 'sent' | 'won' | 'lost' | 'stalled'
export type Priority = 'high' | 'medium' | 'low'
export type MaturityLevel = 1 | 2 | 3 | 4 | 5

export interface User {
    id: string
    email: string
    name: string
    fireflies_api_key?: string
    default_signature_name?: string
}

export interface Prospect {
    id: string
    company_name: string
    contact_name?: string
    contact_email?: string
    contact_role?: string
}

export interface Proposal {
    id: string
    prospect_id: string
    prospect?: Prospect
    status: ProposalStatus
    priority: Priority
    discovery_notes: string
    additional_context?: string
    ai_analysis: ProposalAnalysis
    draft_email_subject: string
    draft_email_body: string
    total_estimate_low: number
    total_estimate_high: number
    ongoing_monthly_low?: number
    ongoing_monthly_high?: number
    created_at: string
    sent_at?: string
}

export interface ProposalAnalysis {
    company_context: {
        industry: string
        estimated_size: string
        current_maturity_level: MaturityLevel
        maturity_rationale: string
        technical_environment: string
        key_systems_mentioned: string[]
    }
    stakeholder_map: {
        champion: { name: string; role: string; stance: string }
        decision_makers: Array<{ name: string; role: string; stance: string; notes?: string }>
        political_notes?: string
    }
    pain_signals: Array<{
        signal: string
        category: string
        quantified_impact?: string
        maps_to_offerings: string[]
    }>
    budget_signals: {
        low_friction_threshold?: string
        requires_business_case_above?: string
    }
    timeline_signals: {
        urgency_score: number
        deadlines_mentioned: string[]
    }
    recommended_approach: {
        summary: string
        phases: Phase[]
    }
    cautions: string[]
}

export interface Phase {
    phase_number: number
    phase_label: string
    offerings: PhaseOffering[]
    phase_total_low: number
    phase_total_high: number
    pricing_note?: string
}

export interface PhaseOffering {
    code: string
    name: string
    rationale: string
    custom_scope?: string
    price_low: number
    price_high: number
    timeline: string
}

export interface Meeting {
    id: string
    title: string
    date: string
    duration: number
    participants: string[]
}

export interface GenerateProposalPayload {
    user_id: string
    prospect: {
        company_name: string
        contact_name?: string
        contact_email?: string
        contact_role?: string
    }
    discovery_notes: string
    additional_context?: string
    fireflies_meeting_id?: string
}

export interface UpdateStatusPayload {
    action: 'update_status' | 'save_example'
    proposal_id: string
    user_id: string
    status?: ProposalStatus
    outcome_notes?: string
    what_worked?: string
    tags?: string[]
    save_as_example?: boolean
}

export interface ProposalResponse {
    proposal_id: string
    prospect_id: string
    analysis: ProposalAnalysis
    recommended_phases: Phase[]
    email: { subject: string; body: string }
    totals: {
        initial_investment_low: number
        initial_investment_high: number
        ongoing_monthly_low: number
        ongoing_monthly_high: number
    }
}
