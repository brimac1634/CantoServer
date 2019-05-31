class CustomError extends Error {
  constructor() {
    super()
    this.isCustom = true
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        title: this.title,
        message: this.message,
      }
    }
  }
}

class ValidationError extends CustomError {
  constructor(message = 'The information you have entered does not match our records.') {
    super(message)
    this.name = 'ValidationError'
    this.title = 'Invalid Credentials'
    this.message = message
    this.toJSON()
  }
}

class NameNotProvided extends CustomError {
  constructor(message = 'You must provide your full name in order to register.') {
    super(message)
    this.name = 'NameNotProvided'
    this.title = 'Name Not Provided'
    this.message = message
    this.toJSON()
  }
}

class UserNotFound extends CustomError {
  constructor(message = 'No profile was found under this email address.') {
    super(message)
    this.name = 'UserNotFound'
    this.title = 'User Not Found'
    this.message = message
    this.toJSON()
  }
}

class EmailNotRegistered extends CustomError {
  constructor(message = 'This email address has not been registered.') {
    super(message)
    this.name = 'EmailNotRegistered'
    this.title = 'Email Not Registered'
    this.message = message
    this.toJSON()
  }
}

class RegistrationIncomplete extends CustomError {
  constructor(message = 'Your email address has not been confirmed and therefore your registration is incomplete.') {
    super(message)
    this.name = 'RegistrationIncomplete'
    this.title = 'Email Unconfirmed'
    this.message = message
    this.toJSON()
  }
}

class ServerError extends CustomError {
  constructor(message = 'It appears there was an error with our server. Please try again shortly.') {
    super(message)
    this.name = 'ServerError'
    this.title = 'Server Error'
    this.message = message
    this.toJSON()
  }
}

class EmailError extends CustomError {
  constructor(message = 'Oops! There was an error with completing the email request. Please try again shortly.') {
    super(message)
    this.name = 'EmailError'
    this.title = 'Email Failed'
    this.message = message
    this.toJSON()
  }
}

class PasswordTokenExpired extends CustomError {
  constructor(message = 'Your reset password token has expired') {
    super(message)
    this.name = 'PasswordTokenExpired'
    this.title = 'Link Expired'
    this.message = message
    this.toJSON()
  }
}

module.exports = {
  ValidationError,
  NameNotProvided,
  RegistrationIncomplete,
  UserNotFound,
  PasswordTokenExpired,
  EmailNotRegistered,
  ServerError,
  EmailError
}