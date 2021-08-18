const timeFormat = require('moment')


const userTime = timeFormat(new Date().getTime()).format('LTS')

const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: userTime
  }
}

const generateLocationAndTime = (username, location) => {
  return {
    username,
    location,
    locationCreatedAt: userTime
  }
}


module.exports = {
  generateMessage,
  generateLocationAndTime
}