# DVSubmit Design Document

## Overview

DVSubmit is a Next.js application that provides a user-assisted DV lottery submission service. The system integrates Supabase for authentication, file storage, and database services, while maintaining the existing Prisma ORM setup for complex data operations. The architecture emphasizes security through Row Level Security (RLS), comprehensive audit logging, and automated data retention policies.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Next.js Frontend]
        B[React Components]
        C[Client-side Validation]
    end
    
    subgraph "API Layer"
        D[Next.js API Routes]
        E[Middleware]
        F[Server-side Validation]
    end
    
    subgraph "Services Layer"
        G[Auth Service]
        H[File Upload Service]
        I[Payment Service]
        J[DV Submission Service]
        K[Audit Service]
        L[Retention Service]
    end
    
    subgraph "Data Layer"
        M[Supabase Auth]
        N[Supabase Storage]
        O[PostgreSQL + Prisma]
        P[RLS Policies]
    end
    
    subgraph "External Services"
        Q[Telebirr Payment Gateway]
        R[Email Service]
        S[U.S. DV System]
    end
    
    A --> D
    D --> G
    D --> H
    D --> I
    D --> J
    G --> M
    H --> N
    I --> Q
    J --> S
    D --> O
    O --> P
    K --> O
    L --> O
</mermaid>

### Technology Stack

- **Frontend**: Next.js 15.5.4 with React 19, TailwindCSS, TypeScript
- **Backend**: Next.js API Routes with middleware
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage with private buckets
- **Payments**: Telebirr integration
- **Email**: Supabase or external email service
- **Validation**: Zod for schema validation
- **UI Components**: Existing component library with Lucide React icons

## Components and Interfaces

### Core Components

#### 1. Authentication System
- **Supabase Auth Integration**: Email-based registration and login
- **Role-based Access Control**: User and Admin roles
- **Session Management**: JWT tokens with refresh mechanism
- **Email Verification**: Required before form access

#### 2. DV Form Management
- **Multi-step Form**: Progressive form completion with save/resume
- **Real-time Validation**: Client and server-side validation
- **Data Persistence**: Auto-save functionality with RLS protection
- **Form State Management**: React state with persistence

#### 3. Photo Upload System
- **Client-side Validation**: Format, size, dimension checks
- **Server-side Processing**: Advanced compliance validation
- **Secure Storage**: Private Supabase Storage buckets
- **Signed URL Generation**: Temporary access for viewing photos
- **Image Processing**: Resize/optimize if needed

#### 4. Payment Processing
- **Telebirr Integration**: Reference-based payment verification
- **Payment Tracking**: Status management and history
- **Admin Verification**: Manual payment confirmation workflow
- **Receipt Generation**: Digital receipts and confirmations

#### 5. Admin Dashboard
- **Application Management**: View and process submissions
- **Payment Verification**: Telebirr reference validation
- **Submission Workflow**: Official DV system integration
- **Audit Trail**: Comprehensive action logging
- **Bulk Operations**: Batch processing capabilities

#### 6. Audit and Compliance
- **Action Logging**: All admin and system actions
- **Data Retention**: Automated PII cleanup
- **Legal Compliance**: Disclaimer management
- **Security Monitoring**: Access attempt logging

### API Interfaces

#### Authentication Endpoints
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/user
POST /api/auth/verify-email
```

#### Application Management
```typescript
GET /api/applications
POST /api/applications
PUT /api/applications/[id]
DELETE /api/applications/[id]
GET /api/applications/[id]/status
```

#### File Upload
```typescript
POST /api/upload/photo
GET /api/upload/photo/[id]
DELETE /api/upload/photo/[id]
POST /api/upload/validate
```

#### Payment Processing
```typescript
POST /api/payments/telebirr
GET /api/payments/[id]/status
PUT /api/payments/[id]/verify
```

#### Admin Operations
```typescript
GET /api/admin/applications
PUT /api/admin/applications/[id]/verify-payment
POST /api/admin/applications/[id]/submit-dv
PUT /api/admin/applications/[id]/confirmation
GET /api/admin/audit-logs
```

## Data Models

### Database Schema

```prisma
model User {
  id                String        @id @default(cuid())
  email            String        @unique
  supabaseId       String        @unique
  role             UserRole      @default(USER)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  applications     Application[]
  auditLogs        AuditLog[]
  
  @@map("users")
}

model Application {
  id                    String            @id @default(cuid())
  userId               String
  user                 User              @relation(fields: [userId], references: [id])
  
  // Personal Information
  firstName            String
  lastName             String
  dateOfBirth          DateTime
  countryOfBirth       String
  countryOfEligibility String
  
  // Contact Information
  email                String
  phone                String
  address              Json
  
  // Education/Work
  education            String
  occupation           String
  
  // Photo
  photoUrl             String?
  photoValidated       Boolean           @default(false)
  
  // Payment
  paymentReference     String?
  paymentStatus        PaymentStatus     @default(PENDING)
  paymentVerifiedAt    DateTime?
  paymentVerifiedBy    String?
  
  // Submission
  status               ApplicationStatus @default(DRAFT)
  submittedAt          DateTime?
  confirmationNumber   String?
  submittedBy          String?
  
  // Metadata
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt
  
  auditLogs            AuditLog[]
  
  @@map("applications")
}

model AuditLog {
  id            String      @id @default(cuid())
  userId        String?
  user          User?       @relation(fields: [userId], references: [id])
  applicationId String?
  application   Application? @relation(fields: [applicationId], references: [id])
  
  action        String
  details       Json
  ipAddress     String?
  userAgent     String?
  
  createdAt     DateTime    @default(now())
  
  @@map("audit_logs")
}

model RetentionPolicy {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  retentionDays Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("retention_policies")
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

enum PaymentStatus {
  PENDING
  VERIFIED
  REJECTED
  REFUNDED
}

enum ApplicationStatus {
  DRAFT
  PAYMENT_PENDING
  PAYMENT_VERIFIED
  SUBMITTED
  CONFIRMED
  EXPIRED
}
```

### Supabase Storage Structure

```
dv-photos/
├── private/
│   ├── {userId}/
│   │   ├── {applicationId}/
│   │   │   ├── photo.jpg
│   │   │   └── metadata.json
└── temp/
    ├── {sessionId}/
    │   └── upload.jpg
```

### RLS Policies

```sql
-- Users can only access their own records
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own draft applications" ON applications
  FOR UPDATE USING (
    auth.uid()::text = user_id AND 
    status = 'DRAFT'
  );

-- Admins can access all records
CREATE POLICY "Admins can view all applications" ON applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Storage policies for photos
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dv-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Error Handling

### Error Categories

1. **Validation Errors**: Client and server-side validation failures
2. **Authentication Errors**: Login, registration, and session issues
3. **Authorization Errors**: Access control violations
4. **Payment Errors**: Telebirr integration and verification issues
5. **File Upload Errors**: Photo validation and storage failures
6. **External Service Errors**: DV system and email service issues
7. **System Errors**: Database and infrastructure failures

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}
```

### Error Handling Strategy

- **Client-side**: Toast notifications and inline form errors
- **Server-side**: Structured error responses with logging
- **Monitoring**: Error tracking and alerting system
- **Recovery**: Automatic retry mechanisms where appropriate

## Testing Strategy

### Testing Pyramid

1. **Unit Tests**: Core business logic and utilities
2. **Integration Tests**: API endpoints and database operations
3. **End-to-End Tests**: Critical user workflows
4. **Security Tests**: Authentication and authorization
5. **Performance Tests**: Load testing for peak usage

### Key Test Scenarios

#### Authentication Flow
- User registration and email verification
- Login/logout functionality
- Role-based access control
- Session management and refresh

#### Application Submission
- Multi-step form completion
- Photo upload and validation
- Payment processing workflow
- Admin verification process

#### Data Security
- RLS policy enforcement
- File access controls
- Audit logging accuracy
- Data retention compliance

#### Admin Operations
- Payment verification workflow
- DV submission process
- Bulk operations
- Audit trail integrity

### Testing Tools

- **Unit/Integration**: Jest with React Testing Library
- **E2E**: Playwright or Cypress
- **API Testing**: Supertest
- **Database Testing**: Prisma test environment
- **Security Testing**: Custom security test suite

## Security Considerations

### Data Protection
- **Encryption**: All PII encrypted at rest and in transit
- **Access Control**: RLS policies and role-based permissions
- **File Security**: Private storage buckets with signed URLs
- **Session Security**: Secure JWT handling with refresh tokens

### Compliance
- **GDPR**: Right to deletion and data portability
- **Data Retention**: Automated PII cleanup after DV cycle
- **Audit Requirements**: Comprehensive action logging
- **Legal Disclaimers**: Clear terms and government non-affiliation

### Monitoring
- **Security Events**: Failed login attempts and access violations
- **Data Access**: All data queries and modifications logged
- **File Access**: Photo access and download tracking
- **Admin Actions**: Complete audit trail of administrative operations

## Performance Optimization

### Database Optimization
- **Indexing**: Strategic indexes on frequently queried fields
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized Prisma queries with proper relations

### File Storage Optimization
- **CDN**: Supabase CDN for static assets
- **Image Optimization**: Automatic resizing and compression
- **Caching**: Signed URL caching with appropriate TTL

### Frontend Optimization
- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Strategic use of React Query or SWR
- **Bundle Optimization**: Tree shaking and minification

## Deployment and Infrastructure

### Environment Configuration
- **Development**: Local development with Supabase local setup
- **Staging**: Full Supabase integration for testing
- **Production**: Production Supabase project with monitoring

### CI/CD Pipeline
- **Testing**: Automated test suite execution
- **Security Scanning**: Dependency and code security checks
- **Database Migrations**: Automated Prisma migrations
- **Deployment**: Automated deployment to Vercel or similar platform

### Monitoring and Alerting
- **Application Monitoring**: Error tracking and performance monitoring
- **Database Monitoring**: Query performance and connection health
- **Security Monitoring**: Authentication failures and access violations
- **Business Metrics**: Application submission rates and payment success