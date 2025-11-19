/**
 * Test script for Mock KV
 *
 * This demonstrates how to use the KV store and verifies it works correctly.
 * Run with: node --loader ts-node/esm lib/kv-test.ts
 * Or simpler: npx tsx lib/kv-test.ts
 */

import { kv } from './kv-mock'

async function runTests() {
  console.log('\n=== Mock KV Test Suite ===\n')

  // Test 1: Basic SET and GET
  console.log('Test 1: Basic SET and GET')
  await kv.set('test:hello', 'world')
  const value = await kv.get('test:hello')
  console.log(`✓ Expected: "world", Got: "${value}"\n`)

  // Test 2: JSON storage (objects)
  console.log('Test 2: JSON object storage')
  const user = { id: 123, name: 'Alice', email: 'alice@example.com' }
  await kv.set('user:123', user)
  const retrievedUser = await kv.get('user:123')
  console.log(`✓ Stored:`, user)
  console.log(`✓ Retrieved:`, retrievedUser)
  console.log()

  // Test 3: Expiration (TTL)
  console.log('Test 3: Expiration (short TTL)')
  await kv.set('test:expiring', 'this will expire', { ex: 2 }) // 2 seconds
  console.log('Stored with 2-second TTL')

  const beforeExpiry = await kv.get('test:expiring')
  console.log(`✓ Before expiry: "${beforeExpiry}"`)

  console.log('Waiting 3 seconds for expiration...')
  await sleep(3000)

  const afterExpiry = await kv.get('test:expiring')
  console.log(`✓ After expiry: ${afterExpiry} (should be null)\n`)

  // Test 4: DELETE
  console.log('Test 4: DELETE operation')
  await kv.set('test:delete-me', 'temporary data')
  console.log('Created key: test:delete-me')

  const deleted = await kv.del('test:delete-me')
  console.log(`✓ Deleted ${deleted} key(s)`)

  const afterDelete = await kv.get('test:delete-me')
  console.log(`✓ After delete: ${afterDelete} (should be null)\n`)

  // Test 5: EXISTS
  console.log('Test 5: EXISTS check')
  await kv.set('test:exists', 'I exist!')
  const exists = await kv.exists('test:exists', 'test:does-not-exist')
  console.log(`✓ Exists check: ${exists} (should be 1)\n`)

  // Test 6: TTL command
  console.log('Test 6: TTL command')
  await kv.set('test:ttl', 'expires soon', { ex: 3600 }) // 1 hour
  const ttl = await kv.ttl('test:ttl')
  console.log(`✓ TTL: ${ttl} seconds (should be ~3600)\n`)

  // Test 7: KEYS pattern matching
  console.log('Test 7: KEYS pattern matching')
  await kv.set('share:abc123', { data: 'chat 1' })
  await kv.set('share:xyz789', { data: 'chat 2' })
  await kv.set('user:456', { data: 'user' })

  const shareKeys = await kv.keys('share:*')
  console.log(`✓ Keys matching "share:*":`, shareKeys)
  console.log()

  // Test 8: Stats
  console.log('Test 8: Database statistics')
  const stats = await kv.stats()
  console.log(`✓ Total keys: ${stats.totalKeys}`)
  console.log(`✓ Active keys: ${stats.activeKeys}`)
  console.log(`✓ Expired keys: ${stats.expiredKeys}\n`)

  // Test 9: Real-world simulation (shared chat)
  console.log('Test 9: Simulating shared chat storage')
  const sharedChat = {
    conversation: {
      id: '1704067200000',
      title: 'Test Chat',
      messages: [
        { id: 1, role: 'user' as const, content: 'Hello!' },
        { id: 2, role: 'assistant' as const, content: 'Hi there!' }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    sharedAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  }

  const shareId = 'abc123-def456-ghi789'
  const ttlSeconds = 30 * 24 * 60 * 60 // 30 days in seconds

  await kv.set(`share:${shareId}`, sharedChat, { ex: ttlSeconds })
  console.log(`✓ Stored shared chat with ID: ${shareId}`)

  const retrieved = await kv.get(`share:${shareId}`)
  console.log(`✓ Retrieved conversation title: "${retrieved.conversation.title}"`)
  console.log(`✓ Message count: ${retrieved.conversation.messages.length}`)

  const shareTTL = await kv.ttl(`share:${shareId}`)
  console.log(`✓ Time until expiration: ${Math.floor(shareTTL / 86400)} days\n`)

  // Cleanup
  console.log('Cleanup: Flushing all data')
  await kv.flushall()
  console.log('✓ All data cleared\n')

  console.log('=== All Tests Passed! ===\n')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Run tests
runTests().catch(console.error)
