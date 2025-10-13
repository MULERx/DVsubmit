import { Info } from 'lucide-react'

export function PasswordResetInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-2">How password reset works:</p>
          <ol className="space-y-1 text-blue-700">
            <li>1. Enter your email address</li>
            <li>2. Check your email for the reset link</li>
            <li>3. Click the link to be automatically signed in</li>
            <li>4. Set your new password</li>
          </ol>
        </div>
      </div>
    </div>
  )
}