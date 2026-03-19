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

    // Infobox (Enhanced)
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
    
    // Headers (Markdown & Wiki)
    const headerRegex = /^(#{1,6})\s+(.*?)$|^(={2,})\s*(.*?)\s*\3$/gm;
    html = html.replace(headerRegex, (match, hashes, mTitle, wikiHashes, wTitle) => {
        const level = hashes ? hashes.length : wikiHashes.length;
        const title = (mTitle || wTitle).trim();
        const id = "section-" + title.replace(/[_\s]+/g, '-').toLowerCase();
        headers.push({ level, title, id });
        return `<h${level} id="${id}">${title}</h${level}>`;
    });

    // --- 3. Footnotes ---
    const footnotes = [];
    html = html.replace(/\[\* (.*?)\]/g, (match, fnContent) => {
        const num = footnotes.length + 1;
        const cleanContent = fnContent.trim();
        footnotes.push(cleanContent);
        return `<sup><a id="fn-ref-${num}" href="#fn-${num}" class="footnote-link" data-tooltip="FOOTNOTE: ${escapeHTML(cleanContent)}">[${num}]</a></sup>`;
    });

    // --- 4. Links & Images ---
    // Wiki Links (V4 Enhanced with Data-Title)
    html = html.replace(/\[\[([^|\]]+)\]\]/g, (match, title) => {
        const slug = title.trim().replace(/[_\s]+/g, '_');
        return `<a href="/w/${encodeURIComponent(slug)}" class="wiki-link" data-title="${escapeHTML(title.trim())}">${escapeHTML(title)}</a>`;
    });
    html = html.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (match, title, alias) => {
        const slug = title.trim().replace(/[_\s]+/g, '_');
        return `<a href="/w/${encodeURIComponent(slug)}" class="wiki-link" data-title="${escapeHTML(title.trim())}">${escapeHTML(alias)}</a>`;
    });

    // Images [[File:URL|caption]]
    html = html.replace(/\[\[File:([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, url, caption) => {
        return `<div class="media-container"><img src="${encodeURI(url.trim())}" class="wiki-image">${caption ? `<div class="media-caption">${escapeHTML(caption)}</div>` : ''}</div>`;
    });

    // --- 5. Tables and Lists (Logical Processing) ---
    const lines = html.split('\n');
    let finalHtml = [];
    let listStack = [];
    let inTable = false;
    let tableHtml = "";
    
    lines.forEach(line => {
        const trimmed = line.trim();
        
        // 5.1 Tables logic
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
        } 
        // 5.2 Lists logic
        else {
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
        }
    });
    
    let parsedContent = finalHtml.join('');

    // --- 6. TOC Generation ---
    if (headers.length >= 3) {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        let lastLevel = 0;
        let tocHtml = `<div class="wiki-toc"><div class="toc-title">CONTENTS <span class="toc-toggle" onclick="window.toggleTOC()">[hide]</span></div><ul id="toc-list">`;
        
        headers.forEach(h => {
            if (h.level < lastLevel) for (let i = h.level + 1; i < counts.length; i++) counts[i] = 0;
            counts[h.level]++;
            lastLevel = h.level;
            const numberStr = counts.slice(1, h.level + 1).filter(n => n > 0).join('.') + '.';
            tocHtml += `<li class="toc-level-${h.level}"><a href="#${h.id}"><span class="toc-number">${numberStr}</span> ${escapeHTML(h.title)}</a></li>`;
        });
        
        tocHtml += `</ul></div>`;
        parsedContent = tocHtml + parsedContent;
    }

    // --- 7. Injection Phase (Restore special blocks) ---
    // Footnote List
    if (footnotes.length > 0) {
        let fnHtml = `<div class="wiki-footnotes"><div class="footnotes-title">[ARCHIVAL_FOOTNOTES]</div><ol>`;
        footnotes.forEach((content, i) => {
            const num = i + 1;
            fnHtml += `<li id="fn-${num}">${content} <a href="#fn-ref-${num}" class="footnote-backlink">↩</a></li>`;
        });
        fnHtml += `</ol></div>`;
        parsedContent += fnHtml;
    }

    // Infobox (V2 Advanced Injection)
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
                bodyHtml += `<tr><th>${escapeHTML(item.key)}</th><td>${item.val}</td></tr>`;
            }
        });
        return `<aside class="infobox"><div class="infobox-title">${escapeHTML(info.title)}</div><table>${bodyHtml}</table></aside>`;
    });

    // Clinical Blocks
    parsedContent = parsedContent.replace(/%%%CLINICAL_(\d+)%%%/g, (match, num) => {
        return `<div class="clinical-report-block"><div class="clinical-report-header">[OFFICIAL_CLINICAL_RECORD]</div><div class="clinical-report-content">${wikiParse(clinicalBlocks[num])}</div><div class="clinical-report-footer">VALIDATED_BY_ARCHIVE_SYSTEM</div></div>`;
    });

    // Code Blocks
    parsedContent = parsedContent.replace(/%%%CODE_(\d+)%%%/g, (match, num) => {
        const block = codeBlocks[num];
        return `<pre class="wiki-code"><code>${escapeHTML(block.code)}</code></pre>`;
    });

    return parsedContent;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { wikiParse, escapeHTML };
}
