import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiResponse } from '../types/application'
import { ERROR_CODES } from '../config/constants'

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
    success: boolean,
    data?: T,
    error?: {
        code: string
        message: string
        details?: unknown
    }
): ApiResponse<T> {
    return {
        success,
        data,
        error,
    }
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T): NextResponse {
    return NextResponse.json(createApiResponse(true, data))
}

/**
 * Create an error response
 */
export function createErrorResponse(
    code: string,
    message: string,
    status: number = 400,
    details?: unknown
): NextResponse {
    return NextResponse.json(
        createApiResponse(false, undefined, { code, message, details }),
        { status }
    )
}

/**
 * Handle validation errors from Zod
 */
export function handleValidationError(error: ZodError<unknown>): NextResponse {
    const details = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }))

    return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Validation failed',
        400,
        details
    )
}

/**
 * Handle unknown errors
 */
export function handleUnknownError(error: unknown): NextResponse {
    console.error('Unknown error:', error)

    return createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred',
        500
    )
}

/**
 * Validate request method
 */
export function validateMethod(request: Request, allowedMethods: string[]): boolean {
    return allowedMethods.includes(request.method)
}

/**
 * Create method not allowed response
 */
export function createMethodNotAllowedResponse(allowedMethods: string[]): NextResponse {
    return NextResponse.json(
        createApiResponse(false, undefined, {
            code: 'METHOD_NOT_ALLOWED',
            message: `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
        }),
        {
            status: 405,
            headers: {
                'Allow': allowedMethods.join(', ')
            }
        }
    )
}