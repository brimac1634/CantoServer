class CustomError extends Error {
  constructor() {
    super()
    this.isCustom = true
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
      }
    }
  }
}

class ValidationError extends CustomError {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.message = message
    this.toJSON()
  }
}
class DatabaseError extends CustomError {
  constructor(message = 'There was an error with the database') {
    super(message)
    this.name = 'DatabaseError'
    this.message = message
    this.toJSON()
  }
}
module.exports = {
  ValidationError,
  DatabaseError
}