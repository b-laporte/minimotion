const indexOf = Array.prototype.indexOf;

export function createGetElementName(rootNode: ParentNode = document) {
  const cache = new WeakMap<HTMLElement, string>();
  return (node: HTMLElement) => {
    if (node.id) {
      return `#${node.id}`;
    }
    let result = cache.get(node);
    if (!result) {
      let querySelector = node.tagName;
      node.classList.forEach(className => {
        if (!className.startsWith("svelte-")) {
          querySelector += `.${className}`;
        }
      });
      const matchingElements = rootNode.querySelectorAll(querySelector);
      if (matchingElements.length === 1) {
        expect(matchingElements[0]).toBe(node);
        result = querySelector;
      } else {
        const index = indexOf.call(matchingElements, node);
        expect(index).not.toBe(-1);
        result = `${querySelector} #${index}`;
      }
      cache.set(node, result);
    }
    return result;
  };
}

export function formatMutations(
  tick: number,
  mutations: MutationRecord[],
  getElementName: (element: HTMLElement) => string
) {
  const res: string[] = [];
  const processedAttributes = new Map<HTMLElement, Set<string>>();
  const processedTextContent = new Set<HTMLElement>();
  for (const mutation of mutations) {
    if (mutation.type == "characterData") {
      const target = mutation.target as Text;
      const parent = target.parentElement!;
      if (!processedTextContent.has(parent)) {
        processedTextContent.add(parent);
        const value = parent.textContent!;
        const targetName = getElementName(parent);
        res.push(`${tick}: ${targetName} textContent=${value}`);
      }
    } else if (mutation.type == "attributes") {
      const target = mutation.target as HTMLElement;
      let targetProcessedAttributes = processedAttributes.get(target);
      if (!targetProcessedAttributes) {
        targetProcessedAttributes = new Set<string>();
        processedAttributes.set(target, targetProcessedAttributes);
      }
      const attributeName = mutation.attributeName!;
      if (targetProcessedAttributes.has(attributeName)) {
        // this attribute was changed multiple times
        // it has already been processed!
        continue;
      } else {
        targetProcessedAttributes.add(attributeName);
      }
      const oldValue = mutation.oldValue;
      const value = target.getAttribute(attributeName);
      if (value === oldValue) {
        // attribute did not change
        continue;
      }
      const targetName = getElementName(target);
      if (attributeName === "style") {
        const style = target.style;
        const length = style.length;
        const oldObject = document.createElement(target.tagName);
        oldObject.setAttribute("style", oldValue as string);
        const oldStyle = oldObject.style;
        for (let i = 0; i < length; i++) {
          const key = style[i];
          const styleValue = style[key];
          if (styleValue !== oldStyle[key]) {
            res.push(`${tick}: ${targetName} style.${key}=${style[key]}`);
          }
        }
      } else {
        res.push(`${tick}: ${targetName} ${attributeName}=${value}`);
      }
    }
  }
  return res;
}

export function sortAndRemoveDup(lines: string[]) {
  let lastValue: string | null = null;
  const res = [...lines].sort().filter(value => {
    const includeValue = value != lastValue;
    lastValue = value;
    return includeValue;
  });
  return res;
}
