import React from 'react'

export const MOBILE_DOC_VERSION = '0.3.1'

export const MARKUP_SECTION_TYPE = 1
export const IMAGE_SECTION_TYPE = 2
export const LIST_SECTION_TYPE = 3
export const CARD_SECTION_TYPE = 10

export const MARKUP_MARKER_TYPE = 0
export const ATOM_MARKER_TYPE = 1

const defaultOptions = {
  atoms: [],
  cards: [],
  markups: [],
  sections: [],
  additionalProps: [],
}

/**
 * React Hook to render a mobiledoc.
 * @param {*} mobiledoc
 * @param {*} options
 */
export default function useMobiledoc(mobiledoc, options) {
  const { atoms, cards, markups, sections, additionalProps } = {
    ...defaultOptions,
    ...options,
  }

  const renderCallbacks = []

  /**
   * Looks for an item in array of objects with name
   *
   * @param {Array} items list of objects to look through
   * @param {String} name name to match
   */
  function findByName(items, name) {
    return items.find(i => i.name === name)
  }

  /**
   * Render a Markup (inline markup, like strong, em, etc)
   *
   * @param {Array} section Markup section's data
   * @param {Number} nodeKey Section index
   */
  function renderMarkupSection([type, Tag, markers], nodeKey) {
    let Element
    const customSection = findByName(sections, Tag)

    if (customSection) {
      const Section = customSection.component
      Element = (
        <Section key={nodeKey} {...additionalProps}>
          {[]}
        </Section>
      )
    } else {
      Element = <Tag key={nodeKey}>{[]}</Tag>
    }

    return renderMarkersOnElement(Element, markers, nodeKey)
  }

  /**
   * Render a List (ul / ol)
   * @param {Array} section Markup section's data
   * @param {Number} nodeKey Section index
   */
  function renderListSection([type, Tag, markers], nodeKey) {
    const items = markers.map((item, index) =>
      renderMarkersOnElement(<li key={index}>{[]}</li>, item, index)
    )

    return <Tag key={nodeKey}>{items}</Tag>
  }

  /**
   * Renders an Atom
   * @param {Number} atomIndex Atom Index
   */
  function renderAtomSection(atomIndex) {
    const [name, text, payload] = mobiledoc.atoms[atomIndex]
    const atom = findByName(atoms, name)

    if (atom) {
      const props = {
        env: {
          name,
          isInEditor: false,
          dom: 'dom',
        },
        options: {},
        key: `${name}-${text.length}`,
        payload: { ...payload, ...additionalProps },
        text,
      }

      return atom.component(props)
    }

    return null
  }

  /**
   * Renders a Card section
   * @param {Array} section Card section's data
   * @param {Number} nodeKey Section index
   */
  function renderCardSection([type, index], nodeKey) {
    const [name, payload] = mobiledoc.cards[index]
    const card = findByName(cards, name)

    if (card) {
      const props = {
        env: {
          name,
          isInEditor: false,
          dom: 'dom',
          didRender: cb => registerRenderCallback(cb),
          onTeardown: cb => registerRenderCallback(cb),
        },
        options: {},
        payload: { ...payload, ...additionalProps },
        key: nodeKey,
      }

      return card.component(props)
    }

    return null
  }

  /**
   * Renders element's inner markers
   * @param {ReactElement} element
   * @param {Array} markers
   * @param {Number} parentKey
   */
  function renderMarkersOnElement(element, markers, parentKey) {
    const elements = [element]

    function pushElement(openedElement) {
      element.props.children.push(openedElement)
      elements.push(openedElement)
      element = openedElement
    }

    for (const markerKey in markers) {
      let [type, openTypes, closeCount, value] = markers[markerKey]

      for (const openTypeKey in openTypes) {
        const openType = openTypes[openTypeKey]
        const [Tag, attrs] = mobiledoc.markups[openType]

        if (Tag) {
          const props = {
            children: [],
            ...parseProps(attrs),
            key: `${parentKey}-${markerKey}-${openTypeKey}`,
          }

          const definedMarkup = findByName(markups, Tag)

          if (definedMarkup) {
            const { component: Markup } = definedMarkup
            pushElement(<Markup {...props} />)
          } else {
            pushElement(<Tag {...props} />)
          }
        } else {
          closeCount -= 1
        }
      }

      switch (type) {
        case MARKUP_MARKER_TYPE:
          element.props.children.push(value)
          break
        case ATOM_MARKER_TYPE:
          element.props.children.push(renderAtomSection(value))
          break
        default:
      }

      for (let j = 0, m = closeCount; j < m; j += 1) {
        elements.pop()
        element = elements[elements.length - 1]
      }
    }

    return element
  }

  /**
   * Converts attrs to props
   *
   * @param {array} attrs
   */
  function parseProps(attrs) {
    if (attrs) {
      return {
        [attrs[0]]: attrs[1],
      }
    }

    return null
  }

  /**
   * Register a render callback (`didRender`/`onTeardown`)
   * @param {Function} cb Callback function
   */
  function registerRenderCallback(cb) {
    renderCallbacks.push(cb)
  }

  // Returns/Renders all sections in mobiledoc
  return mobiledoc.sections
    .map((section, nodeKey) => {
      const [type] = section

      switch (type) {
        case MARKUP_SECTION_TYPE:
          return renderMarkupSection(section, nodeKey)
        case LIST_SECTION_TYPE:
          return renderListSection(section, nodeKey)
        case CARD_SECTION_TYPE:
          return renderCardSection(section, nodeKey)
        default:
          return null
      }
    })
    .filter(Boolean) // Remove null items from array
}
