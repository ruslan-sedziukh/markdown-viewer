import { HeadingElement } from '@ruslan-sedziukh/md-types'
import { parseContent } from '../parseContent'
import { getHeadingType } from './utils'

export const parseHeading = (heading: string): HeadingElement => {
  const [headingType, contentIndex] = getHeadingType(heading)
  const content = parseContent(heading.slice(contentIndex))

  return {
    type: headingType,
    content,
  }
}
