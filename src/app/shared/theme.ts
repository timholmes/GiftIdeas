import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

/*
  "Dusk" design tokens.

  Plum-ink surfaces get lighter as they rise, text is warm ivory, and the
  accents share one brightness. Apricot marks the one primary action per
  screen, Lilac is for links and focus, Sea glass is for acceptance/success.
*/
export const colors = {
    // surfaces
    bgBase: '#14121C',      // Night - app background
    bgSurface: '#1C1926',   // Dusk - cards, sheets
    bgRaised: '#252131',    // Haze - inputs
    bgOverlay: '#302B3F',   // Mist - pressed, selected, secondary buttons
    border: '#3D3650',      // Line - hairlines, outlines
    divider: '#2A2537',

    // content
    textPrimary: '#F4EFE9',   // Ivory
    textSecondary: '#B9B1C4', // Heather
    textTertiary: '#8E86A0',  // Smoke
    textOnAccent: '#1A1320',  // Ink

    // accents
    primary: '#F2A07B',         // Apricot
    primaryPressed: '#D98A66',
    primaryMuted: '#3A2A2C',
    secondary: '#B5A4F2',       // Lilac
    secondaryLight: '#CFC4F7',
    secondaryMuted: '#2E2A48',
    presence: '#7FD1B9',        // Sea glass
    presenceMuted: '#1F3833',

    // feedback
    warning: '#F2C36B',
    warningMuted: '#3B3322',
    danger: '#F08A8A',
    dangerMuted: '#3A2426',
    info: '#8CC0F2',
    infoMuted: '#263A4E',
};

export const radius = {
    thumb: 14,
    field: 14,
    card: 20,
    section: 24,
    pill: 999,
};

export const spacing = {
    screen: 20,
};

// The design pairs Bricolage Grotesque (display) with Figtree (body). Those
// fonts aren't bundled yet, so these fall back to the system font.
export const type = {
    largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '600' as const, letterSpacing: -0.3, color: colors.textPrimary },
    title2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const, color: colors.textPrimary },
    title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' as const, color: colors.textPrimary },
    headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const, color: colors.textPrimary },
    body: { fontSize: 17, lineHeight: 22, color: colors.textPrimary },
    subhead: { fontSize: 15, lineHeight: 20, color: colors.textSecondary },
    footnote: { fontSize: 13, lineHeight: 18, color: colors.textTertiary },
    sectionLabel: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.textTertiary },
};

// Initials sit on a muted tint of an accent, assigned per person and kept stable.
export const avatarPalette: { background: string, foreground: string }[] = [
    { background: colors.primaryMuted, foreground: colors.primary },
    { background: colors.secondaryMuted, foreground: colors.secondary },
    { background: colors.presenceMuted, foreground: colors.presence },
    { background: colors.infoMuted, foreground: colors.info },
    { background: colors.warningMuted, foreground: colors.warning },
];

export const stackScreenOptions: NativeStackNavigationOptions = {
    headerStyle: { backgroundColor: colors.bgBase },
    headerTintColor: colors.textPrimary,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.bgBase },
};
