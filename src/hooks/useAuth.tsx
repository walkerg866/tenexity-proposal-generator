import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session?.user) {
                fetchUserProfile(session)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session?.user) {
                setLoading(true)
                fetchUserProfile(session)
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchUserProfile(session: Session) {
        const { user: authUser } = session
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

        if (data && !error) {
            setUser(data)
        } else if (error && error.code === 'PGRST116') {
            // User profile doesn't exist, create it
            const newUser: User = {
                id: authUser.id,
                email: authUser.email!,
                name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            }

            const { data: createdUser, error: insertError } = await supabase
                .from('users')
                .insert(newUser)
                .select()
                .single()

            if (createdUser && !insertError) {
                setUser(createdUser)
            } else {
                console.error('Error creating user profile:', insertError)
                setUser(null)
            }
        } else {
            console.error('Error fetching user profile:', error)
            setUser(null)
        }
        setLoading(false)
    }

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            return { error: error.message }
        }
        return {}
    }

    async function signOut() {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
