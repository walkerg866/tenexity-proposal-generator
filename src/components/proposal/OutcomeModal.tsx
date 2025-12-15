import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Input'

interface OutcomeModalProps {
    outcome: 'won' | 'lost' | 'stalled'
    onClose: () => void
    onSubmit: (
        outcome: 'won' | 'lost' | 'stalled',
        notes?: string,
        whatWorked?: string,
        tags?: string[],
        saveAsExample?: boolean
    ) => void
}

export function OutcomeModal({ outcome, onClose, onSubmit }: OutcomeModalProps) {
    const [notes, setNotes] = useState('')
    const [whatWorked, setWhatWorked] = useState('')
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [saveAsExample, setSaveAsExample] = useState(true)
    const [loading, setLoading] = useState(false)

    function addTag() {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    function removeTag(tag: string) {
        setTags(tags.filter(t => t !== tag))
    }

    async function handleSubmit() {
        setLoading(true)
        await onSubmit(
            outcome,
            notes || undefined,
            outcome === 'won' ? whatWorked || undefined : undefined,
            outcome === 'won' && tags.length > 0 ? tags : undefined,
            outcome === 'won' ? saveAsExample : undefined
        )
        setLoading(false)
    }

    const titles = {
        won: '🎉 Congratulations!',
        lost: '😔 Sorry to hear that',
        stalled: '⏸️ Stalled',
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">{titles[outcome]}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {outcome === 'won' && (
                        <>
                            <p className="text-gray-600">Help future proposals by noting what worked:</p>

                            <Textarea
                                label="What worked well?"
                                value={whatWorked}
                                onChange={(e) => setWhatWorked(e.target.value)}
                                rows={3}
                                placeholder="e.g., Starting with a quick win under $10K built trust..."
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (optional)
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                                        >
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="hover:text-blue-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add a tag..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <Button variant="outline" size="sm" onClick={addTag}>
                                        Add
                                    </Button>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={saveAsExample}
                                    onChange={(e) => setSaveAsExample(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-700">Save as example for future proposals</span>
                            </label>
                        </>
                    )}

                    {outcome !== 'won' && (
                        <Textarea
                            label="Notes (optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder={outcome === 'lost' ? "What happened? Any lessons learned?" : "Why is this stalled?"}
                        />
                    )}
                </div>

                <div className="p-6 border-t border-gray-200">
                    <Button onClick={handleSubmit} loading={loading} className="w-full">
                        Save Outcome
                    </Button>
                </div>
            </div>
        </div>
    )
}
