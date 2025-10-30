const crypto = require('crypto');

// Generate secure random secret for NextAuth
const secret = crypto.randomBytes(32).toString('base64');

console.log('🔐 Generated NextAuth Secret:');
console.log(secret);
console.log('\n📝 Copy this secret to your .env.production file:');
console.log(`NEXTAUTH_SECRET=${secret}`);
console.log('\n⚠️  Keep this secret secure and never commit it to version control!');