import { InlineType } from '@ruslan-sedziukh/md-types'
import { parseContent } from '.'

describe('parseContent', () => {
  describe('emphasized content', () => {
    it.each([
      {
        text: 'is parsed correctly in case simple text',
        content: 'Heading **one** of two',
        expected: [
          'Heading ',
          {
            type: 'bold',
            content: ['one'],
          },
          ' of two',
        ],
      },
      {
        text: 'is not parsed when there are only opened symbols',
        content: 'Heading **one',
        expected: ['Heading **one'],
      },
      {
        text: 'is parsed inside another emphasized content',
        content: '*H*eading ***o*ne**',
        expected: [
          {
            type: 'italic',
            content: ['H'],
          },
          'eading ',
          {
            type: 'bold',
            content: [
              {
                type: 'italic',
                content: ['o'],
              },
              'ne',
            ],
          },
        ],
      },
    ])('$text', ({ content, expected }) => {
      expect(parseContent(content)).toEqual(expected)
    })
  })

  describe('link', () => {
    it.each([
      {
        text: 'is parsed in simple text',
        content: 'Look at [this](www.test.com) and be aware',
        expected: [
          'Look at ',
          {
            type: 'link',
            content: ['this'],
            href: 'www.test.com',
          },
          ' and be aware',
        ],
      },
      {
        text: 'is parsed correctly with emphasized text',
        content: 'Look at [**this**](www.test.com) and be aware',
        expected: [
          'Look at ',
          {
            type: 'link',
            content: [{ type: InlineType.Bold, content: ['this'] }],
            href: 'www.test.com',
          },
          ' and be aware',
        ],
      },
      {
        text: 'is parsed correctly when ** are before',
        content: '**[mini**mum](blabla)',
        expected: [
          '**',
          {
            type: 'link',
            content: ['mini**mum'],
            href: 'blabla',
          },
        ],
      },
      {
        text: 'is parsed correctly with uncompleted link',
        content: 'this is **[mini**mum**(blabla)**',
        expected: [
          'this is ',
          {
            type: 'bold',
            content: ['[mini'],
          },
          'mum',
          {
            type: 'bold',
            content: ['(blabla)'],
          },
        ],
      },
      {
        text: 'is parsed correctly when text has uncompleted and completed link',
        content: 'this is **[mini**mum**(blabla)** [value](test.com)',
        expected: [
          'this is ',
          {
            type: 'bold',
            content: ['[mini'],
          },
          'mum',
          {
            type: 'bold',
            content: ['(blabla)'],
          },
          ' ',
          {
            type: 'link',
            content: ['value'],
            href: 'test.com',
          },
        ],
      },
      {
        text: 'is parsed correctly when text has uncompleted link before',
        content: 'this is **![mini**mum**(blabla)** [cow](test.com)',
        expected: [
          'this is ',
          {
            type: 'bold',
            content: ['![mini'],
          },
          'mum',
          {
            type: 'bold',
            content: ['(blabla)'],
          },
          ' ',
          {
            type: InlineType.Link,
            content: ['cow'],
            href: 'test.com',
          },
        ],
      },
    ])('$text', ({ content, expected }) => {
      expect(parseContent(content)).toEqual(expected)
    })
  })

  describe('image', () => {
    it.each([
      {
        text: 'is parsed in simple text',
        content: 'Look at ![cow](./assets/cow.png) and be aware',
        expected: [
          'Look at ',
          {
            type: InlineType.Image,
            alt: 'cow',
            src: './assets/cow.png',
          },
          ' and be aware',
        ],
      },
      {
        text: 'is parsed in correctly with emphasized text',
        content: 'Look at ![**cow**](./assets/cow.png) and be aware',
        expected: [
          'Look at ',
          {
            type: InlineType.Image,
            alt: '**cow**',
            src: './assets/cow.png',
          },
          ' and be aware',
        ],
      },
      {
        text: 'is parsed correctly when ** are before',
        content: '**![mini**mum](./assets/minimum.png)',
        expected: [
          '**',
          {
            type: InlineType.Image,
            alt: 'mini**mum',
            src: './assets/minimum.png',
          },
        ],
      },
      {
        text: 'is parsed correctly with uncompleted image',
        content: 'this is **![mini**mum**(./assets/minimum.png)**',
        expected: [
          'this is ',
          {
            type: 'bold',
            content: ['![mini'],
          },
          'mum',
          {
            type: 'bold',
            content: ['(./assets/minimum.png)'],
          },
        ],
      },
      {
        text: 'is parsed correctly when text has uncompleted and completed image',
        content: 'this is **![mini**mum**(blabla)** ![cow](./assets/cow.png)',
        expected: [
          'this is ',
          {
            type: 'bold',
            content: ['![mini'],
          },
          'mum',
          {
            type: 'bold',
            content: ['(blabla)'],
          },
          ' ',
          {
            type: InlineType.Image,
            alt: 'cow',
            src: './assets/cow.png',
          },
        ],
      },
      {
        text: 'is parsed correctly when text has uncompleted link before',
        content: 'this is **[mini**mum**(blabla)** ![cow](./assets/cow.png)',
        expected: [
          'this is ',
          {
            type: 'bold',
            content: ['[mini'],
          },
          'mum',
          {
            type: 'bold',
            content: ['(blabla)'],
          },
          ' ',
          {
            type: InlineType.Image,
            alt: 'cow',
            src: './assets/cow.png',
          },
        ],
      },
    ])('$text', ({ content, expected }) => {
      // console.log('parseContent(content):', parseContent(content))
      expect(parseContent(content)).toEqual(expected)
    })
  })
})
