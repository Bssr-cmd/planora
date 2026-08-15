export class NoteParser {
  /**
   * Parse a markdown note and extract metadata.
   * @param {string} content 
   * @returns {Object} Extracted data: { links: string[], tags: string[] }
   */
  static parse(content) {
    const links = [];
    const tags = [];
    
    if (!content) return { links, tags };

    // Extract [[WikiLinks]] (ignore Aliases for parsing targets for now, although we should support [[Target|Alias]])
    const linkRegex = /\[\[(.*?)\]\]/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      const rawLink = linkMatch[1].trim();
      const targetTitle = rawLink.split('|')[0].trim(); // Handle [[Title|Alias]]
      if (targetTitle) {
        links.push(targetTitle);
      }
    }

    // Extract #tags
    const tagRegex = /(?:\s|^)(#[a-zA-Z0-9_-]+)/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(content)) !== null) {
      tags.push(tagMatch[1].toLowerCase());
    }

    return {
      links: [...new Set(links)], // unique links
      tags: [...new Set(tags)] // unique tags
    };
  }
}
