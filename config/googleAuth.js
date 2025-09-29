import { google } from "googleapis";
import { readFileSync } from "fs";

export async function getCalendarClient() {
  // if using service account
  const credentials = JSON.parse(readFileSync("service-account.json"));

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/calendar"]
  );

  await auth.authorize();
  return google.calendar({ version: "v3", auth });
}
