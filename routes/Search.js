const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
    if (req.body.search) {
        const search = req.body.search.toUpperCase();
        const groupIdsUrl = 'https://tahvel.edu.ee/hois_back/timetables/group/14?lang=ET';
        const groupByName = {};
        const roomRegex = /^[a-zA-Z](?!000)[0-9]{3}$/;
        if (search.match(roomRegex)) {
          return res.redirect(`/${search[0]}/${search[1]}?room=${search}`);
        }
    
        const searchedGroupId = search;
        https.get(groupIdsUrl, (response) => {
          let data = '';
    
          response.on('data', (chunk) => {
            data += chunk;
          });
    
          response.on('end', () => {
            const responseObject = JSON.parse(data);
            const { content } = responseObject;
    
            content.forEach((group) => {
              const groupId = group.id;
              const groupNameEt = group.nameEt;
              const groupNameEn = group.nameEn;
    
              groupByName[groupNameEt] = groupId;
              if (!groupByName[groupNameEn]) {
                groupByName[groupNameEn] = groupId;
              }
            });
            if (groupByName[searchedGroupId]) {
              const date = new Date();
              date.setHours(0, 0, 0, 0);
    
              const dateToday = date.toISOString();
              date.setDate(date.getDate() + 7);
    
              const dateInWeek = date.toISOString();
    
              const timetableUrl = `https://tahvel.edu.ee/hois_back/timetableevents/timetableByGroup/14?from=${dateToday}&studentGroups=${groupByName[searchedGroupId]}&thru=${dateInWeek}`;
    
              https.get(timetableUrl, (response) => {
                let data = '';
    
                // A chunk of data has been received.
                response.on('data', (chunk) => {
                  data += chunk;
                });
    
                // The whole response has been received. Print out the result.
                response.on('end', () => {
                  const responseObject = JSON.parse(data);
                  const { timetableEvents } = responseObject;
    
                  const roomsByDay = {};
    
                  timetableEvents.forEach((event) => {
                    if (event.rooms && event.rooms.length > 0) {
                      const { timeStart } = event;
                      const { timeEnd } = event;
                      const { roomCode } = event.rooms[0];
                      const { date } = event;
    
                      if (!roomsByDay[date]) {
                        roomsByDay[date] = {};
                      }
    
                      if (!roomsByDay[date][timeStart]) {
                        roomsByDay[date][timeStart] = [];
                      }
    
                      roomsByDay[date][timeStart].push(roomCode);
                    }
                  });
    
                  Object.keys(roomsByDay).forEach((date) => {
                    const dateObject = roomsByDay[date];
                    const sortedTimes = Object.keys(dateObject).sort();
                    const sortedDateObject = {};
    
                    sortedTimes.forEach((time) => {
                      sortedDateObject[time] = dateObject[time];
                    });
    
                    roomsByDay[date] = sortedDateObject;
                  });
    
                  const sortedDates = Object.keys(roomsByDay).sort();
                  const sortedRoomsByDay = {};
    
                  sortedDates.forEach((date) => {
                    sortedRoomsByDay[date] = roomsByDay[date];
                  });
    
                  let dayData = [];
                  if (sortedRoomsByDay[dateToday]) {
                    dayData = sortedRoomsByDay[dateToday];
                  } else {
                    dayData = Object.values(sortedRoomsByDay)[0];
                  }
    
                  let nextRoom;
                  for (const time in dayData) {
                    const timeParts = time.split(':');
                    const hours = parseInt(timeParts[0], 10);
                    const minutes = parseInt(timeParts[1], 10);
    
                    const timeIndex = Object.keys(dayData).indexOf(time);
                    if (date.getHours() === hours && Math.abs(date.getMinutes() - minutes) <= 15) {
                      nextRoom = dayData[time][0];
                      return res.redirect(`/${nextRoom[0]}/${nextRoom[1]}?room=${nextRoom}`);
                    }
                    if (date.getHours() < hours && date.getMinutes() === minutes) {
                      if (timeIndex < Object.keys(dayData).length - 1) {
                        nextRoom = Object.values(dayData)[timeIndex + 1][0];
                        return res.redirect(`/${nextRoom[0]}/${nextRoom[1]}?room=${nextRoom}`);
                      }
                    }
                  }
    
                  if (nextRoom == null) {
                    return res.redirect('?error=' + 'No next rooms');
                  }
                });
              }).on('error', (err) => res.redirect(`?error=${err.message}`));
            } else {
              return res.redirect('?error=' + 'Group not found');
            }
          });
        }).on('error', (err) => res.redirect(`?error=${err.message}`));
    } else {
        return res.redirect('?error=' + 'No search property');
    }
})

module.exports = router;