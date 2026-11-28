const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runAuthTests() {
  const testEmail = `test-user-${Date.now()}@example.com`;
  const testPassword = "Password123!";

  console.log(`\n--- TEST 1: Sign Up New User: ${testEmail} ---`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Test User"
        }
      }
    });

    if (error) {
      console.error("Sign up error:", error.message);
    } else {
      console.log("Sign up success!");
      console.log("User ID:", data.user?.id);
      console.log("Identities Length:", data.user?.identities?.length);
      console.log("Session exists:", !!data.session);
    }
  } catch (err) {
    console.error("Unexpected error in Sign Up:", err);
  }

  console.log(`\n--- TEST 2: Sign Up Existing User ---`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.log("Sign up correctly failed with error:", error.message);
    } else {
      console.log("Sign up returned success status.");
      const isDuplicate = data.user && (!data.user.identities || data.user.identities.length === 0);
      console.log("User ID:", data.user?.id);
      console.log("Identities Length:", data.user?.identities?.length);
      console.log("Detected duplicate email:", isDuplicate);
      if (isDuplicate) {
        console.log("SUCCESS: Correctly identified duplicate signup via empty identities array.");
      } else {
        console.error("FAILURE: Duplicate signup was not flagged via identities check.");
      }
    }
  } catch (err) {
    console.error("Unexpected error in duplicate Sign Up:", err);
  }

  console.log(`\n--- TEST 3: Forgot Password for ${testEmail} ---`);
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:3000/'
    });

    if (error) {
      console.error("Forgot password error:", error.message);
    } else {
      console.log("Forgot password success! Reset link triggered.");
    }
  } catch (err) {
    console.error("Unexpected error in Forgot Password:", err);
  }

  console.log("\nAuth flow API testing completed.");
}

runAuthTests();
