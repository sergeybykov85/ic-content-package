import type { CSSTransitionClassNames } from 'react-transition-group/CSSTransition'
import type { RefObject } from 'react'
import { useRef } from 'react'

export default function useCssTransitionClassNames<T extends HTMLElement = HTMLDivElement>(
  cssTransitionClassNames: CSSTransitionClassNames,
): {
  cssTransitionClassNames: CSSTransitionClassNames
  transitionRef: RefObject<T>
  currentTransitionClassName: string | undefined
} {
  const transitionRef = useRef<T>(null)
  const currentTransitionClassName = transitionRef.current?.className.match(
    Object.values(cssTransitionClassNames).join('|'),
  )?.[0]
  return { cssTransitionClassNames, transitionRef, currentTransitionClassName }
}
