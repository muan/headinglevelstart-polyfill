if ('level' in HTMLHeadingElement.prototype) {
  // supports, noop
} else {
  const attributeName = 'headinglevelstart'
  const targetNode = document
  const callback = (mutationList) => {
    for (const mutation of mutationList) {
      setHeadingLevels(mutation.target)
    }
  }

  const headingMap = []
  const observer = new MutationObserver(mutationList => {
    for (const mutation of mutationList) {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName !== attributeName) continue
        setHeadingLevels(mutation.target)
      } else {
        if (!mutation.target.hasAttribute(attributeName)) continue
        setHeadingLevels(mutation.target)
      }
    }
  })
  observer.observe(targetNode, { childList: true, subtree: true, attributes: true })

  function setHeadingLevels(el) {
    const startLevel = Math.min(Number(el.getAttribute(attributeName)), 7)
    if (startLevel === NaN || startLevel === 0) return
    
    for (const heading of el.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
      if (heading.closest(`[${attributeName}]`) !== el) continue
      const notSetBefore = headingMap.indexOf(heading) < 0
      if (heading.hasAttribute('aria-level') && notSetBefore) continue
      if (notSetBefore) headingMap.push(heading)
      
      const level = Math.min(startLevel + Number(heading.tagName[1]) - 1, 9)
      heading.setAttribute('aria-level', level)
    }
  }

  for (const container of document.querySelectorAll(`[${attributeName}]`)) {
    setHeadingLevels(container)
  }

  Object.defineProperty(HTMLHeadingElement.prototype, 'level', {
    enumerable: false,
    get: function() {
        const headinglevelstart = this.closest(`[${attributeName}]`)
        const level = Number(this.tagName[1])
        const startLevel = headinglevelstart ? Number(headinglevelstart.getAttribute(attributeName)) : 0
        return headingMap.indexOf(this) < 0 ? level : startLevel + level - 1
      }
  })
}