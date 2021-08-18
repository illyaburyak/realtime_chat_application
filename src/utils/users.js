const users = []


// addUser, allows us to track user
const addUser = ({id, username, room}) => {
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required"
    }
  }

  // Check for existing user. User should be unique
  const existingUser = users.find((user) => {
    // this user needs to be in the same room, that person is trying to join
    return user.room === room && user.username === username
  })

  // Validate username,
  if (existingUser) {
    return {
      error: "Username is in use"
    }
  }

  // Store user
  const user = {id, username, room}
  users.push(user)

  // return user object,
  return {user}
}

// removeUser -> allows us to stop track a user when a user leaves, such as close chat room
const removeUser = (id) => {
  const idx = users.findIndex((user) => user.id === id)

  if (idx !== -1) {
    return users.splice(idx, 1)[0]
  }
}

// getUser -> allows us to fetch user's data
const getUser = (id) => {
  return users.find((user) => user.id === id)
}

// getUsersInRoom -> allows us to get complete list of all users in a specific room. Will help to render users to the side bar
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  return users.filter((user) => user.room === room)
}


module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
}