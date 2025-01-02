type OptionGeneratePassword = {
  length?: number
  numbers?: boolean
  symbols?: boolean
  lowercase?: boolean
  uppercase?: boolean
}

const optionCharacters: Record<'lowercase' | 'uppercase' | 'numbers' | 'symbols', string> = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$&'
}

function getRandomCharacter(chars: string): string {
  const randomIndex = Math.floor(Math.random() * chars.length)
  return chars[randomIndex]
}

function shuffleString(text: string): string {
  return text
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

export const generateCustomPassword = (options: OptionGeneratePassword): string => {
  const { length = 12, ...selectedOptions } = options

  let characters = ''
  let password = ''

  Object.keys(selectedOptions).forEach((option) => {
    if (selectedOptions[option as keyof typeof selectedOptions]) {
      characters += optionCharacters[option as keyof typeof optionCharacters]
      password += getRandomCharacter(optionCharacters[option as keyof typeof optionCharacters])
    }
  })

  if (characters.length === 0) {
    throw new Error('At least one character type must be selected')
  }
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    password += characters[randomIndex]
  }
  password = shuffleString(password)
  return password
}
