/**
 * Color utilities for event booking visualization
 * Generates unique colors for different events within room-specific color spectrums
 * Room 1-21: Red spectrum (hue 0 ± 60°)
 * Room 1-17: Blue spectrum (hue 240 ± 60°)
 */

export interface EventColor {
  hue: number;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  lightBackground: string;
  hoverBackground: string;
}

export interface RoomColorScheme {
  roomId: string;
  roomName: string;
  baseHue: number;
  spectrumRange: number;
  primaryColor: string;
  description: string;
}

/**
 * Room color schemes configuration
 */
export const ROOM_COLOR_SCHEMES: Record<string, RoomColorScheme> = {
  '1-21': {
    roomId: '1-21',
    roomName: 'AES Learnet Room 1-21',
    baseHue: 0,        // Red
    spectrumRange: 60, // ±30 degrees (330-30)
    primaryColor: 'red',
    description: 'Red spectrum colors for Room 1-21'
  },
  '1-17': {
    roomId: '1-17',
    roomName: 'AES Learnet Room 1-17',
    baseHue: 240,      // Blue
    spectrumRange: 60, // ±30 degrees (210-270)
    primaryColor: 'blue',
    description: 'Blue spectrum colors for Room 1-17'
  }
};

/**
 * Generate a color within a room's specific color spectrum
 * @param hue HSL hue value (0-360)
 * @param saturation Saturation percentage (default: 70)
 * @param lightness Lightness percentage (default: 45)
 */
export const generateEventColor = (
  hue: number, 
  saturation: number = 70, 
  lightness: number = 45
): EventColor => {
  const normalizedHue = ((hue % 360) + 360) % 360;
  
  return {
    hue: normalizedHue,
    backgroundColor: `hsl(${normalizedHue}, ${saturation}%, ${lightness}%)`,
    borderColor: `hsl(${normalizedHue}, ${saturation + 10}%, ${lightness - 10}%)`,
    textColor: lightness > 50 ? '#1f2937' : '#ffffff',
    lightBackground: `hsl(${normalizedHue}, ${saturation - 40}%, ${lightness + 35}%)`,
    hoverBackground: `hsl(${normalizedHue}, ${saturation + 5}%, ${lightness + 10}%)`
  };
};

/**
 * Get room-specific preset colors
 * @param roomId Room identifier ('1-21' or '1-17')
 */
export const getRoomPresetColors = (roomId: string): EventColor[] => {
  const scheme = ROOM_COLOR_SCHEMES[roomId];
  if (!scheme) {
    throw new Error(`Unknown room ID: ${roomId}`);
  }

  const { baseHue, spectrumRange } = scheme;
  const halfRange = spectrumRange / 2;
  
  // Generate 10 evenly distributed hues within the room's spectrum
  const hues: number[] = [];
  for (let i = 0; i < 10; i++) {
    const offset = (i * spectrumRange / 9) - halfRange;
    const hue = ((baseHue + offset) % 360 + 360) % 360;
    hues.push(hue);
  }

  return hues.map(hue => generateEventColor(hue));
};

/**
 * Get predefined event colors for all rooms
 */
export const getAllPresetEventColors = (): Record<string, EventColor[]> => {
  const result: Record<string, EventColor[]> = {};
  
  Object.keys(ROOM_COLOR_SCHEMES).forEach(roomId => {
    result[roomId] = getRoomPresetColors(roomId);
  });
  
  return result;
};

/**
 * Generate a unique hue within a room's color spectrum
 * @param roomId Room identifier ('1-21' or '1-17')
 * @param existingHues Array of already used hue values
 * @param minDistance Minimum degrees between hues (default: 15)
 */
export const generateUniqueRoomHue = (
  roomId: string,
  existingHues: number[] = [], 
  minDistance: number = 15
): number => {
  const scheme = ROOM_COLOR_SCHEMES[roomId];
  if (!scheme) {
    throw new Error(`Unknown room ID: ${roomId}`);
  }

  const { baseHue, spectrumRange } = scheme;
  const halfRange = spectrumRange / 2;
  
  let attempts = 0;
  const maxAttempts = 50;
  const step = 5; // Generate hues in 5-degree increments

  while (attempts < maxAttempts) {
    // Generate random offset within spectrum range
    const offset = (Math.random() * spectrumRange) - halfRange;
    let newHue = ((baseHue + offset) % 360 + 360) % 360;
    
    // Round to nearest step for consistency
    newHue = Math.round(newHue / step) * step;
    newHue = ((newHue % 360) + 360) % 360;

    // Check if this hue is far enough from existing hues
    const isUnique = existingHues.every(existingHue => {
      const distance = Math.min(
        Math.abs(newHue - existingHue),
        360 - Math.abs(newHue - existingHue) // Handle wrap-around distance
      );
      return distance >= minDistance;
    });

    if (isUnique) {
      return newHue;
    }

    attempts++;
  }

  // Fallback: return base hue with small random offset
  const fallbackOffset = (Math.random() * 30) - 15; // ±15 degrees
  return ((baseHue + fallbackOffset) % 360 + 360) % 360;
};

/**
 * Generate a random unique hue (legacy function for backward compatibility)
 * @deprecated Use generateUniqueRoomHue instead
 */
export const generateUniqueRedHue = (
  existingHues: number[] = [], 
  minDistance: number = 10
): number => {
  return generateUniqueRoomHue('1-21', existingHues, minDistance);
};

/**
 * Convert hue to CSS custom properties for theming
 * @param hue HSL hue value
 * @param roomId Optional room ID for additional context
 */
export const hueToCSS = (hue: number, roomId?: string): Record<string, string> => {
  const color = generateEventColor(hue);
  
  const cssProps: Record<string, string> = {
    '--event-bg': color.backgroundColor,
    '--event-border': color.borderColor,
    '--event-text': color.textColor,
    '--event-light-bg': color.lightBackground,
    '--event-hover-bg': color.hoverBackground,
    '--event-hue': hue.toString(),
  };
  
  if (roomId && ROOM_COLOR_SCHEMES[roomId]) {
    const scheme = ROOM_COLOR_SCHEMES[roomId];
    cssProps['--room-primary'] = scheme.primaryColor;
    cssProps['--room-base-hue'] = scheme.baseHue.toString();
  }
  
  return cssProps;
};

/**
 * Get room-specific CSS variables
 * @param roomId Room identifier
 */
export const getRoomCSS = (roomId: string): Record<string, string> => {
  const scheme = ROOM_COLOR_SCHEMES[roomId];
  if (!scheme) {
    throw new Error(`Unknown room ID: ${roomId}`);
  }
  
  const baseColor = generateEventColor(scheme.baseHue);
  
  return {
    '--room-id': `"${roomId}"`,
    '--room-name': `"${scheme.roomName}"`,
    '--room-primary': scheme.primaryColor,
    '--room-base-hue': scheme.baseHue.toString(),
    '--room-base-bg': baseColor.backgroundColor,
    '--room-base-border': baseColor.borderColor,
    '--room-base-text': baseColor.textColor,
    '--room-base-light': baseColor.lightBackground,
  };
};

/**
 * Get event color class name based on room and hue
 * @param hue HSL hue value
 * @param roomId Room identifier
 */
export const getEventColorClass = (hue: number, roomId?: string): string => {
  const normalizedHue = ((hue % 360) + 360) % 360;
  
  // Room-specific classes
  if (roomId === '1-21') {
    // Red spectrum classes
    if (normalizedHue >= 345 || normalizedHue <= 15) return 'event-red-primary';
    if (normalizedHue >= 16 && normalizedHue <= 30) return 'event-red-orange';
    if (normalizedHue >= 315 && normalizedHue <= 344) return 'event-red-violet';
    return 'event-red-variant';
  }
  
  if (roomId === '1-17') {
    // Blue spectrum classes
    if (normalizedHue >= 225 && normalizedHue <= 255) return 'event-blue-primary';
    if (normalizedHue >= 210 && normalizedHue <= 224) return 'event-blue-cyan';
    if (normalizedHue >= 256 && normalizedHue <= 270) return 'event-blue-violet';
    return 'event-blue-variant';
  }
  
  // Fallback for unknown rooms
  if (normalizedHue >= 0 && normalizedHue <= 60) return 'event-warm';
  if (normalizedHue >= 180 && normalizedHue <= 300) return 'event-cool';
  return 'event-neutral';
};

/**
 * Get room color class
 * @param roomId Room identifier
 */
export const getRoomColorClass = (roomId: string): string => {
  const scheme = ROOM_COLOR_SCHEMES[roomId];
  if (!scheme) return 'room-unknown';
  
  return `room-${scheme.primaryColor}`;
};

/**
 * Lighten or darken a color by percentage
 * @param hue HSL hue value
 * @param lightnessDelta Percentage to adjust lightness (-100 to 100)
 * @param saturationDelta Optional saturation adjustment
 */
export const adjustEventColor = (
  hue: number, 
  lightnessDelta: number, 
  saturationDelta: number = 0
): EventColor => {
  const baseLightness = 45;
  const baseSaturation = 70;
  const newLightness = Math.max(10, Math.min(90, baseLightness + lightnessDelta));
  const newSaturation = Math.max(10, Math.min(100, baseSaturation + saturationDelta));
  return generateEventColor(hue, newSaturation, newLightness);
};

/**
 * Get accessible text color for a given background hue
 * @param hue HSL hue value
 * @param lightness Background lightness
 * @param saturation Background saturation
 */
export const getAccessibleTextColor = (
  hue: number, 
  lightness: number = 45, 
  saturation: number = 70
): string => {
  // Use WCAG contrast ratio guidelines
  // Higher saturation colors need higher lightness threshold
  const threshold = saturation > 60 ? 55 : 50;
  return lightness > threshold ? '#1f2937' : '#ffffff';
};

/**
 * Get contrast color for better visibility
 * @param hue HSL hue value
 * @param roomId Optional room context
 */
export const getContrastColor = (hue: number, roomId?: string): EventColor => {
  // Generate high contrast version
  const baseColor = generateEventColor(hue);
  const isLight = hue > 40 && hue < 200; // Rough light color detection
  
  if (isLight) {
    // For light colors, use darker variant
    return generateEventColor(hue, 80, 25);
  } else {
    // For dark colors, use lighter variant
    return generateEventColor(hue, 60, 75);
  }
};

/**
 * Get all available rooms and their color schemes
 */
export const getAllRoomSchemes = (): RoomColorScheme[] => {
  return Object.values(ROOM_COLOR_SCHEMES);
};

/**
 * Get room scheme by ID
 * @param roomId Room identifier
 */
export const getRoomScheme = (roomId: string): RoomColorScheme | null => {
  return ROOM_COLOR_SCHEMES[roomId] || null;
};

/**
 * Generate event color palette for theming
 * @param hue Primary hue value
 * @param roomId Optional room ID for context
 */
export const generateEventColorPalette = (hue: number, roomId?: string) => {
  return {
    primary: generateEventColor(hue, 70, 45),
    light: generateEventColor(hue, 30, 80),
    dark: generateEventColor(hue, 80, 30),
    muted: generateEventColor(hue, 40, 60),
    hover: generateEventColor(hue, 75, 55),
    active: generateEventColor(hue, 80, 40),
    roomContext: roomId ? ROOM_COLOR_SCHEMES[roomId] : null
  };
};

/**
 * Generate complete room color palette
 * @param roomId Room identifier
 */
export const generateRoomColorPalette = (roomId: string) => {
  const scheme = ROOM_COLOR_SCHEMES[roomId];
  if (!scheme) {
    throw new Error(`Unknown room ID: ${roomId}`);
  }
  
  const { baseHue, spectrumRange } = scheme;
  const halfRange = spectrumRange / 2;
  
  return {
    room: scheme,
    base: generateEventColor(baseHue),
    variants: {
      light: generateEventColor(baseHue - halfRange/2),
      primary: generateEventColor(baseHue),
      dark: generateEventColor(baseHue + halfRange/2),
      accent1: generateEventColor(baseHue - halfRange/3),
      accent2: generateEventColor(baseHue + halfRange/3)
    },
    spectrum: getRoomPresetColors(roomId)
  };
};

/**
 * Validate if a hue is within a room's color spectrum
 * @param hue HSL hue value
 * @param roomId Room identifier
 */
export const isHueInRoomSpectrum = (hue: number, roomId: string): boolean => {
  const scheme = ROOM_COLOR_SCHEMES[roomId];
  if (!scheme) return false;
  
  const { baseHue, spectrumRange } = scheme;
  const halfRange = spectrumRange / 2;
  const normalizedHue = ((hue % 360) + 360) % 360;
  
  const minHue = ((baseHue - halfRange) % 360 + 360) % 360;
  const maxHue = ((baseHue + halfRange) % 360 + 360) % 360;
  
  if (minHue <= maxHue) {
    return normalizedHue >= minHue && normalizedHue <= maxHue;
  } else {
    // Handle wrap-around case
    return normalizedHue >= minHue || normalizedHue <= maxHue;
  }
};