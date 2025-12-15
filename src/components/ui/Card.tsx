import type { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${paddingStyles[padding]} ${className}`}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>{children}</div>
}

export function CardTitle({ children }: { children: ReactNode }) {
    return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
}
