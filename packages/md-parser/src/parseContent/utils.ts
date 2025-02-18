import {
  InlineContent,
  InlineElement,
  InlineType,
  isInlineContent,
} from '@ruslan-sedziukh/md-types'

type TempLink = {
  temp: true
  openSymbols: '['
  openSymbolsI: number
}

type TempImage = {
  temp: true
  openSymbols: '!['
  openSymbolsI: number
}

type TempElement =
  | {
      temp: true
      openSymbols: string
    }
  | TempLink
  | TempImage

export type Temp =
  | Partial<InlineElement>
  | (TempElement & Partial<InlineElement>)
  | string

export const isTempLink = (el: Temp): el is TempLink => {
  if (typeof el === 'object' && 'openSymbols' in el && el.openSymbols === '[') {
    return true
  }

  return false
}

export const isTempImage = (el: Temp): el is TempImage => {
  if (
    typeof el === 'object' &&
    'openSymbols' in el &&
    el.openSymbols === '!['
  ) {
    return true
  }

  return false
}

/**
 * Returns temp el that matches open symbols.
 *
 * @temp - array of temp elements
 * @openSymbols - string with open symbols
 * @returns temp el.
 */
export const getTempElI = (temp: Temp[], openSymbols: string) =>
  temp.findIndex((el) => {
    if (isTempElement(el)) {
      return el.openSymbols === openSymbols
    }

    return false
  })

export const getTempElWithTempLink = (temp: Temp[], openSymbols: string) => {
  const tempLinkI = getTempElI(temp, '[')
  const tempElI = getTempElI(temp, openSymbols)

  if (tempElI > tempLinkI) {
    return tempElI
  }

  return -1
}

/**
 * Returns element type, element symbols (last symbols in temp element)
 */
export const getTempElData = ({
  content,
  i,
  temp,
  parseImage,
}: {
  content: string
  i: number
  temp: Temp[]
  parseImage: boolean
}):
  | {
      elType: InlineType
      elSymbols: string
      tempElI: number
      reparseElType?: InlineType.Link | InlineType.Image
    }
  | {
      elType: null
      elSymbols: null
      tempElI: number
      reparseElType?: null
    } => {
  if (parseImage) {
    return getImageTempElData({ content, i, temp })
  }

  return getStrictTempElData({ content, i, temp })
}

/**
 * Get temp el data as it is
 */
export const getStrictTempElData = ({
  content,
  i,
  temp,
}: {
  content: string
  i: number
  temp: Temp[]
}):
  | {
      elType: InlineType
      elSymbols: string
      tempElI: number
      reparseElType?: InlineType.Link | InlineType.Image
    }
  | { elType: null; elSymbols: null; tempElI: number } => {
  if (content[i] === '*' && content[i + 1] === '*') {
    return {
      elType: InlineType.Bold,
      elSymbols: '**',
      tempElI: getTempElWithTempLink(temp, '**'),
    }
  }

  if (content[i] === '*') {
    return {
      elType: InlineType.Italic,
      elSymbols: '*',
      tempElI: getTempElWithTempLink(temp, '*'),
    }
  }

  if (content[i] === '[') {
    const tempElI = getTempElI(temp, '[')

    return {
      elType: InlineType.Link,
      elSymbols: '[',
      tempElI: tempElI,
      reparseElType: tempElI !== -1 ? InlineType.Link : undefined,
    }
  }

  if (content[i] === ']' && content[i + 1] === '(') {
    const tempElI = getTempElI(temp, '[')
    const tempEl = temp[tempElI]

    if (tempElI !== -1 && typeof tempEl !== 'string' && !('content' in tempEl))
      return {
        elType: InlineType.Link,
        elSymbols: '](',
        tempElI: tempElI,
      }
  }

  if (content[i] === ')') {
    const tempElI = getTempElI(temp, '[')
    const tempEl = temp[tempElI]

    if (
      tempEl &&
      typeof tempEl !== 'string' &&
      'content' in tempEl &&
      tempEl.type
    ) {
      return {
        elType: tempEl.type,
        elSymbols: ')',
        tempElI,
      }
    }
  }

  if (content[i] === ')') {
    const tempElI = getTempElI(temp, '![')
    const tempEl = temp[tempElI]

    if (
      tempEl &&
      typeof tempEl !== 'string' &&
      'alt' in tempEl &&
      tempEl.type
    ) {
      return {
        elType: tempEl.type,
        elSymbols: ')',
        tempElI,
      }
    }
  }

  if (content[i] === '!' && content[i + 1] === '[') {
    const tempElI = getTempElI(temp, '![')

    if (tempElI === -1) {
      return {
        elType: InlineType.Image,
        elSymbols: '![',
        tempElI,
      }
    }
  }

  if (content[i] === ']' && content[i + 1] === '(') {
    const tempElI = getTempElI(temp, '![')

    if (tempElI !== -1) {
      return {
        elType: InlineType.Image,
        elSymbols: '](',
        tempElI,
      }
    }
  }

  return { elType: null, elSymbols: null, tempElI: -1 }
}

/**
 * Returns element type, element symbols (last symbols in temp element)
 */
export const getImageTempElData = ({
  content,
  i,
  temp,
}: {
  content: string
  i: number
  temp: Temp[]
}):
  | {
      elType: InlineType
      elSymbols: string
      tempElI: number
      reparseElType?: InlineType.Image
    }
  | { elType: null; elSymbols: null; tempElI: number } => {
  if (content[i] === ')') {
    const tempElI = getTempElI(temp, '![')
    const tempEl = temp[tempElI]

    if (
      tempEl &&
      typeof tempEl !== 'string' &&
      'alt' in tempEl &&
      tempEl.type
    ) {
      return {
        elType: tempEl.type,
        elSymbols: ')',
        tempElI,
      }
    }
  }

  if (content[i] === '[') {
    const tempElI = getTempElI(temp, '![')

    if (tempElI !== -1) {
      return {
        elType: InlineType.Image,
        elSymbols: '![',
        tempElI,
        reparseElType: InlineType.Image,
      }
    }
  }

  if (content[i] === '!' && content[i + 1] === '[') {
    const tempElI = getTempElI(temp, '![')

    if (tempElI === -1) {
      return {
        elType: InlineType.Image,
        elSymbols: '![',
        tempElI,
      }
    }

    return {
      elType: InlineType.Image,
      elSymbols: '![',
      tempElI,
      reparseElType: InlineType.Image,
    }
  }

  if (content[i] === ']' && content[i + 1] === '(') {
    const tempElI = getTempElI(temp, '![')

    if (tempElI !== -1) {
      return {
        elType: InlineType.Image,
        elSymbols: '](',
        tempElI,
      }
    }
  }

  return { elType: null, elSymbols: null, tempElI: -1 }
}

export const isTempElement = (el: any): el is TempElement => {
  if (el.temp && typeof el?.openSymbols === 'string') {
    return true
  }

  return false
}

/**
 * Takes array of temp elements and returns only array of
 * completed elements.
 *
 * @temp - array of parsed and temp elements
 * @return array of parsed elements cleaned from temp
 */
export const getElementsWithNoTemp = (
  temp: Temp[],
  i: number
): InlineContent[] => {
  const result: InlineContent[] = []

  for (; i < temp.length; i++) {
    const el = temp[i]
    const prev = result[result.length - 1]

    if (typeof el === 'string') {
      if (typeof prev === 'string') {
        result[result.length - 1] = prev.concat(el)
      } else {
        result.push(el)
      }
    } else if ('temp' in el) {
      if (prev && typeof prev === 'string') {
        result[result.length - 1] = prev.concat(el.openSymbols || '')
      } else if (typeof el.openSymbols === 'string') {
        result.push(el.openSymbols)
      }
    } else if (isInlineContent(el)) {
      result.push(el)
    }
  }

  return result
}
