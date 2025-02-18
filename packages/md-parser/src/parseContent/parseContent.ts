import {
  InlineContent,
  InlineElement,
  InlineType,
} from '@ruslan-sedziukh/md-types'
import {
  getTempElData,
  getElementsWithNoTemp,
  isTempLink,
  Temp,
  isTempImage,
} from './utils'

export const parseContent = (
  // content that should be parsed
  content: string,
  // starting index
  startI: number = 0,
  // starting temp array
  tempExternal: Temp[] = []
): InlineContent[] => {
  let temp: Temp[] = tempExternal

  let i = startI
  let parseImage = false

  while (i < content.length) {
    const { elSymbols, elType, tempElI, reparseElType } = getTempElData({
      content,
      i,
      temp,
      parseImage: parseImage,
    })

    if (reparseElType) {
      return reparseAfterUncompletedElement(
        content,
        temp,
        tempElI,
        reparseElType
      )
    }

    if (elType) {
      if (tempElI !== -1) {
        const tempEl = temp[tempElI]

        if (typeof tempEl !== 'string' && tempEl.type === InlineType.Link) {
          if (elSymbols === '](') {
            temp[tempElI] = {
              ...tempEl,
              content: getElementsWithNoTemp(temp, tempElI + 1),
            }
          }

          if (elSymbols === ')') {
            temp[tempElI] = {
              content: tempEl.content,
              type: tempEl.type,
              // TODO: make href be parsed just as a string
              href: temp[temp.length - 1] as string,
            }
          }
        } else if (
          typeof tempEl !== 'string' &&
          tempEl.type === InlineType.Image
        ) {
          if (elSymbols === '](') {
            const altText = temp[temp.length - 1]

            temp[tempElI] = {
              ...tempEl,
              alt: typeof altText === 'string' ? altText : '',
            }
          }

          if (elSymbols === ')') {
            temp[tempElI] = {
              alt: tempEl.alt,
              type: tempEl.type,
              src: temp[temp.length - 1] as string,
            }

            parseImage = false
          }
        } else {
          temp[tempElI] = {
            type: elType,
            content: getElementsWithNoTemp(temp, tempElI + 1),
          } as InlineElement
        }

        temp = temp.slice(0, tempElI + 1)
      } else if (elSymbols === '[' || elSymbols === '![') {
        temp.push({
          temp: true,
          type: elType,
          openSymbols: elSymbols,
          openSymbolsI: i,
        })

        if (elSymbols === '![') {
          parseImage = true
        }
      } else {
        temp.push({
          temp: true,
          type: elType,
          openSymbols: elSymbols,
        })
      }

      if (elSymbols.length === 2) {
        i++
      }
    } else {
      const prev = temp[temp.length - 1]

      if (typeof prev === 'string') {
        temp[temp.length - 1] = prev.concat(content[i])
      } else {
        temp.push(content[i])
      }
    }

    i++
  }

  return getParsedFromTemp(content, temp)
}

/**
 * Takes array of temp elements and returns array of completed elements.
 */
const getParsedFromTemp = (content: string, temp: Temp[]) => {
  const uncompletedTempLinkI = temp.findIndex((el) => {
    if (typeof el !== 'object') {
      return false
    }

    if (el.type === InlineType.Link && !el.href) {
      return true
    }
  })

  const uncompletedTempImageI = temp.findIndex((el) => {
    if (typeof el !== 'object') {
      return false
    }

    if (el.type === InlineType.Image && !el.src) {
      return true
    }
  })

  const uncompletedTempElI = [uncompletedTempImageI, uncompletedTempLinkI].find(
    (i) => i !== -1
  )
  const uncompletedTempEl = uncompletedTempElI && temp[uncompletedTempElI]

  if (
    uncompletedTempEl &&
    typeof uncompletedTempEl === 'object' &&
    'type' in uncompletedTempEl &&
    (uncompletedTempEl.type === InlineType.Link ||
      uncompletedTempEl.type === InlineType.Image)
  ) {
    return reparseAfterUncompletedElement(
      content,
      temp,
      uncompletedTempElI,
      uncompletedTempEl.type
    )
  }

  return getElementsWithNoTemp(temp, 0)
}

const reparseAfterUncompletedElement = (
  // content that should be parsed
  content: string,
  // starting temp array
  temp: Temp[],
  // uncompleted temp element index,
  tempElI: number,
  // temp element type
  type: InlineType.Image | InlineType.Link
) => {
  let openSymbols = ''

  if (type === InlineType.Image) {
    openSymbols = '!['
  } else if (type === InlineType.Link) {
    openSymbols = '['
  }

  const tempEl = temp[tempElI]

  // if there is temp link
  if (tempEl && (isTempImage(tempEl) || isTempLink(tempEl))) {
    const prevTempEl = temp[tempElI - 1]
    let tempElIShift = 0

    // add open symbols to prev el
    if (typeof prevTempEl === 'string') {
      prevTempEl + openSymbols
    } else if ('content' in prevTempEl && prevTempEl.content) {
      prevTempEl.content[prevTempEl.content?.length]
    } else {
      temp[tempElI] = openSymbols
      tempElIShift = tempElIShift + 1
    }

    // parse again from next char
    return parseContent(
      content,
      tempEl.openSymbolsI + openSymbols.length,
      temp.slice(0, tempElI + tempElIShift)
    )
  }

  return getElementsWithNoTemp(temp, 0)
}
