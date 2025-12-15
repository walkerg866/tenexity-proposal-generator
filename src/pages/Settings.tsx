import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Key, User as UserIcon, Save } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function SettingsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const [name, setName] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [signatureName, setSignatureName] = useState('')

    useEffect(() => {
        if (user) {
            setName(user.name || '')
            setApiKey(user.fireflies_api_key || '')
            setSignatureName(user.default_signature_name || '')
        }
    }, [user])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!user) return

        setLoading(true)

        const { error } = await supabase
            .from('users')
            .update({
                full_name: name,
                fireflies_api_key: apiKey || null,
                default_signature_name: signatureName || null
            })
            .eq('id', user.id)

        if (error) {
            toast.error('Failed to update settings')
            console.error(error)
        } else {
            toast.success('Settings saved successfully')
            // reload window to refresh auth state if needed, or rely on RLS/realtime if implemented?
            // Since useAuth pulls from session/user table on load, we might want to manually update local state or just expect next fetch to get it.
            // For simplicity in this scope, a toast is enough. The user object in useAuth might not update immediately without a re-fetch.
            // But typically for a simple app this is fine.
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Settings */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <CardTitle>Profile Settings</CardTitle>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                            />
                            <Input
                                label="Email Address"
                                value={user?.email || ''}
                                disabled
                                helperText="Email cannot be changed"
                                className="bg-gray-50"
                            />
                            <Input
                                label="Default Signature Name"
                                value={signatureName}
                                onChange={(e) => setSignatureName(e.target.value)}
                                placeholder="e.g., John Doe, Senior Consultant"
                                helperText="Used at the bottom of generated emails"
                            />
                        </div>
                    </Card>

                    {/* Integrations */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Key className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle>Integrations</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Connect external tools to power the generator</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Fireflies.ai API Key"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk_..."
                                helperText="Required to fetch meeting transcripts directly"
                            />
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" loading={loading} className="w-full sm:w-auto">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
