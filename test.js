// test.js - Test your API endpoints

async function testAPI() {
  console.log('🧪 Starting API tests...\n');

  // Test 1: Health check
  console.log('📡 Test 1: Health Check');
  try {
    const health = await fetch('http://localhost:5000/health');
    const healthData = await health.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  console.log('');

  // Test 2: Register a user
  console.log('📝 Test 2: Register User');
  try {
    const register = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
        phone: '0780000000'
      })
    });
    const registerData = await register.json();
    if (registerData.success) {
      console.log('✅ Registration successful!');
      console.log('   User:', registerData.user.name);
      console.log('   Email:', registerData.user.email);
      console.log('   Token:', registerData.token.substring(0, 50) + '...');
    } else {
      console.log('❌ Registration failed:', registerData.message);
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }
  console.log('');

  // Test 3: Login
  console.log('🔐 Test 3: Login');
  try {
    const login = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@example.com',
        password: '123456'
      })
    });
    const loginData = await login.json();
    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log('   Welcome:', loginData.user.name);
      console.log('   Token:', loginData.token.substring(0, 50) + '...');
      
      // Test 4: Get current user with token
      console.log('\n👤 Test 4: Get Current User');
      const me = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      const meData = await me.json();
      if (meData.success) {
        console.log('✅ Got user info!');
        console.log('   Name:', meData.user.name);
        console.log('   Email:', meData.user.email);
        console.log('   Role:', meData.user.role);
      } else {
        console.log('❌ Failed to get user:', meData.message);
      }
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
  console.log('\n✨ API tests completed!');
}

// Run the tests
testAPI();