// Test TypeScript type resolution in ESM environment
import {
  SavantClient as ClientClass,
  getCustomToolDefinition,
} from '@savant-code/sdk'
import * as FullSDK from '@savant-code/sdk'
;

import type {
  SavantClient,
  CustomToolDefinition,
  RunState,
} from '@savant-code/sdk'
(async () => {
  // Test 1: Type imports work correctly
  const testClient: SavantClient = {} as any
  const testTool: CustomToolDefinition = {} as any
  const testState: RunState = {} as any

  console.log('âœ… Type imports successful')

  // Test 2: Value imports work correctly in TypeScript
  const clientConstructor = ClientClass
  const toolDefFunction = getCustomToolDefinition

  console.log(
    'âœ… Value imports successful:',
    typeof clientConstructor,
    typeof toolDefFunction,
  )

  // Test 3: Test actual instantiation would work (without requiring API key)
  type ClientOptions = ConstructorParameters<typeof ClientClass>[0]

  const mockOptions: ClientOptions = {
    apiKey: 'test-key',
  }

  // This should compile without errors
  const mockClient = new ClientClass(mockOptions)

  console.log('âœ… Client instantiation types work correctly')

  // Test 4: Custom tool definition types (compile-time only)
  type MockTool = ReturnType<typeof getCustomToolDefinition>
  const toolTypeTest: MockTool = {} as any

  console.log('âœ… Custom tool definition types work correctly')

  // Test 5: Dynamic imports also work in TypeScript ESM
  const dynamicSDK = await import('@savant-code/sdk')
  const ClientFromDynamic: typeof ClientClass = dynamicSDK.SavantClient
  console.log('âœ… Dynamic imports work in TypeScript ESM')

  // Test 6: Namespace imports work
  const ClientFromNamespace: typeof ClientClass = FullSDK.SavantClient
  console.log('âœ… Namespace imports work correctly')
})()

export {} // Make this a module
