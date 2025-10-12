#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Get the current directory
const projectRoot = process.cwd()
const envPath = path.join(projectRoot, '.env')

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found')
  process.exit(1)
}

// Read current .env
const envContent = fs.readFileSync(envPath, 'utf8')

// Get current NEXT_PUBLIC_APP_URL
const currentUrlMatch = envContent.match(/NEXT_PUBLIC_APP_URL=(.+)/)
const currentUrl = currentUrlMatch ? currentUrlMatch[1] : 'not found'

console.log('🔍 Current NEXT_PUBLIC_APP_URL:', currentUrl)

// Common development URLs to check
const commonUrls = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3000'
]

console.log('\n📋 Common development URLs:')
commonUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`)
})

console.log('\n🔧 To fix the password reset issue:')
console.log('1. Make sure you\'re accessing your app at the same URL as NEXT_PUBLIC_APP_URL')
console.log('2. Or update NEXT_PUBLIC_APP_URL to match your actual URL')
console.log('3. Restart your development server after making changes')

console.log('\n📝 Manual fix:')
console.log('Edit your .env file and update:')
console.log('NEXT_PUBLIC_APP_URL=http://localhost:YOUR_ACTUAL_PORT')

console.log('\n🌐 For production:')
console.log('NEXT_PUBLIC_APP_URL=https://yourdomain.com')

console.log('\n⚠️  Don\'t forget to update Supabase Dashboard:')
console.log('Authentication → URL Configuration → Redirect URLs')
console.log('Add: YOUR_APP_URL/auth/reset-password')
console.log('Add: YOUR_APP_URL/auth/callback')