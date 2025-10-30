const crypto = require('crypto');

// Generate a secure random secret for NextAuth
const secret = crypto.randomBytes(32).toString('hex');

console.log('Generated NextAuth Secret:');
console.log('==========================');
console.log(secret);
console.log('');
console.log('Add this to your environment variables:');
console.log(`NEXTAUTH_SECRET=${secret}`);
console.log('');
console.log('For Vercel deployment, add this in Project Settings > Environment Variables');