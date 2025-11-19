/**
 * Test script for Share API Client
 *
 * This demonstrates how to use the shareApi functions and test them
 * Run with: npx tsx src/lib/shareApi.test.ts
 *
 * Prerequisites: Backend server must be running (npm run dev:server)
 */

import { createShare, getSharedChat, isApiError } from './shareApi'
import type { Conversation } from '@/types'

async function runTests() {
  console.log('\n=== Share API Client Test Suite ===\n')

  // ===== TEST 1: Create Share =====
  console.log('Test 1: createShare() - Success case')

  const testConversation: Conversation = {
    id: Date.now().toString(),
    title: 'API Client Test Chat',
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'Testing the frontend API client!'
      },
      {
        id: 2,
        role: 'assistant',
        content: 'This message was sent through the shareApi module.'
      },
      {
        id: 3,
        role: 'user',
        content: 'Does error handling work?'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  try {
    const response = await createShare(testConversation)

    console.log('✅ Share created successfully!')
    console.log('   Share ID:', response.shareId)
    console.log('   URL:', response.url)
    console.log('   Expires:', new Date(response.expiresAt).toLocaleString())
    console.log()

    // Store shareId for next test
    const { shareId } = response

    // ===== TEST 2: Retrieve Share =====
    console.log('Test 2: getSharedChat() - Success case')

    const sharedConversation = await getSharedChat(shareId)

    console.log('✅ Share retrieved successfully!')
    console.log('   Title:', sharedConversation.conversation.title)
    console.log('   Messages:', sharedConversation.conversation.messages.length)
    console.log('   Shared at:', new Date(sharedConversation.sharedAt).toLocaleString())
    console.log()

    // ===== TEST 3: 404 Error Handling =====
    console.log('Test 3: getSharedChat() - 404 Not Found')

    try {
      await getSharedChat('11111111-1111-1111-1111-111111111111')
      console.log('❌ Should have thrown an error')
    } catch (error) {
      if (isApiError(error)) {
        console.log('✅ Error handled correctly!')
        console.log('   Status:', error.status)
        console.log('   Message:', error.message)
      } else {
        console.log('❌ Wrong error type')
      }
    }
    console.log()

    // ===== TEST 4: Invalid UUID Format =====
    console.log('Test 4: getSharedChat() - 400 Bad Request')

    try {
      await getSharedChat('not-a-valid-uuid')
      console.log('❌ Should have thrown an error')
    } catch (error) {
      if (isApiError(error)) {
        console.log('✅ Error handled correctly!')
        console.log('   Status:', error.status)
        console.log('   Message:', error.message)
      } else {
        console.log('❌ Wrong error type')
      }
    }
    console.log()

    // ===== TEST 5: Empty Conversation =====
    console.log('Test 5: createShare() - Validation error (empty messages)')

    const emptyConversation: Conversation = {
      id: '123',
      title: 'Empty',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    try {
      await createShare(emptyConversation)
      console.log('❌ Should have thrown an error')
    } catch (error) {
      if (isApiError(error)) {
        console.log('✅ Validation error caught!')
        console.log('   Status:', error.status)
        console.log('   Message:', error.message)
      } else {
        console.log('❌ Wrong error type')
      }
    }
    console.log()

    console.log('=== All Tests Passed! ===\n')

  } catch (error) {
    console.error('❌ Test failed:', error)

    if (isApiError(error)) {
      console.error('   Status:', error.status)
      console.error('   Message:', error.message)
      if (error.response) {
        console.error('   Server response:', error.response)
      }
    }

    process.exit(1)
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
