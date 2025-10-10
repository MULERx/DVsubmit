'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'

export function AdminLegalNotice() {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="h-5 w-5" />
          Admin Legal Responsibilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800 space-y-2">
              <h3 className="font-semibold">Important Admin Guidelines</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Always verify payment references thoroughly before approval</li>
                <li>Ensure all user data is accurate before submitting to DV system</li>
                <li>Maintain confidentiality of all user information</li>
                <li>Document all actions in the audit log</li>
                <li>Never guarantee DV lottery selection to users</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-orange-700">
          <p>
            <strong>Legal Reminder:</strong> As an admin, you are responsible for ensuring 
            that users understand this is not a government service and that DV lottery 
            selection is not guaranteed. All admin actions are logged for compliance purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}