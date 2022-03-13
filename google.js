const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

oAuth2Client.setCredentials({
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN
});

const calendar = google.calendar ({version: 'v3', auth: oAuth2Client})

async function viewCalendar(calendarId) {
    const res = await calendar.calendars.get({
        calendarId: calendarId
    });
    
    console.log(res.data);
};

async function viewEventsToday() {
    const res = await calendar.events.list({
        calendarId: '2s5p6fl194vtq7ulk0951r2q9s@group.calendar.google.com'
    });

    console.log(res.data);
}

async function listCalendars() {
    const res = await calendar.calendarList.list();
    const calendarItems = res.data.items;
    for (let i = 0; i < calendarItems.length; i++){
        console.log(i+1, calendarItems[i].summary, "\n  >", calendarItems[i].id);
    };
}

async function addCalendar(calendarId){
    const res = calendar.calendarList.insert({
        "colorRgbFormat": false,
      "resource": {
        "id": calendarId
      }
    });

    console.log(res.data);
}

async function createCalendar(title){
    const res = await calendar.calendars.insert({
        requestBody:{
            summary: title
        }
    })

    console.log('Successfully created calendar with title ', res.data.summary);
}

async function addEvent(title, timeEnd, timeStart, date)

createCalendar("create test");