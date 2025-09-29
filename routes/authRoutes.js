import express from 'express';
import googleCalendarService from '../services/googleCalendarService.js';

const router = express.Router();

// Get Google OAuth URL (for initial setup)
router.get('/google/setup', (req, res) => {
  try {
    const authUrl = googleCalendarService.generateAuthUrl();
    res.json({ 
      success: true, 
      authUrl,
      message: 'Visit this URL to authorize Google Calendar access'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Handle Google OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Authorization code not provided' 
      });
    }

    const tokens = await googleCalendarService.getTokens(code);
    
    console.log('=== GOOGLE TOKENS RECEIVED ===');
    console.log('Add this to your .env file:');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log('============================');
    
    res.send(`
      <h2>Google Calendar Connected Successfully!</h2>
      <p>Copy this refresh token to your .env file:</p>
      <code style="background: #f0f0f0; padding: 10px; display: block; margin: 10px 0;">
        GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"
      </code>
      <p>Then restart your server.</p>
    `);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test Google Calendar connection
router.get('/google/test', async (req, res) => {
  try {
    // Test by creating a simple event
    const testEvent = {
      summary: 'Test Event - Info Tech India',
      description: 'This is a test event to verify Google Calendar integration',
      startDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      endDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      attendeeEmails: [process.env.ADMIN_EMAIL],
    };

    const result = await googleCalendarService.createMeetEvent(testEvent);
    
    res.json({
      success: true,
      message: 'Google Calendar integration working!',
      meetLink: result.meetLink,
      eventId: result.eventId
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Google Calendar test failed: ${error.message}` 
    });
  }
});

export default router;