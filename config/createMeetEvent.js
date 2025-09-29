import { getCalendarClient } from "./googleAuth.js";

export async function createMeetEvent({
  summary,
  description,
  startTime,
  endTime,
  attendees,
}) {
  const calendar = await getCalendarClient();

  const event = {
    summary,
    description,
    start: {
      dateTime: startTime,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: endTime,
      timeZone: "Asia/Kolkata",
    },
    attendees: attendees.map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: "req-" + Date.now(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  return {
    meetLink: response.data.hangoutLink,
    eventId: response.data.id,
  };
}
