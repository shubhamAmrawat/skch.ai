import type { ReactNode } from 'react';

interface Token { text: string; className: string; }

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    const keywordMatch = remaining.match(/^(import|export|from|const|function|return|default|let|var|if|else|for|while|switch|case|break|continue|new|typeof|instanceof|void|null|undefined|true|false|try|catch|finally|throw|async|await|class|extends|super|this|yield|of|in)\b/);
    if (keywordMatch) {
      tokens.push({ text: keywordMatch[0], className: 'text-indigo-600' });
      remaining = remaining.slice(keywordMatch[0].length);
      continue;
    }

    const stringMatch = remaining.match(/^(["'`])[^"'`]*\1/);
    if (stringMatch) {
      tokens.push({ text: stringMatch[0], className: 'text-emerald-600' });
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    const jsxTagMatch = remaining.match(/^<\/?([A-Z][A-Za-z]*)/);
    if (jsxTagMatch) {
      tokens.push({ text: '<', className: 'text-slate-500' });
      if (jsxTagMatch[0].startsWith('</')) {
        tokens.push({ text: '/', className: 'text-slate-500' });
      }
      tokens.push({ text: jsxTagMatch[1], className: 'text-cyan-600' });
      remaining = remaining.slice(jsxTagMatch[0].length);
      continue;
    }

    const htmlTagMatch = remaining.match(/^<\/?([a-z][a-z0-9]*)/);
    if (htmlTagMatch) {
      tokens.push({ text: '<', className: 'text-slate-500' });
      if (htmlTagMatch[0].startsWith('</')) {
        tokens.push({ text: '/', className: 'text-slate-500' });
      }
      tokens.push({ text: htmlTagMatch[1], className: 'text-pink-600' });
      remaining = remaining.slice(htmlTagMatch[0].length);
      continue;
    }

    const attrMatch = remaining.match(/^(className|onClick|onChange|onSubmit|onKeyDown|style|href|src|alt|type|value|placeholder|disabled|checked|name|id|htmlFor|ref|key|children|aria-[a-z]+|data-[a-z-]+)=/);
    if (attrMatch) {
      tokens.push({ text: attrMatch[1], className: 'text-amber-600' });
      tokens.push({ text: '=', className: 'text-slate-500' });
      remaining = remaining.slice(attrMatch[0].length);
      continue;
    }

    const commentMatch = remaining.match(/^(\/\/.*$|\/\*[\s\S]*?\*\/)/m);
    if (commentMatch && remaining.indexOf(commentMatch[0]) === 0) {
      tokens.push({ text: commentMatch[0], className: 'text-slate-400 italic' });
      remaining = remaining.slice(commentMatch[0].length);
      continue;
    }

    const numberMatch = remaining.match(/^(\d+\.?\d*)/);
    if (numberMatch) {
      tokens.push({ text: numberMatch[0], className: 'text-orange-500' });
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    tokens.push({ text: remaining[0], className: 'text-slate-700' });
    remaining = remaining.slice(1);
  }

  return tokens;
}

export function formatCodeWithHighlighting(code: string): ReactNode {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    const tokens = tokenizeLine(line);
    return (
      <div key={i} className="flex hover:bg-slate-100/80 -mx-4 px-4 transition-colors">
        <span className="w-10 text-slate-400 select-none text-right pr-4 text-xs leading-relaxed">
          {i + 1}
        </span>
        <span className="flex-1">
          {tokens.map((token, j) => (
            <span key={j} className={token.className}>{token.text}</span>
          ))}
        </span>
      </div>
    );
  });
}
