import type { ProposalStatus, Phase, Meeting, ProposalAnalysis } from '../types'

const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL

interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function callWebhook<T>(
    endpoint: string,
    payload: object
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${N8N_BASE_URL}${endpoint} `, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} `)
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Specific API functions
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

export const api = {
    generateProposal: (payload: GenerateProposalPayload) =>
        callWebhook<ProposalResponse>('/proposal/generate', payload),

    updateProposalStatus: (payload: UpdateStatusPayload) =>
        callWebhook<{ success: boolean }>('/proposal/manage', payload),

    generatePdf: (proposalId: string, userId: string) =>
        callWebhook<{ pdf_url: string }>('/proposal/pdf', { proposal_id: proposalId, user_id: userId }),

    listFirefliesMeetings: (userId: string) =>
        callWebhook<{ meetings: Meeting[] }>('/fireflies', { action: 'list_meetings', user_id: userId }),

    getFirefliesTranscript: (userId: string, meetingId: string) =>
        callWebhook<{ transcript: string }>('/fireflies', { action: 'get_transcript', user_id: userId, meeting_id: meetingId }),
}
