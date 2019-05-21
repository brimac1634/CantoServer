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

class EmailNotRegistered extends CustomError {
  constructor(message = 'This email address has not been registered.') {
    super(message)
    this.name = 'EmailNotRegistered'
    this.message = message
    this.toJSON()
  }
}

class EmailTakenError extends CustomError {
  constructor(message = 'This email address has already been registered') {
    super(message)
    this.name = 'EmailTakenError'
    this.message = message
    this.toJSON()
  }
}

class ServerError extends CustomError {
  constructor(message = 'There was an error with the server') {
    super(message)
    this.name = 'ServerError'
    this.message = message
    this.toJSON()
  }
}

class EmailError extends CustomError {
  constructor(message = 'There was an error with completing the email request') {
    super(message)
    this.name = 'EmailError'
    this.message = message
    this.toJSON()
  }
}

module.exports = {
  ValidationError,
  EmailNotRegistered,
  EmailTakenError,
  ServerError,
  EmailError
}