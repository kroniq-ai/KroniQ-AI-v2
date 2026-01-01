import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isDark?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isDark = true }) => {
  const parseMarkdown = (text: string) => {
    // Pre-process: Convert inline numbered lists to proper line breaks
    // Handles patterns like "1) text 2) text 3) text" -> proper line breaks
    let processedText = text;

    // Fix inline numbered lists: "1) foo 2) bar 3) baz" -> separate lines
    processedText = processedText.replace(/(\d+)\)\s+([^0-9]+?)(?=\s+\d+\)|$)/g, (match, num, content) => {
      return `${num}) ${content.trim()}\n`;
    });

    // Fix inline bullet points: "• foo • bar" or "- foo - bar" when on same line
    processedText = processedText.replace(/([•\-\*])\s+([^•\-\*\n]+?)(?=\s*[•\-\*]\s|$)/g, (match, bullet, content) => {
      return `${bullet} ${content.trim()}\n`;
    });

    const elements: JSX.Element[] = [];
    const lines = processedText.split('\n');
    let currentList: string[] = [];
    let currentOrderedList: string[] = [];
    let currentTable: string[][] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';

    // Premium color scheme
    const colors = isDark ? {
      h1: 'text-white',
      h2: 'text-white',
      h3: 'text-white/95',
      h4: 'text-white/90',
      text: 'text-white/75',
      muted: 'text-white/60',
      accent: 'text-teal-400',
      accentHover: 'hover:text-teal-300',
      link: 'text-teal-400 hover:text-teal-300',
      linkBg: 'bg-teal-500/10 hover:bg-teal-500/20',
      codeBg: 'bg-white/5',
      codeText: 'text-teal-300',
      blockquoteBorder: 'border-teal-500/40',
      blockquoteBg: 'bg-teal-500/5',
      tableBorder: 'border-white/10',
      tableHeaderBg: 'bg-white/5',
      strong: 'text-white font-semibold',
    } : {
      h1: 'text-gray-900',
      h2: 'text-gray-900',
      h3: 'text-gray-800',
      h4: 'text-gray-700',
      text: 'text-gray-600',
      muted: 'text-gray-500',
      accent: 'text-teal-600',
      accentHover: 'hover:text-teal-700',
      link: 'text-teal-600 hover:text-teal-700',
      linkBg: 'bg-teal-50 hover:bg-teal-100',
      codeBg: 'bg-gray-100',
      codeText: 'text-teal-700',
      blockquoteBorder: 'border-teal-400',
      blockquoteBg: 'bg-teal-50',
      tableBorder: 'border-gray-200',
      tableHeaderBg: 'bg-gray-50',
      strong: 'text-gray-900 font-semibold',
    };

    const flushOrderedList = () => {
      if (currentOrderedList.length > 0) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-4 ml-5 space-y-2">
            {currentOrderedList.map((item, i) => (
              <li key={i} className={`${colors.text} text-sm leading-relaxed flex`}>
                <span className={`${colors.accent} font-medium mr-3 flex-shrink-0`}>{i + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              </li>
            ))}
          </ol>
        );
        currentOrderedList = [];
      }
    };

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-4 ml-5 space-y-2">
            {currentList.map((item, i) => (
              <li key={i} className={`${colors.text} text-sm leading-relaxed flex items-start`}>
                <span className={`${colors.accent} mr-3 mt-1.5 flex-shrink-0`}>
                  <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                </span>
                <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="my-6 overflow-x-auto rounded-lg border ${colors.tableBorder}">
            <table className="min-w-full text-sm">
              <thead className={`${colors.tableHeaderBg}`}>
                <tr>
                  {currentTable[0].map((cell, i) => (
                    <th key={i} className={`px-4 py-3 text-left font-semibold ${colors.h4} border-b ${colors.tableBorder}`}>
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTable.slice(1).map((row, i) => (
                  <tr key={i} className={`border-b ${colors.tableBorder} hover:bg-white/5 transition-colors`}>
                    {row.map((cell, j) => (
                      <td key={j} className={`px-4 py-3 ${colors.text}`}>
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        currentTable = [];
      }
    };

    const parseInline = (text: string): string => {
      return text
        // Bold - prominent with larger size
        .replace(/\*\*(.+?)\*\*/g, `<strong class="${colors.strong} text-lg">\$1</strong>`)
        // Italic
        .replace(/\*(.+?)\*/g, '<em class="italic">\$1</em>')
        // Inline code - subtle pill
        .replace(/`(.+?)`/g, `<code class="px-1.5 py-0.5 ${colors.codeBg} ${colors.codeText} rounded text-xs font-mono">\$1</code>`)
        // Links - highlighted with background
        .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="\$2" class="${colors.link} ${colors.linkBg} px-1 py-0.5 rounded font-medium underline decoration-1 underline-offset-2 transition-all" target="_blank" rel="noopener noreferrer">\$1</a>`)
        // Underline
        .replace(/__(.+?)__/g, '<u class="underline decoration-2 underline-offset-2">\$1</u>');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${elements.length}`} className={`my-5 rounded-xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className={`${colors.codeBg} px-4 py-2 ${colors.accent} text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {codeLanguage || 'Code'}
              </div>
              <pre className={`${isDark ? 'bg-black/40' : 'bg-gray-50'} p-4 overflow-x-auto`}>
                <code className={`text-xs ${colors.text} font-mono leading-relaxed`}>{codeContent.trim()}</code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeContent = '';
          codeLanguage = '';
        } else {
          flushList();
          flushOrderedList();
          flushTable();
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }

      // Tables
      if (line.match(/^\|(.+)\|$/)) {
        flushList();
        flushOrderedList();
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
        if (!line.includes('---')) {
          currentTable.push(cells);
        }
        continue;
      } else {
        flushTable();
      }

      // Ordered lists - but check if it's actually a section header first
      const orderedListMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (orderedListMatch) {
        const itemContent = orderedListMatch[2];
        // Detect if this is a section header (ends with colon or is short title-like)
        const isSectionHeader = itemContent.match(/^[A-Z][^.!?]{0,50}:?\s*$/) ||
          itemContent.match(/^[A-Z][^.!?]{0,40}$/) ||
          itemContent.endsWith(':');

        if (isSectionHeader && itemContent.length < 60) {
          // Render as H3 subsection
          elements.push(
            <h3
              key={`section-${elements.length}`}
              className={`text-xl md:text-2xl font-semibold ${colors.h3} mt-8 mb-3 leading-snug flex items-baseline gap-2`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className={`${colors.accent}`}>{orderedListMatch[1]}.</span>
              {itemContent.replace(/:$/, '')}
            </h3>
          );
          continue;
        } else {
          // Regular ordered list item
          flushList();
          currentOrderedList.push(itemContent);
          continue;
        }
      } else {
        flushOrderedList();
      }

      // Unordered lists
      if (line.match(/^[-*]\s+/)) {
        const content = line.replace(/^[-*]\s+/, '');
        currentList.push(content);
        continue;
      } else {
        flushList();
      }

      // **Bold section headers** like "**Thermodynamics:**" or "**Key Points:**"
      const boldHeaderMatch = line.match(/^\*\*([^*]+):\*\*\s*$/);
      if (boldHeaderMatch) {
        elements.push(
          <h3
            key={`bold-header-${elements.length}`}
            className={`text-xl md:text-2xl font-bold ${colors.h3} mt-8 mb-3 leading-snug`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {boldHeaderMatch[1]}
          </h3>
        );
        continue;
      }

      // Roman numeral sections like "I. Structure" or "II. Physics"
      const romanNumeralMatch = line.match(/^([IVXLC]+)\.\s+(.+)/);
      if (romanNumeralMatch) {
        elements.push(
          <h3
            key={`roman-${elements.length}`}
            className={`text-xl md:text-2xl font-semibold ${colors.h3} mt-8 mb-3 leading-snug flex items-baseline gap-2`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className={`${colors.accent}`}>{romanNumeralMatch[1]}.</span>
            {romanNumeralMatch[2].replace(/:$/, '')}
          </h3>
        );
        continue;
      }

      // Numbered sections like "1) Definition & Origin" or "2) Key Physics" - treat as H2
      const numberedSectionMatch = line.match(/^(\d+)\)\s*(.+)/);
      if (numberedSectionMatch) {
        elements.push(
          <div key={`numbered-h2-${elements.length}`} className="mt-10 mb-4">
            <h2
              className={`text-2xl md:text-3xl font-bold ${colors.h2} leading-tight tracking-tight flex items-baseline gap-3`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className={`${colors.accent} text-xl`}>{numberedSectionMatch[1]})</span>
              {numberedSectionMatch[2]}
            </h2>
            <div className={`mt-2 h-1 w-16 bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full`} />
          </div>
        );
        continue;
      }

      // H1 - Main title - VERY LARGE, display font
      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={`h1-${elements.length}`}
            className={`text-4xl md:text-5xl lg:text-6xl font-black ${colors.h1} mt-10 mb-6 leading-[1.1] tracking-tight`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {line.slice(2)}
          </h1>
        );
      }
      // H2 - Section title - Large with accent bar
      else if (line.startsWith('## ')) {
        elements.push(
          <div key={`h2-wrap-${elements.length}`} className="mt-10 mb-5">
            <h2
              className={`text-2xl md:text-3xl lg:text-4xl font-bold ${colors.h2} leading-tight tracking-tight`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {line.slice(3)}
            </h2>
            <div className={`mt-2 h-1 w-16 bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full`} />
          </div>
        );
      }
      // H3 - Subsection - Medium
      else if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${elements.length}`}
            className={`text-xl md:text-2xl lg:text-3xl font-semibold ${colors.h3} mt-8 mb-4 leading-snug`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {line.slice(4)}
          </h3>
        );
      }
      // H4 - Minor heading
      else if (line.startsWith('#### ')) {
        elements.push(
          <h4
            key={`h4-${elements.length}`}
            className={`text-lg md:text-xl font-semibold ${colors.h4} mt-6 mb-3 leading-snug`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {line.slice(5)}
          </h4>
        );
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={`quote-${elements.length}`}
            className={`my-5 pl-4 py-2 border-l-3 ${colors.blockquoteBorder} ${colors.blockquoteBg} rounded-r-lg ${colors.muted} italic text-base`}
          >
            <span dangerouslySetInnerHTML={{ __html: parseInline(line.slice(2)) }} />
          </blockquote>
        );
      }
      // Horizontal rule
      else if (line.match(/^[-*_]{3,}$/)) {
        elements.push(
          <hr key={`hr-${elements.length}`} className={`my-8 border-t ${colors.tableBorder}`} />
        );
      }
      // Regular paragraph - LARGER text for readability
      else if (line.trim()) {
        elements.push(
          <p
            key={`p-${elements.length}`}
            className={`${colors.text} leading-relaxed my-4 text-base md:text-lg`}
            dangerouslySetInnerHTML={{ __html: parseInline(line) }}
          />
        );
      }
      // Empty line
      else {
        elements.push(<div key={`space-${elements.length}`} className="h-3" />);
      }
    }

    flushList();
    flushOrderedList();
    flushTable();

    return elements;
  };

  return (
    <div className="markdown-content max-w-none">
      {parseMarkdown(content)}
    </div>
  );
};
