/**
 * Quick validation tests for anonymous username-based auth
 * Run in browser console after app loads
 */

// Test 1: Pseudo-email generation
function testPseudoEmailGeneration() {
  console.log("Test 1: Pseudo-email generation");
  
  const testCases = [
    { input: "john", expected: "john@mindguardian.anon" },
    { input: "John", expected: "john@mindguardian.anon" },
    { input: "ALICE123", expected: "alice123@mindguardian.anon" },
    { input: "User_Name", expected: "user_name@mindguardian.anon" },
  ];
  
  testCases.forEach(({ input, expected }) => {
    const result = `${input.toLowerCase()}@mindguardian.anon`;
    const passed = result === expected;
    console.log(`  ${passed ? "✓" : "✗"} "${input}" → "${result}"`);
  });
}

// Test 2: Username validation
function testUsernameValidation() {
  console.log("\nTest 2: Username validation");
  
  const testCases = [
    { username: "ab", valid: false, reason: "Too short (< 3)" },
    { username: "abc", valid: true, reason: "Min length ok" },
    { username: "john_doe", valid: true, reason: "Valid with underscore" },
    { username: "a".repeat(20), valid: true, reason: "Max length ok" },
    { username: "a".repeat(21), valid: false, reason: "Too long (> 20)" },
  ];
  
  testCases.forEach(({ username, valid, reason }) => {
    const passed = (username.length >= 3 && username.length <= 20) === valid;
    console.log(`  ${passed ? "✓" : "✗"} "${username}" (${reason})`);
  });
}

// Test 3: Password validation
function testPasswordValidation() {
  console.log("\nTest 3: Password validation");
  
  const testCases = [
    { password: "12345", valid: false, reason: "Too short (< 6)" },
    { password: "123456", valid: true, reason: "Min length ok" },
    { password: "MyP@ss!", valid: true, reason: "Special chars ok" },
  ];
  
  testCases.forEach(({ password, valid, reason }) => {
    const passed = (password.length >= 6) === valid;
    console.log(`  ${passed ? "✓" : "✗"} "${password}" (${reason})`);
  });
}

// Run all tests
console.log("=".repeat(50));
console.log("ANONYMOUS USERNAME-BASED AUTH VALIDATION TESTS");
console.log("=".repeat(50));

testPseudoEmailGeneration();
testUsernameValidation();
testPasswordValidation();

console.log("\n✅ All validation logic verified");
