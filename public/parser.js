/**
 * YomiWiki Core Parser
 * Decodes wiki markup into HTML.
 */

function escapeHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function wikiParse(content) {
    if (!content) return "";
    
    // 23. Infobox Collection
    const infoboxes = [];
    content = content.replace(/\{\{infobox([\s\S]*?)\}\}/g, (match, body) => {
        const num = infoboxes.length;
        const rows = body.split('|').map(r => r.trim()).filter(r => r);
        let title = "ARCHIVAL_DATA";
        const data = [];
        rows.forEach(row => {
            if (row.includes('=')) {
                const [key, val] = row.split('=').map(s => s.trim());
                if (key.toLowerCase() === 'title') title = val;
                else data.push({ key, val });
            }
        });
        infoboxes.push({ title, data });
        return `%%%INFOBOX_${num}%%%`;
    });

    // 87. External Media Collection
    const mediaBlocks = [];
    content = content.replace(/\[\[YouTube:([^|\]]+)\]\]/g, (match, id) => {
        const num = mediaBlocks.length;
        mediaBlocks.push({ type: 'youtube', id: id.trim() });
        return `%%%MEDIA_${num}%%%`;
    });
    content = content.replace(/\[\[SoundCloud:([^|\]]+)\]\]/g, (match, id) => {
        const num = mediaBlocks.length;
        mediaBlocks.push({ type: 'soundcloud', id: id.trim() });
        return `%%%MEDIA_${num}%%%`;
    });

    // 85. Clinical Report Block Collection (SCP-style)
    const clinicalBlocks = [];
    content = content.replace(/\[CLINICAL\]([\s\S]*?)\[\/CLINICAL\]/g, (match, body) => {
        const num = clinicalBlocks.length;
        clinicalBlocks.push(body.trim());
        return `%%%CLINICAL_${num}%%%`;
    });

    // 84. Code Block Collection (highlight.js)
    const codeBlocks = [];
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const num = codeBlocks.length;
        codeBlocks.push({ lang: lang || 'plaintext', code: code.trim() });
        return `%%%CODE_${num}%%%`;
    });

    // 83. Math Collection (KaTeX)
    const mathBlocks = [];
    content = content.replace(/<math(?:\s+display="([^"]+)")?>([\s\S]*?)<\/math>/g, (match, display, mathStr) => {
        const num = mathBlocks.length;
        mathBlocks.push({ display: display === 'block', mathStr });
        return `%%%MATH_${num}%%%`;
    });
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathStr) => {
        const num = mathBlocks.length;
        mathBlocks.push({ display: true, mathStr });
        return `%%%MATH_${num}%%%`;
    });

    // 93. Markdown Compatibility Pre-processing
    // Links: [label](url)
    content = content.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '[$2 $1]');
    // Horizontal Rules: ---
    content = content.replace(/^---$/gm, '----');

    let html = escapeHTML(content);

    // 93. Markdown Compatibility (Text Decoration)
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/__(.*?)__/g, '<b>$1</b>');
    // Italic: *text* or _text_
    html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
    html = html.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<i>$1</i>');
    // Strikethrough: ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // 93. Markdown Headers: # Header
    const headers = [];
    html = html.replace(/^(#{1,6})\s+(.*?)$/gm, (match, hashes, title) => {
        const level = hashes.length;
        const cleanTitle = title.trim();
        const id = cleanTitle.replace(/[_\s]+/g, '_').toLowerCase();
        headers.push({ level, title: cleanTitle, id });
        return `<h${level} id="${id}">${cleanTitle}</h${level}>`;
    });

    // 59. Footnotes collection [* text]
    const footnotes = [];
    html = html.replace(/\[\* (.*?)\]/g, (match, fnContent) => {
        const num = footnotes.length + 1;
        footnotes.push(fnContent.trim());
        return `<sup><a href="#fn-${num}" id="fnref-${num}" class="footnote-link" data-tooltip="FOOTNOTE: ${escapeHTML(fnContent.trim())}">[${num}]</a></sup>`;
    });

    // 57. Headers and TOC collection (Wiki Syntax)
    html = html.replace(/^(={2,})\s*(.*?)\s*\1$/gm, (match, p1, p2) => {
        const level = p1.length;
        const title = p2.trim();
        const id = title.replace(/[_\s]+/g, '_').toLowerCase();
        headers.push({ level, title, id });
        return `<h${level} id="${id}">${title}</h${level}>`;
    });

    // 1. Text Formatting (Wiki Syntax)
    html = html.replace(/'''(.*?)'''/g, '<b>$1</b>');
    html = html.replace(/''(.*?)''/g, '<i>$1</i>');

    // 2. Internal Links [[Title]] or [[Title|Alias]]
    html = html.replace(/\[\[([^|\]]+)\]\]/g, (match, title) => {
        const slug = title.trim().replace(/[_\s]+/g, '_');
        return `<a href="/w/${encodeURIComponent(slug)}" class="wiki-link" data-tooltip="ARCHIVAL_NODE: ${escapeHTML(title.trim())}">${escapeHTML(title)}</a>`;
    });
    html = html.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (match, title, alias) => {
        const slug = title.trim().replace(/[_\s]+/g, '_');
        return `<a href="/w/${encodeURIComponent(slug)}" class="wiki-link" data-tooltip="ARCHIVAL_NODE: ${escapeHTML(title.trim())}">${escapeHTML(alias)}</a>`;
    });

    // 2.1 External Links [url Label] or [url]
    html = html.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, '<a href="$1" class="external-link" target="_blank" rel="noopener noreferrer">$2</a>');
    html = html.replace(/\[(https?:\/\/[^\s\]]+)\]/g, '<a href="$1" class="external-link" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // 2.2 Raw URLs
    html = html.replace(/(?<!href=")(https?:\/\/[^\s<]+)/g, (match) => {
        if (match.endsWith(']') || match.endsWith(')')) return match; 
        return `<a href="${match}" class="external-link" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

    // 2.3 Images [[File:URL|options]]
    html = html.replace(/\[\[File:([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, url, options) => {
        const params = {};
        if (options) {
            options.split('|').forEach(opt => {
                if (opt.includes('=')) {
                    const [key, val] = opt.split('=');
                    params[key.trim()] = val.trim();
                } else {
                    params[opt.trim()] = true;
                }
            });
        }

        let altText = params.alt || "";
        if (!altText) {
            const filename = url.split('/').pop().split('?')[0];
            altText = `ARCHIVAL_IMAGE: ${filename.replace(/[-_]/g, ' ').split('.')[0]}`;
        }

        const width = params.width ? `width="${escapeHTML(params.width)}"` : 'style="max-width:100%;"';
        const imgHtml = `<img src="${encodeURI(url.trim())}" alt="${escapeHTML(altText)}" class="wiki-image" ${width}>`;
        
        return `<div class="media-container">${imgHtml}${params.caption ? `<div class="media-caption">${escapeHTML(params.caption)}</div>` : ''}</div>`;
    });

    // 3. Tables and Lists
    const lines = html.split('\n');
    let inTable = false;
    let inQuote = false;
    let tableHtml = "";
    let finalHtml = [];
    let listStack = [];

    function closeLists(toDepth = 0) {
        while (listStack.length > toDepth) {
            const type = listStack.pop();
            finalHtml.push(`</${type}>`);
        }
    }

    function closeQuote() {
        if (inQuote) {
            finalHtml.push('</blockquote>');
            inQuote = false;
        }
    }

    lines.forEach(line => {
        const trimmed = line.trim();
        const listMatch = line.match(/^([\*\#]+)\s*(.*)$/);
        const quoteMatch = line.match(/^>\s*(.*)$/);

        if (listMatch) {
            closeQuote();
            const prefix = listMatch[1];
            const itemContent = listMatch[2];
            const depth = prefix.length;

            if (listStack.length > depth) {
                closeLists(depth);
            }

            for (let i = 0; i < depth; i++) {
                const type = prefix[i] === '*' ? 'ul' : 'ol';
                if (i < listStack.length) {
                    if (listStack[i] !== type) {
                        closeLists(i);
                        listStack.push(type);
                        finalHtml.push(`<${type}>`);
                    }
                } else {
                    listStack.push(type);
                    finalHtml.push(`<${type}>`);
                }
            }
            finalHtml.push(`<li>${itemContent}</li>`);
        } else if (quoteMatch) {
            closeLists();
            if (!inQuote) {
                finalHtml.push('<blockquote>');
                inQuote = true;
            }
            finalHtml.push(quoteMatch[1] + '<br>');
        } else {
            closeLists();
            closeQuote();

            if (trimmed.startsWith('{|')) {
                inTable = true;
                tableHtml = '<table class="wikitable clinical-table">';
            } else if (trimmed.startsWith('|}')) {
                inTable = false;
                tableHtml += '</table>';
                finalHtml.push(tableHtml);
                tableHtml = "";
            } else if (inTable) {
                if (trimmed.startsWith('|+')) {
                    tableHtml += `<caption>${trimmed.substring(2).trim()}</caption>`;
                } else if (trimmed.startsWith('|-')) {
                    tableHtml += '<tr>';
                } else if (trimmed.startsWith('!')) {
                    const cells = trimmed.substring(1).split('!!');
                    cells.forEach(c => tableHtml += `<th>${c.trim()}</th>`);
                } else if (trimmed.startsWith('|')) {
                    const cells = trimmed.substring(1).split('||');
                    cells.forEach(c => tableHtml += `<td>${c.trim()}</td>`);
                }
            } else if (trimmed.startsWith('----')) {
                finalHtml.push('<hr>');
            } else {
                finalHtml.push(line + '<br>');
            }
        }
    });
    closeLists();
    closeQuote();

    let parsedContent = finalHtml.join('');

    // 23. Infobox Injection
    parsedContent = parsedContent.replace(/%%%INFOBOX_(\d+)%%%/g, (match, num) => {
        const info = infoboxes[num];
        if (!info) return match;
        let table = `<aside class="infobox">
            <div class="infobox-title">${escapeHTML(info.title)}</div>
            <table>`;
        
        info.data.forEach(item => {
            if (item.key.toLowerCase() === 'image') {
                table += `<tr><td colspan="2" style="text-align:center; padding:15px; border-bottom:1px solid #222;"><img src="${encodeURI(item.val)}" class="wiki-image" style="max-width:100%; height:auto; border:1px solid #333;"></td></tr>`;
            } else if (item.key.toLowerCase() === 'caption') {
                table += `<tr><td colspan="2" style="text-align:center; font-size:0.75rem; color:var(--text-muted); padding:5px 15px 15px 15px; border-bottom:1px solid #222;">${escapeHTML(item.val)}</td></tr>`;
            } else {
                table += `<tr><th>${escapeHTML(item.key)}</th><td>${wikiParse(item.val)}</td></tr>`;
            }
        });
        
        table += `</table></aside>`;
        return table;
    });

    // 57. TOC Injection
    if (headers.length >= 3) {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        let lastLevel = 1;
        
        let tocHtml = `
            <div class="toc">
                <div class="toc-title">
                    CONTENTS <span class="toc-toggle" onclick="window.toggleTOC()">[hide]</span>
                </div>
                <ul id="toc-list">
                    ${headers.map(h => {
                        const level = h.level;
                        if (level > lastLevel) {
                            // Reset lower levels
                            for (let i = level; i < counts.length; i++) counts[i] = 0;
                        } else if (level < lastLevel) {
                            // Reset lower levels
                            for (let i = level + 1; i < counts.length; i++) counts[i] = 0;
                        }
                        counts[level]++;
                        lastLevel = level;
                        
                        const numberStr = counts.slice(2, level + 1).join('.');
                        return `<li class="toc-level-${level}"><a href="#${h.id}"><span class="toc-number">${numberStr}</span> ${escapeHTML(h.title)}</a></li>`;
                    }).join('')}
                </ul>
            </div>
        `;
        parsedContent = tocHtml + parsedContent;
    }

    // 59. Footnote List Injection
    if (footnotes.length > 0) {
        let fnHtml = `
            <div class="footnotes-section" style="margin-top:50px; border-top:1px solid #333; padding-top:20px;">
                <div style="font-size:0.8rem; color:#666; margin-bottom:10px; font-family:var(--font-mono);">[ARCHIVAL_FOOTNOTES]</div>
                <ol style="font-size:0.85rem; color:var(--text-main); line-height:1.6;">
                    ${footnotes.map((content, i) => `
                        <li id="fn-${i+1}">
                            ${wikiParse(content)} 
                            <a href="#fnref-${i+1}" style="color:var(--accent-orange); text-decoration:none; margin-left:5px;">↩</a>
                        </li>
                    `).join('')}
                </ol>
            </div>
        `;
        parsedContent += fnHtml;
    }

    // 83. Math Injection
    parsedContent = parsedContent.replace(/%%%MATH_(\d+)%%%/g, (match, num) => {
        const block = mathBlocks[num];
        if (!block) return match;
        try {
            if (typeof katex !== 'undefined') {
                return katex.renderToString(block.mathStr, {
                    displayMode: block.display,
                    throwOnError: false
                });
            } else {
                return `<span class="math-fallback" style="font-family:var(--font-mono); color:var(--accent-cyan);">[MATH: ${escapeHTML(block.mathStr)}]</span>`;
            }
        } catch (e) {
            return `<span class="math-error" style="color:var(--hazard-red);">[MATH_ERROR: ${escapeHTML(e.message)}]</span>`;
        }
    });

    // 84. Code Block Injection
    parsedContent = parsedContent.replace(/%%%CODE_(\d+)%%%/g, (match, num) => {
        const block = codeBlocks[num];
        if (!block) return match;
        let highlighted;
        if (typeof hljs !== 'undefined') {
            try {
                if (block.lang === 'plaintext') {
                    highlighted = hljs.highlightAuto(block.code).value;
                } else {
                    highlighted = hljs.highlight(block.code, { language: block.lang }).value;
                }
            } catch (e) {
                highlighted = escapeHTML(block.code);
            }
        } else {
            highlighted = escapeHTML(block.code);
        }
        return `<pre style="background:#111; padding:15px; border:1px solid #333; overflow-x:auto; margin:15px 0;"><code class="hljs language-${block.lang}">${highlighted}</code></pre>`;
    });

    // 85. Clinical Block Injection
    parsedContent = parsedContent.replace(/%%%CLINICAL_(\d+)%%%/g, (match, num) => {
        const body = clinicalBlocks[num];
        if (body === undefined) return match;
        return `<div class="clinical-report-block">
            <div class="clinical-report-header">[OFFICIAL_CLINICAL_RECORD]</div>
            <div class="clinical-report-content">${wikiParse(body)}</div>
            <div class="clinical-report-footer">VALIDATED_BY_ARCHIVE_SYSTEM</div>
        </div>`;
    });

    // 87. External Media Injection
    parsedContent = parsedContent.replace(/%%%MEDIA_(\d+)%%%/g, (match, num) => {
        const media = mediaBlocks[num];
        if (!media) return match;
        if (media.type === 'youtube') {
            return `<div class="external-media-container youtube-embed" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; margin:20px 0;">
                <iframe src="https://www.youtube.com/embed/${escapeHTML(media.id)}" style="position:absolute; top:0; left:0; width:100%; height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`;
        } else if (media.type === 'soundcloud') {
            return `<div class="external-media-container soundcloud-embed" style="margin:20px 0;">
                <iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${escapeHTML(media.id)}&color=%23ff9900&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>
            </div>`;
        }
        return match;
    });

    return parsedContent;
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { wikiParse, escapeHTML };
}
