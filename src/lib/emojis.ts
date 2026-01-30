// Emoji Management System for Personalization

export interface EmojiConfig {
  backHomeEmojis: string[]
  heroEmoji: string
  supportEmojis: string[]
}

// Default emoji configuration
export const defaultEmojiConfig: EmojiConfig = {
  backHomeEmojis: ['😊', '😜', '😮‍💨', '🤠', '🥹', '💆‍♀️', '💋', '👄', '🐛'],
  heroEmoji: '💁‍♀️',
  supportEmojis: ['💝', '💖', '💕', '🥰', '😘']
}

// Current emoji configuration (can be updated by admin)
let currentEmojiConfig: EmojiConfig = { ...defaultEmojiConfig }

// Get a random emoji from the back home collection
export const getRandomBackHomeEmoji = (): string => {
  const emojis = currentEmojiConfig.backHomeEmojis
  return emojis[Math.floor(Math.random() * emojis.length)]
}

// Get the hero emoji
export const getHeroEmoji = (): string => {
  return currentEmojiConfig.heroEmoji
}

// Get the full hero title with emoji
export const getHeroTitle = (): string => {
  return `Hey, it's Lahra ${currentEmojiConfig.heroEmoji}`
}

// Get a random support emoji
export const getRandomSupportEmoji = (): string => {
  const emojis = currentEmojiConfig.supportEmojis
  return emojis[Math.floor(Math.random() * emojis.length)]
}

// Update emoji configuration (admin function)
export const updateEmojiConfig = (newConfig: Partial<EmojiConfig>): void => {
  currentEmojiConfig = { ...currentEmojiConfig, ...newConfig }
  
  // In a real app, this would save to database
  console.log('Emoji config updated:', currentEmojiConfig)
}

// Get current emoji configuration
export const getCurrentEmojiConfig = (): EmojiConfig => {
  return { ...currentEmojiConfig }
}

// Preset emoji collections for easy selection
export const emojiPresets = {
  playful: ['😊', '😜', '🤪', '😋', '🥳', '🤗', '😘', '🥰', '😍'],
  sophisticated: ['😌', '💅', '💋', '👄', '💆‍♀️', '🥂', '✨', '💎', '🌟'],
  fun: ['🤠', '🥹', '😮‍💨', '🤭', '🫣', '🤫', '🤔', '🙃', '😏'],
  nature: ['🌸', '🌺', '🦋', '🌿', '🌙', '⭐', '🌈', '🐛', '🌻'],
  classic: ['😊', '😘', '🥰', '😍', '💕', '💖', '💝', '🌹', '✨']
}

// Validate emoji (comprehensive check)
export const isValidEmoji = (emoji: string): boolean => {
  if (!emoji || emoji.length === 0) return false
  
  // More comprehensive emoji regex that handles complex emojis, skin tones, and ZWJ sequences
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji}\u200D)*$/u
  
  // Alternative fallback regex for broader emoji support
  const fallbackRegex = /^[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{200D}\u{FE0F}\u{20E3}]+$/u
  
  // Check length (allow up to 11 characters for complex emojis with ZWJ sequences)
  if (emoji.length > 11) return false
  
  // Try the comprehensive regex first, then fallback
  return emojiRegex.test(emoji) || fallbackRegex.test(emoji)
}