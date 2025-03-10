/**
 * Animation variants for micro-interactions
 */

// Subtle hover animation for cards and interactive elements
export const hoverAnimation = {
  rest: { y: 0, transition: { duration: 0.2, ease: "easeInOut" } },
  hover: { y: -3, transition: { duration: 0.2, ease: "easeInOut" } },
};

// For buttons and clickable elements
export const tapAnimation = {
  rest: { scale: 1 },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

// Fade in animation for elements
export const fadeInAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// Slide up animation
export const slideUpAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Staggered children animation
export const staggerContainerAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// For focus states
export const focusAnimation = {
  rest: { boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
  focus: {
    boxShadow: "0 0 0 2px rgba(0,0,0,0.3)",
    transition: { duration: 0.2 },
  },
};

// For list items (like in the timeline)
export const listItemAnimation = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

// For section transitions
export const sectionAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// For tooltip/popover animations
export const tooltipAnimation = {
  hidden: { opacity: 0, scale: 0.8, y: 5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};
