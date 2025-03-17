import cron from 'node-cron';
import { RefreshTokenModel } from 'src/models/Auth';

// This cron job will run every hour and delete all refresh tokens that have expired and were updated more than 6 hours ago
cron.schedule('0 * * * *', async () => {
    try {
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

        const result = await RefreshTokenModel.deleteMany({
            expiresAt: { $lt: new Date() },
            updatedAt: { $lt: sixHoursAgo },
        });

        console.log(`Cleaned up ${result.deletedCount} expired refresh tokens`);
    } catch (error) {
        console.error('Error cleaning up refresh tokens:', error);
    }
});
