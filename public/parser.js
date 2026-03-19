/**
 * YomiWiki Core Parser (V4 Advanced)
 * Decodes wiki markup into HTML with high precision.
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
    
    // --- 1. Collection Phase (Preserve special blocks) ---
    const infoboxes = [];
    const clinicalBlocks = [];
    const codeBlocks = [];

    // Infobox (V2 Enhanced with Image support)
    content = content.replace(/\{\{infobox([\s\S]*?)\}\}/g, (match, body) => {
        const num = infoboxes.length;
        const rows = body.split('|').map(r => r.trim()).filter(r => r);
        let title = "ARCHIVAL_DATA";
        const data = [];
        rows.forEach(row => {
            if (row.includes('=')) {
                const parts = row.split('=');
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                if (key.toLowerCase() === 'title') title = val;
                else data.push({ key, val });
            }
        });
        infoboxes.push({ title, data });
        return `%%%INFOBOX_${num}%%%`;
    });

    // Clinical Blocks
    content = content.replace(/\[CLINICAL\]([\s\S]*?)\[\/CLINICAL\]/g, (match, body) => {
        const num = clinicalBlocks.length;
        clinicalBlocks.push(body.trim());
        return `%%%CLINICAL_${num}%%%`;
    });

    // Code Blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const num = codeBlocks.length;
        codeBlocks.push({ lang: lang || 'plaintext', code: code.trim() });
        return `%%%CODE_${num}%%%`;
    });

    // --- 2. Text Formatting & Headers ---
    let html = escapeHTML(content);

    // Markdown Bold/Italic/Stroke
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/__(.*?)__/g, '<b>$1</b>');
    html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
    html = html.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<i>$1</i>');
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    const headers = [];
    
    // Markdown Headers
    html = html.replace(/^(#{1,6})\s+(.*?)$/gm, (match, hashes, title) => {
        const level = hashes.length;
        const cleanTitle = title.trim();
        const id = "section-" + cleanTitle.replace(/[_\s]+/g, '-').toLowerCase();
        headers.push({ level, title: cleanTitle, id });
        return `<h${level} id="${id}">${cleanTitle}</h${level}>`;
    });

    // Wiki Headers
    html = html.replace(/^(={2,})\s*(.*?)\s*\1$/gm, (match, p1, p2) => {
        const level = p1.length;
        const title = p2.trim();
        const id = "section-" + title.replace(/[_\s]+/g, '-').toLowerCase();
        headers.push({ level, title, id });
        return `<h${level} id="${id}">${title}</h${level}>`;
    });

    // --- 3. Footnotes (High Precision / Non-Greedy) ---
    const footnotes = [];
    html = html.replace(/\[\* (.*?)\]/g, (match, fnContent) => {
        const num = footnotes.length + 1;
        const cleanContent = fnContent.trim();
        footnotes.push(cleanContent);
        return `<sup><a id="fn-ref-${num}" href="#fn-${num}" class="footnote-link" data-tooltip="FOOTNOTE: ${escapeHTML(cleanContent)}">[${num}]</a></sup>`;
    });

    // --- 4. Links & Lists & Tables ---
    // Wiki Links (V4 Enhanced with Data-Title)
    html = html.replace(/\[\[([^|\]]+)\]\]/g, (match, title) => {
        const cleanTitle = title.trim();
        const slug = cleanTitle.replace(/[_\s]+/g, '_');
        return `<a href="/w/${encodeURIComponent(slug)}" class="wiki-link" data-title="${escapeHTML(cleanTitle)}">${escapeHTML(cleanTitle)}</a>`;
    });
    html = html.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (match, title, alias) => {
        const cleanTitle = title.trim();
        const slug = cleanTitle.replace(/[_\s]+/g, '_');
        return `<a href="/w/${encodeURIComponent(slug)}" class="wiki-link" data-title="${escapeHTML(cleanTitle)}">${escapeHTML(alias)}</a>`;
    });

    // External Links
    html = html.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, '<a href="$1" class="external-link" target="_blank" rel="noopener noreferrer">$2</a>');
    
    // Process lines for Lists, Tables, and Blockquotes
    const lines = html.split('\n');
    let finalHtml = [];
    let listStack = [];
    let inTable = false;
    let tableHtml = "";
    
    lines.forEach(line => {
        const trimmed = line.trim();
        
        // --- Table Logic (Standard Wiki Syntax) ---
        if (trimmed.startsWith('{|')) {
            inTable = true;
            tableHtml = '<table class="wikitable clinical-table">';
            return;
        } else if (trimmed.startsWith('|}')) {
            inTable = false;
            tableHtml += '</table>';
            finalHtml.push(tableHtml);
            tableHtml = "";
            return;
        } else if (inTable) {
            if (trimmed.startsWith('|+')) {
                tableHtml += `<caption>${trimmed.substring(2).trim()}</caption>`;
            } else if (trimmed.startsWith('|-')) {
                tableHtml += '<tr>';
            } else if (trimmed.startsWith('!')) {
                const cells = trimmed.substring(1).split('!!');
                cells.forEach(c => tableHtml += `<th>${wikiParse(c.trim())}</th>`);
            } else if (trimmed.startsWith('|')) {
                const cells = trimmed.substring(1).split('||');
                cells.forEach(c => tableHtml += `<td>${wikiParse(c.trim())}</td>`);
            }
            return;
        }

        // --- List Logic ---
        const listMatch = line.match(/^([\*\#]+)\s*(.*)$/);
        if (listMatch) {
            const prefix = listMatch[1];
            const itemContent = listMatch[2];
            const depth = prefix.length;
            const type = prefix[depth-1] === '*' ? 'ul' : 'ol';
            
            while (listStack.length > depth) finalHtml.push(`</${listStack.pop()}>`);
            while (listStack.length < depth) {
                listStack.push(type);
                finalHtml.push(`<${type}>`);
            }
            finalHtml.push(`<li>${itemContent}</li>`);
        } else {
            while (listStack.length > 0) finalHtml.push(`</${listStack.pop()}>`);
            if (trimmed.startsWith('----')) finalHtml.push('<hr>');
            else if (line.trim()) finalHtml.push(line + '<br>');
        }
    });
    let parsedContent = finalHtml.join('');

    // --- 5. TOC Generation (Logical Hierarchical Numbering) ---
    if (headers.length >= 3) {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        let lastLevel = 0;
        
        let tocHtml = `
            <div class="wiki-toc">
                <div class="toc-title">CONTENTS <span class="toc-toggle" onclick="window.toggleTOC()">[hide]</span></div>
                <ul id="toc-list">
                    ${headers.map(h => {
                        const level = h.level;
                        if (level > lastLevel) {
                            // Going deeper: don't reset current level yet, it will be incremented
                        } else if (level < lastLevel) {
                            // Going shallower: reset all levels deeper than current
                            for (let i = level + 1; i < counts.length; i++) counts[i] = 0;
                        }
                        counts[level]++;
                        lastLevel = level;
                        
                        // Generate number string (e.g., 1.2.1)
                        const numberStr = counts.slice(1, level + 1).filter(n => n > 0).join('.') + '.';
                        return `<li class="toc-level-${level}"><a href="#${h.id}"><span class="toc-number">${numberStr}</span> ${escapeHTML(h.title)}</a></li>`;
                    }).join('')}
                </ul>
            </div>
        `;
        parsedContent = tocHtml + parsedContent;
    }

    // --- 6. Footnote List Injection ---
    if (footnotes.length > 0) {
        let fnHtml = `
            <div class="wiki-footnotes">
                <div class="footnotes-title">[ARCHIVAL_FOOTNOTES]</div>
                <ol>
                    ${footnotes.map((content, i) => {
                        const num = i + 1;
                        return `<li id="fn-${num}">${content} <a href="#fn-ref-${num}" class="footnote-backlink">↩</a></li>`;
                    }).join('')}
                </ol>
            </div>
        `;
        parsedContent += fnHtml;
    }

    // --- 7. Injection Phase (Restore special blocks) ---
    parsedContent = parsedContent.replace(/%%%CLINICAL_(\d+)%%%/g, (match, num) => {
        return `<div class="clinical-report-block">
            <div class="clinical-report-header">[OFFICIAL_CLINICAL_RECORD]</div>
            <div class="clinical-report-content">${wikiParse(clinicalBlocks[num])}</div>
            <div class="clinical-report-footer">VALIDATED_BY_ARCHIVE_SYSTEM</div>
        </div>`;
    });

    parsedContent = parsedContent.replace(/%%%INFOBOX_(\d+)%%%/g, (match, num) => {
        const info = infoboxes[num];
        let bodyHtml = "";
        info.data.forEach(item => {
            const key = item.key.toLowerCase();
            if (key === 'image') {
                bodyHtml += `<tr><td colspan="2" class="infobox-image-cell"><img src="${encodeURI(item.val)}" class="wiki-image"></td></tr>`;
            } else if (key === 'caption') {
                bodyHtml += `<tr><td colspan="2" class="infobox-caption-cell">${escapeHTML(item.val)}</td></tr>`;
            } else {
                bodyHtml += `<tr><th>${escapeHTML(item.key)}</th><td>${wikiParse(item.val)}</td></tr>`;
            }
        });
        return `<aside class="infobox"><div class="infobox-title">${escapeHTML(info.title)}</div><table>${bodyHtml}</table></aside>`;
    });

    parsedContent = parsedContent.replace(/%%%CODE_(\d+)%%%/g, (match, num) => {
        const block = codeBlocks[num];
        return `<pre class="wiki-code"><code>${escapeHTML(block.code)}</code></pre>`;
    });

    return parsedContent;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { wikiParse, escapeHTML };
}
