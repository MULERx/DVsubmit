import { NextRequest, NextResponse } from 'next/server'
import { serverPhotoStorageService } from '@/lib/services/photo-storage'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { path } = await request.json()

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Photo path is required' },
        { status: 400 }
      )
    }


    // Find applications that reference this photo path
    const applicationsWithPhoto = await prisma.application.findMany({
      where: {
        userId: userWithRole.dbUser.id,
        OR: [
          { photoUrl: path },
          { spousePhotoUrl: path }
        ]
      }
    })

    // Find children that reference this photo path
    const childrenWithPhoto = await prisma.child.findMany({
      where: {
        photoUrl: path,
        application: {
          userId: userWithRole.dbUser.id
        }
      },
      include: {
        application: true
      }
    })

    // Delete the photo from storage
    const result = await serverPhotoStorageService.deletePhoto(path)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete photo' },
        { status: 500 }
      )
    }

    // Update applications to remove photo references
    const updatePromises = []

    // Update main application photos
    for (const application of applicationsWithPhoto) {
      const updateData: any = { updatedAt: new Date() }

      if (application.photoUrl === path) {
        updateData.photoUrl = null
      }
      if (application.spousePhotoUrl === path) {
        updateData.spousePhotoUrl = null
      }

      updatePromises.push(
        prisma.application.update({
          where: { id: application.id },
          data: updateData
        })
      )

      // Create audit log
      updatePromises.push(
        prisma.auditLog.create({
          data: {
            userId: userWithRole.dbUser.id,
            applicationId: application.id,
            action: 'PHOTO_DELETED',
            details: {
              photoPath: path,
              photoType: application.photoUrl === path ? 'main' : 'spouse',
              timestamp: new Date().toISOString(),
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })
      )
    }

    // Update children photos
    for (const child of childrenWithPhoto) {
      updatePromises.push(
        prisma.child.update({
          where: { id: child.id },
          data: {
            photoUrl: null,
            updatedAt: new Date()
          }
        })
      )

      // Create audit log
      updatePromises.push(
        prisma.auditLog.create({
          data: {
            userId: userWithRole.dbUser.id,
            applicationId: child.application.id,
            action: 'CHILD_PHOTO_DELETED',
            details: {
              photoPath: path,
              childId: child.id,
              childName: `${child.givenName} ${child.familyName}`,
              timestamp: new Date().toISOString(),
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })
      )
    }

    // Execute all database updates
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        updatedApplications: applicationsWithPhoto.length,
        updatedChildren: childrenWithPhoto.length
      }
    })

  } catch (error) {
    console.error('Delete photo API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}