'use client'

/**
 * Animation Components and Utilities
 * Polished animations and transitions for enhanced user experience
 */

import React from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

// Animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}

export const slideInFromLeft: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
}

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 }
}

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Reusable animation components
interface AnimatedContainerProps {
  children: React.ReactNode
  className?: string
  variants?: Variants
  delay?: number
  duration?: number
  stagger?: boolean
}

export function AnimatedContainer({ 
  children, 
  className = '',
  variants = fadeInUp,
  delay = 0,
  duration = 0.3,
  stagger = false
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedList({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      transition={{
        staggerChildren: staggerDelay
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Page transition wrapper
export function PageTransition({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Modal/Dialog animations
export function ModalTransition({ 
  children, 
  isOpen 
}: { 
  children: React.ReactNode
  isOpen: boolean 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Toast notification animations
export function ToastTransition({ 
  children, 
  position = 'top-right' 
}: { 
  children: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}) {
  const getInitialPosition = () => {
    switch (position) {
      case 'top-right':
      case 'bottom-right':
        return { x: 400, opacity: 0 }
      case 'top-left':
      case 'bottom-left':
        return { x: -400, opacity: 0 }
      case 'top-center':
        return { y: -100, opacity: 0 }
      case 'bottom-center':
        return { y: 100, opacity: 0 }
      default:
        return { x: 400, opacity: 0 }
    }
  }

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={getInitialPosition()}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }}
    >
      {children}
    </motion.div>
  )
}

// Hover animations
export function HoverScale({ 
  children, 
  scale = 1.02,
  className = '' 
}: {
  children: React.ReactNode
  scale?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  )
}

export function HoverFloat({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  )
}

// Button animations
export function AnimatedButton({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Loading animations
export function PulseLoader({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`w-2 h-2 bg-current rounded-full ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

export function BouncingLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            y: [0, -8, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export function SpinLoader({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  )
}

// Progress animations
export function AnimatedProgress({ 
  value, 
  max = 100,
  className = '' 
}: {
  value: number
  max?: number
  className?: string
}) {
  const percentage = (value / max) * 100

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-blue-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut" 
        }}
      />
    </div>
  )
}

// Number counter animation
export function AnimatedCounter({ 
  value, 
  duration = 1,
  className = '' 
}: {
  value: number
  duration?: number
  className?: string
}) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        const increment = value / (duration * 60) // 60fps
        const next = prev + increment
        return next >= value ? value : next
      })
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [value, duration])

  return (
    <span className={className}>
      {Math.floor(count)}
    </span>
  )
}

// Reveal animations for content
export function RevealOnScroll({ 
  children, 
  className = '',
  threshold = 0.1 
}: {
  children: React.ReactNode
  className?: string
  threshold?: number
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

// Typewriter effect
export function TypewriterText({ 
  text, 
  speed = 50,
  className = '' 
}: {
  text: string
  speed?: number
  className?: string
}) {
  const [displayText, setDisplayText] = React.useState('')
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed])

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-4 bg-current ml-1"
      />
    </span>
  )
}

// Card flip animation
export function FlipCard({ 
  front, 
  back, 
  className = '' 
}: {
  front: React.ReactNode
  back: React.ReactNode
  className?: string
}) {
  const [isFlipped, setIsFlipped] = React.useState(false)

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        
        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}

// Magnetic hover effect
export function MagneticHover({ 
  children, 
  strength = 0.3,
  className = '' 
}: {
  children: React.ReactNode
  strength?: number
  className?: string
}) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const ref = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    setPosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}