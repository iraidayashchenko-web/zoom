import * as React from 'react';
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50 ${props.className ?? ''}`} />; }
export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`} />; }
