const User = require('../models/User');

/**
 * Seed Default Admin User if no admin exists in MongoDB database.
 * Credentials:
 *   Email: admin@legalmind.ai
 *   Password: Admin@LegalMind2026
 *   Role: admin
 */
const seedAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount === 0) {
      console.log('[SeedAdmin] No admin account found. Creating default seed admin user...');

      const defaultAdmin = new User({
        name: 'System Super Admin',
        email: 'admin@legalmind.ai',
        password: 'Admin@LegalMind2026',
        role: 'admin',
        organization: 'LegalMind Enterprise Headquarters',
        isVerified: true,
        preferences: {
          notifications: true,
          theme: 'dark',
          aiModel: 'legalmind-rag-v1',
        },
      });

      await defaultAdmin.save();

      console.log('[SeedAdmin] Default Seed Admin created successfully!');
      console.log('[SeedAdmin] Credentials -> Email: admin@legalmind.ai | Password: Admin@LegalMind2026');
    } else {
      console.log(`[SeedAdmin] Verified ${adminCount} existing admin account(s) in database.`);
    }
  } catch (error) {
    console.error(`[SeedAdmin Error]: ${error.message}`);
  }
};

module.exports = seedAdmin;
