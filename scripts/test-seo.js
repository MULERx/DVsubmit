#!/usr/bin/env node

/**
 * Simple SEO testing script for DVSubmit
 * Run with: node scripts/test-seo.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const testPages = [
  '/',
  '/terms',
  '/privacy',
  '/help',
  '/sitemap.xml',
  '/robots.txt'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function testSEO() {
  console.log('🔍 Testing SEO implementation for DVSubmit\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const path of testPages) {
    const url = `${BASE_URL}${path}`;
    
    try {
      console.log(`Testing: ${path}`);
      const response = await makeRequest(url);
      
      if (response.status === 200) {
        console.log(`✅ ${path} - Status: ${response.status}`);
        
        // Check for basic SEO elements
        if (path.endsWith('.xml') || path.endsWith('.txt')) {
          console.log(`   📄 Content-Type: ${response.headers['content-type']}`);
        } else {
          // Check HTML content
          const hasTitle = response.body.includes('<title>');
          const hasMetaDesc = response.body.includes('name="description"');
          const hasOG = response.body.includes('property="og:');
          const hasStructuredData = response.body.includes('application/ld+json');
          
          console.log(`   📝 Title: ${hasTitle ? '✅' : '❌'}`);
          console.log(`   📝 Meta Description: ${hasMetaDesc ? '✅' : '❌'}`);
          console.log(`   📝 Open Graph: ${hasOG ? '✅' : '❌'}`);
          console.log(`   📝 Structured Data: ${hasStructuredData ? '✅' : '❌'}`);
        }
      } else {
        console.log(`❌ ${path} - Status: ${response.status}`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`❌ ${path} - Error: ${error.message}\n`);
    }
  }

  console.log('🎯 SEO Test Summary:');
  console.log('- Make sure your development server is running');
  console.log('- Check that all pages return 200 status');
  console.log('- Verify SEO elements are present');
  console.log('- Test sitemap.xml and robots.txt accessibility');
  console.log('\n📚 Next steps:');
  console.log('1. Set up Google Search Console');
  console.log('2. Submit sitemap to search engines');
  console.log('3. Monitor SEO performance');
}

testSEO().catch(console.error);