import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set refresh token if available
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Generate auth URL for initial setup
  generateAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange code for tokens
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  // Create Google Meet event
  async createMeetEvent(eventDetails) {
    try {
      const {
        summary,
        description,
        startDateTime,
        endDateTime,
        attendeeEmails = [],
        timeZone = 'Asia/Kolkata'
      } = eventDetails;

      // Ensure we have valid credentials
      await this.refreshAccessTokenIfNeeded();

      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timeZone,
        },
        attendees: attendeeEmails.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });

      return {
        success: true,
        eventId: response.data.id,
        meetLink: response.data.hangoutLink,
        eventLink: response.data.htmlLink,
        eventData: response.data
      };

    } catch (error) {
      console.error('Error creating Google Meet event:', error);
      
      if (error.code === 401) {
        throw new Error('Google Calendar authentication failed. Please re-authenticate.');
      } else if (error.code === 403) {
        throw new Error('Insufficient permissions to create calendar events.');
      }
      
      throw new Error(`Failed to create Google Meet event: ${error.message}`);
    }
  }

  // Refresh access token if needed
  async refreshAccessTokenIfNeeded() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  // Delete event
  async deleteEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }
}

export default new GoogleCalendarService();