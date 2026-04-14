/**
 * Reusable Fade-In Animation Script
 * 
 * Usage:
 * 1. Import the script in your Astro component
 * 2. Add IDs to elements you want to animate
 * 3. Call fadeInOnScroll() with element IDs and options
 * 
 * Example:
 * <script>
 *   import { fadeInOnScroll } from '../scripts/fadeInAnimation.js';
 *   
 *   document.addEventListener('DOMContentLoaded', () => {
 *     fadeInOnScroll(['hero-title', 'hero-subtitle', 'cta-button'], {
 *       trigger: 'top 80%',
 *       stagger: 0.2
 *     });
 *   });
 * </script>
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade in elements on scroll
 * @param {string|string[]} elementIds - Single ID or array of element IDs
 * @param {Object} options - Animation options
 */
export function fadeInOnScroll(elementIds, options = {}) {
  const defaults = {
    trigger: 'top 80%',        // When to trigger (ScrollTrigger format)
    duration: 0.8,             // Animation duration
    delay: 0,                  // Initial delay
    stagger: 0.1,              // Delay between multiple elements
    direction: 'up',           // 'up', 'down', 'left', 'right', 'fade'
    distance: 20,              // Reduced default distance to prevent overflow
    ease: 'power2.out',        // GSAP easing
    once: true,                // Only animate once
    toggleActions: 'play none none reverse' // ScrollTrigger toggle actions
  };

  const config = { ...defaults, ...options };
  
  // Limit horizontal movement to prevent overflow
  if (config.direction === 'left' || config.direction === 'right') {
    config.distance = Math.min(config.distance, 20);
  }
  
  // Convert single ID to array
  const ids = Array.isArray(elementIds) ? elementIds : [elementIds];
  
  // Get elements by ID
  const elements = ids.map(id => document.getElementById(id)).filter(el => el !== null);
  
  if (elements.length === 0) {
    console.warn('FadeInAnimation: No elements found with provided IDs:', ids);
    return;
  }

  // Set initial state based on direction
  const initialState = getInitialState(config.direction, config.distance);
  
  // Apply initial state with overflow prevention
  elements.forEach(element => {
    gsap.set(element, {
      ...initialState,
      // Ensure elements don't cause horizontal overflow
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden'
    });
  });

  // Create animation for each element
  elements.forEach((element, index) => {
    const elementDelay = config.delay + (index * config.stagger);
    
    ScrollTrigger.create({
      trigger: element,
      start: config.trigger,
      toggleActions: config.once ? 'play none none none' : config.toggleActions,
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: config.duration,
          delay: elementDelay,
          ease: config.ease,
          clearProps: 'willChange' // Clean up after animation
        });
      },
      onLeaveBack: config.once ? undefined : () => {
        const resetState = getInitialState(config.direction, config.distance);
        gsap.to(element, {
          ...resetState,
          duration: config.duration * 0.5,
          ease: config.ease
        });
      }
    });
  });
}

/**
 * Batch fade in multiple groups of elements
 * @param {Array} groups - Array of {ids, options} objects
 */
export function batchFadeIn(groups) {
  groups.forEach(group => {
    fadeInOnScroll(group.ids, group.options);
  });
}

/**
 * Fade in elements with custom trigger element
 * @param {string|string[]} elementIds - Elements to animate
 * @param {string} triggerId - Element that triggers the animation
 * @param {Object} options - Animation options
 */
export function fadeInWithTrigger(elementIds, triggerId, options = {}) {
  const triggerElement = document.getElementById(triggerId);
  if (!triggerElement) {
    console.warn('FadeInAnimation: Trigger element not found:', triggerId);
    return;
  }

  const config = { ...options, customTrigger: triggerElement };
  
  const ids = Array.isArray(elementIds) ? elementIds : [elementIds];
  const elements = ids.map(id => document.getElementById(id)).filter(el => el !== null);
  
  if (elements.length === 0) {
    console.warn('FadeInAnimation: No elements found with provided IDs:', ids);
    return;
  }

  const defaults = {
    trigger: 'top 80%',
    duration: 0.8,
    delay: 0,
    stagger: 0.1,
    direction: 'up',
    distance: 30,
    ease: 'power2.out'
  };

  const finalConfig = { ...defaults, ...config };
  const initialState = getInitialState(finalConfig.direction, finalConfig.distance);
  gsap.set(elements, initialState);

  ScrollTrigger.create({
    trigger: triggerElement,
    start: finalConfig.trigger,
    toggleActions: 'play none none reverse',
    onEnter: () => {
      elements.forEach((element, index) => {
        const elementDelay = finalConfig.delay + (index * finalConfig.stagger);
        gsap.to(element, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: finalConfig.duration,
          delay: elementDelay,
          ease: finalConfig.ease
        });
      });
    }
  });
}

/**
 * Get initial state based on animation direction
 * @param {string} direction - Animation direction
 * @param {number} distance - Distance to move
 * @returns {Object} Initial GSAP state
 */
function getInitialState(direction, distance) {
  const states = {
    up: { opacity: 0, y: distance, x: 0 },
    down: { opacity: 0, y: -distance, x: 0 },
    left: { opacity: 0, x: Math.min(distance, 20), y: 0 }, // Limit horizontal movement
    right: { opacity: 0, x: -Math.min(distance, 20), y: 0 }, // Limit horizontal movement
    fade: { opacity: 0, x: 0, y: 0 }
  };
  
  return states[direction] || states.up;
}

/**
 * Preset animation configurations
 */
export const presets = {
  // Quick fade from bottom
  quick: {
    duration: 0.4,
    direction: 'up',
    distance: 15,
    ease: 'power1.out'
  },
  
  // Smooth slide up
  smooth: {
    duration: 0.8,
    direction: 'up',
    distance: 20,
    ease: 'power2.out'
  },
  
  // Bouncy entrance
  bouncy: {
    duration: 1,
    direction: 'up',
    distance: 25,
    ease: 'back.out(1.7)'
  },
  
  // Slide from left (limited movement)
  slideLeft: {
    duration: 0.6,
    direction: 'left',
    distance: 20,
    ease: 'power2.out'
  },
  
  // Slide from right (limited movement)
  slideRight: {
    duration: 0.6,
    direction: 'right',
    distance: 20,
    ease: 'power2.out'
  },
  
  // Simple fade
  fade: {
    duration: 0.6,
    direction: 'fade',
    distance: 0,
    ease: 'power1.out'
  },
  
  // Staggered group animation
  staggered: {
    duration: 0.6,
    direction: 'up',
    distance: 20,
    stagger: 0.15,
    ease: 'power2.out'
  }
};

/**
 * Quick helper functions for common use cases
 */
export const quickFade = (ids, preset = 'smooth') => {
  fadeInOnScroll(ids, presets[preset] || presets.smooth);
};

export const staggeredFade = (ids, delay = 0.15) => {
  fadeInOnScroll(ids, { ...presets.staggered, stagger: delay });
};

export const bouncyFade = (ids) => {
  fadeInOnScroll(ids, presets.bouncy);
};

// Auto-initialize elements with data attributes
document.addEventListener('DOMContentLoaded', () => {
  // Find elements with data-fade-in attribute
  const autoElements = document.querySelectorAll('[data-fade-in]');
  
  autoElements.forEach(element => {
    if (!element.id) {
      console.warn('FadeInAnimation: Element with data-fade-in needs an ID:', element);
      return;
    }
    
    const preset = element.getAttribute('data-fade-in') || 'smooth';
    const trigger = element.getAttribute('data-fade-trigger') || 'top 80%';
    
    fadeInOnScroll(element.id, {
      ...presets[preset],
      trigger: trigger
    });
  });
});