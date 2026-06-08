import { breakpoints } from './../plugins/theme/dlsconfig';

// Modal-specific breakpoints (using Tailwind screen sizes)
export const MODAL_BREAKPOINTS = {
    lg: '75vw', // when screen ≤ xl (1200)
    md: '90vw' // when screen ≤ sm (576)
};

// Map to Dialog format
export const DIALOG_BREAKPOINTS = {
    [`${breakpoints.xl - 1}px`]: MODAL_BREAKPOINTS.lg, // 1199px
    [`${breakpoints.sm - 1}px`]: MODAL_BREAKPOINTS.md // 575px
};
