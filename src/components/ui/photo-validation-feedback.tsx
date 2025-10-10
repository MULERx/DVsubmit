'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Check, 
  AlertTriangle, 
  X, 
  Eye, 
  User, 
  Image as ImageIcon,
  Lightbulb,
  Star
} from 'lucide-react'
import { AdvancedPhotoValidationResult } from '@/lib/utils/advanced-photo-validation'

interface PhotoValidationFeedbackProps {
  validation: AdvancedPhotoValidationResult
  onRetake?: () => void
  onProceed?: () => void
  showAdvanced?: boolean
}

export function PhotoValidationFeedback({
  validation,
  onRetake,
  onProceed,
  showAdvanced = true
}: PhotoValidationFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                <span className={getScoreColor(validation.complianceScore)}>
                  {validation.complianceScore}
                </span>
                <span className="text-gray-400 text-lg">/100</span>
              </div>
              <div>
                <p className={`font-medium ${getScoreColor(validation.complianceScore)}`}>
                  {getScoreLabel(validation.complianceScore)}
                </p>
                <p className="text-sm text-gray-600">
                  DV Lottery Compliance
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    validation.complianceScore >= 90 ? 'bg-green-500' :
                    validation.complianceScore >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${validation.complianceScore}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {validation.errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <X className="h-5 w-5" />
              Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validation.errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2 text-red-600">
                  <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Advanced Analysis Results */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Face Detection */}
          {validation.faceDetection && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  Face Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Face Detected</span>
                  {validation.faceDetection.faceDetected ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Properly Centered</span>
                  {validation.faceDetection.faceCentered ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eyes Open</span>
                  {validation.faceDetection.eyesOpen ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Neutral Expression</span>
                  {validation.faceDetection.neutralExpression ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Background Analysis */}
          {validation.backgroundAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4" />
                  Background Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plain Background</span>
                  {validation.backgroundAnalysis.isPlain ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">No Patterns</span>
                  {!validation.backgroundAnalysis.hasPatterns ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">No Shadows</span>
                  {!validation.backgroundAnalysis.hasShadows ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Color</span>
                  <span className="text-sm capitalize text-gray-600">
                    {validation.backgroundAnalysis.backgroundColor}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Assessment */}
          {validation.qualityAssessment && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" />
                  Image Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {Math.round(validation.qualityAssessment.sharpness)}
                    </div>
                    <div className="text-sm text-gray-500">Sharpness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {Math.round(validation.qualityAssessment.brightness)}
                    </div>
                    <div className="text-sm text-gray-500">Brightness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {Math.round(validation.qualityAssessment.contrast)}
                    </div>
                    <div className="text-sm text-gray-500">Contrast</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-600">Overall Quality: </span>
                  <span className="font-medium capitalize">
                    {validation.qualityAssessment.overallQuality}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recommendations */}
      {validation.recommendations.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Lightbulb className="h-5 w-5" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validation.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-600">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onRetake && (
          <Button variant="outline" onClick={onRetake}>
            Take New Photo
          </Button>
        )}
        {onProceed && validation.isValid && (
          <Button onClick={onProceed}>
            {validation.complianceScore >= 90 ? 'Perfect! Continue' : 'Continue Anyway'}
          </Button>
        )}
      </div>
    </div>
  )
}