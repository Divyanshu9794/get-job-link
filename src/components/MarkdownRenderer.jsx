/**
 * Parses inline markdown:
 * - **bold** -> <strong>
 * - *italic* -> <em>
 * - `code` -> <code>
 */
function renderInline(text) {
  if (!text) return null;

  // Pattern matches **bold**, *italic*, and `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Production-ready, zero-dependency Markdown Renderer for Career Guides.
 * Renders headings (###, ####), lists, blockquotes, horizontal rules, and paragraphs.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let currentList = null; // { type: 'ul' | 'ol', items: [] }

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type;
    const items = currentList.items;
    const key = `list-${elements.length}`;

    if (ListTag === "ul") {
      elements.push(
        <ul key={key} className="space-y-2 my-4 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={key} className="space-y-2 my-4 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs shrink-0 mt-0.5">
                {idx + 1}.
              </span>
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    // Empty line: flush list
    if (!line) {
      flushList();
      return;
    }

    // Horizontal Rule
    if (line === "---" || line === "***") {
      flushList();
      elements.push(
        <hr key={`hr-${index}`} className="my-8 border-slate-200/90 dark:border-slate-800" />
      );
      return;
    }

    // Heading 3: ### Heading
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight pt-5 pb-1 mt-3 flex items-center space-x-2"
        >
          <span>{renderInline(line.slice(4))}</span>
        </h3>
      );
      return;
    }

    // Heading 4: #### Heading
    if (line.startsWith("#### ")) {
      flushList();
      elements.push(
        <h4
          key={`h4-${index}`}
          className="text-sm sm:text-base font-bold text-slate-900 dark:text-blue-300 tracking-tight pt-3 pb-0.5 mt-2 text-blue-900"
        >
          {renderInline(line.slice(5))}
        </h4>
      );
      return;
    }

    // Blockquote: > Quote
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-4 border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 p-4 my-4 rounded-r-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic shadow-2xs"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      return;
    }

    // Unordered List Item: - item or * item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const itemText = line.slice(2);
      if (currentList && currentList.type === "ul") {
        currentList.items.push(itemText);
      } else {
        flushList();
        currentList = { type: "ul", items: [itemText] };
      }
      return;
    }

    // Ordered List Item: 1. item
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      const itemText = olMatch[2];
      if (currentList && currentList.type === "ol") {
        currentList.items.push(itemText);
      } else {
        flushList();
        currentList = { type: "ol", items: [itemText] };
      }
      return;
    }

    // Standard Paragraph
    flushList();
    elements.push(
      <p
        key={`p-${index}`}
        className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-2.5 font-sans"
      >
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
}
