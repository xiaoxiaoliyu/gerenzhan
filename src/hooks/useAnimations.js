import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useAnimations() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // ── Hero Opening Timeline ──
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Hero lines: clip reveal from bottom with slight overshoot
    heroTl
      .fromTo(
        '.hero-line',
        { y: 120, clipPath: 'inset(0 0 100% 0)' },
        { y: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.2, stagger: 0.18, ease: 'power4.out' }
      )
      // Ampersand: scale + fade
      .fromTo(
        '.hero-ampersand',
        { scale: 0.3, opacity: 0, rotation: -15 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.4)' },
        '-=0.6'
      )
      // Description: slide up + fade
      .fromTo(
        '.hero-desc',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.4'
      )
      // Buttons: stagger
      .fromTo(
        '.hero-actions a',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
        '-=0.3'
      )
      // Hero glow core: pulse on load
      .fromTo(
        '.hero-glow-core',
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out' },
        '-=1.0'
      )

    // ── Helper: section title reveal (clip from left + displacement) ──
    function sectionTitleReveal(selector, triggerSelector) {
      const els = document.querySelectorAll(selector)
      if (!els.length) return
      els.forEach((el) => {
        const trigger = triggerSelector
          ? el.closest(triggerSelector) || el.parentElement
          : el.parentElement
        gsap.fromTo(
          el,
          { x: -80, clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          {
            x: 0,
            clipPath: 'inset(0 0% 0 0)',
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger,
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    }

    // ── Helper: card stagger (slide up) ──
    function cardStagger(selector, triggerSelector) {
      const cards = document.querySelectorAll(selector)
      if (!cards.length) return
      const trigger = triggerSelector
        ? cards[0].closest(triggerSelector) || cards[0].parentElement
        : cards[0].parentElement
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      )
    }

    // ── Helper: image reveal (clip from bottom) ──
    function imageReveal(selector, triggerSelector) {
      const images = document.querySelectorAll(selector)
      if (!images.length) return
      const trigger = triggerSelector
        ? images[0].closest(triggerSelector) || images[0].parentElement
        : images[0].parentElement
      gsap.fromTo(
        images,
        { clipPath: 'inset(100% 0 0 0)', y: 40 },
        {
          clipPath: 'inset(0% 0 0 0)',
          y: 0,
          duration: 1.0,
          stagger: 0.12,
          ease: 'power4.out',
          scrollTrigger: {
            trigger,
            start: 'top 72%',
            toggleActions: 'play none none none',
          },
        }
      )
    }

    // ── Helper: subtle parallax on project images ──
    // needs an extra wrapper; we use a data attribute approach
    function parallaxImages(selector) {
      const imgs = document.querySelectorAll(selector)
      imgs.forEach((img) => {
        const wrapper = img.closest('.project-image')
        if (!wrapper) return
        // Add a parallax child if not already
        let parallax = wrapper.querySelector('.parallax-layer')
        if (!parallax) {
          parallax = document.createElement('div')
          parallax.className = 'parallax-layer'
          wrapper.style.overflow = 'hidden'
          wrapper.insertBefore(parallax, wrapper.firstChild)
          // Move placeholder inside parallax
          const placeholder = wrapper.querySelector('.project-image-placeholder')
          if (placeholder) parallax.appendChild(placeholder)
        }
        gsap.to(parallax, {
          y: '15%',
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
      })
    }

    // ── Apply to sections ──

    // Section labels (.section-label) inside sections
    document.querySelectorAll('.section .section-label').forEach((el) => {
      gsap.fromTo(
        el,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el.closest('.section') || el.parentElement,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      )
    })

    // Section titles
    sectionTitleReveal('.section .section-title', '.section')

    // Stat cards in About
    cardStagger('.border-glow-card', '#about')

    // Skill cards
    cardStagger('.skill-card', '#skills')

    // Project cards
    cardStagger('.project-card', '#projects')

    // Project images reveal
    imageReveal('.project-image', '#projects')

    // Parallax on project images
    parallaxImages('.project-image')

    // ── Contact section title ──
    const contactTitle = document.querySelector('.contact-content .section-title')
    if (contactTitle) {
      gsap.fromTo(
        contactTitle,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      )
    }

    // ── Refresh ScrollTrigger after layout settles ──
    ScrollTrigger.refresh()

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])
}