/**
 * YomiWiki Core Parser (V5.6 Hybrid SCP Mode)
 * Decodes wiki markup into HTML with precision and handles intentional HTML components.
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
    
    // Fix literal \n strings if they exist
    content = content.replace(/\\n/g, '\n');

    // --- 1. Collection Phase (Preserve special blocks before any escaping) ---
    const infoboxes = [];
    const clinicalBlocks = [];
    const codeBlocks = [];
    const safeHtmlBlocks = [];
    const SECRET_SALT = Math.random().toString(36).substring(7);

    // Code Blocks (Highest priority)
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const num = codeBlocks.length;
        codeBlocks.push(code.trim());
        return `§§§CODE§${num}§${SECRET_SALT}§§§`;
    });

    // Infobox
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
        return `§§§INFOBOX§${num}§${SECRET_SALT}§§§`;
    });

    // Wiki Links & Images (Early extraction to protect from markdown processing)
    const wikiLinks = [];
    content = content.replace(/\[\[File:([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, url, options) => {
        const num = wikiLinks.length;
        wikiLinks.push({ type: 'file', url: url.trim(), options });
        return `§§§WIKILINK§${num}§${SECRET_SALT}§§§`;
    });

    content = content.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (match, title, alias) => {
        const num = wikiLinks.length;
        wikiLinks.push({ type: 'link', title: title.trim(), alias: alias.trim() });
        return `§§§WIKILINK§${num}§${SECRET_SALT}§§§`;
    });

    content = content.replace(/\[\[([^|\]]+)\]\]/g, (match, title) => {
        const num = wikiLinks.length;
        wikiLinks.push({ type: 'link', title: title.trim() });
        return `§§§WIKILINK§${num}§${SECRET_SALT}§§§`;
    });

    // Clinical Blocks
    content = content.replace(/\[CLINICAL\]([\s\S]*?)\[\/CLINICAL\]/g, (match, body) => {
        const num = clinicalBlocks.length;
        clinicalBlocks.push(body.trim());
        return `§§§CLINICAL§${num}§${SECRET_SALT}§§§`;
    });

    // --- 1.1 Safe HTML Extraction (SCP Style Support) ---
    // Extract full tags like <div ...> or </div>
    const safeTagsRegex = /<(?!\/)(div|span|ul|ol|li|b|i|strong|em|aside|table|thead|tbody|tr|th|td|hr|br|img)\b[^>]*>|<\/(div|span|ul|ol|li|b|i|strong|em|aside|table|thead|tbody|tr|th|td|hr|br|img)>/gi;
    content = content.replace(safeTagsRegex, (match) => {
        const num = safeHtmlBlocks.length;
        safeHtmlBlocks.push(match);
        return `§§§SAFEHTML§${num}§${SECRET_SALT}§§§`;
    });

    // --- 2. Security Escaping ---
    let html = escapeHTML(content);

    // --- 3. Text Formatting & Headers ---
    // Markdown Bold/Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/__(.*?)__/g, '<b>$1</b>');
    html = html.replace(/(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)/g, '<i>$1</i>');
    html = html.replace(/(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '<i>$1</i>');
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Wiki Headers (Improved regex to match == TITLE ==)
    const headers = [];
    const headerRegex = /^ *(#{1,6}) +(.+?)$|^ *(={2,6}) *(.+?) *\3 *$/gm;
    html = html.replace(headerRegex, (match, hashes, mTitle, wikiHashes, wTitle) => {
        const level = hashes ? hashes.length : wikiHashes.length;
        const title = (mTitle || wTitle).trim();
        const id = "section-" + title.replace(/[_\s]+/g, '-').toLowerCase();
        headers.push({ level, title, id });
        return `<h${level} id="${id}">${title}</h${level}>`;
    });

    // --- 4. Footnotes ---
    const footnotes = [];
    html = html.replace(/\[\* +(.+?)\]/g, (match, fnContent) => {
        const num = footnotes.length + 1;
        const cleanContent = fnContent.trim();
        footnotes.push(cleanContent);
        return `<sup><a id="fn-ref-${num}" href="#fn-${num}" class="footnote-link" data-tooltip="FOOTNOTE: ${cleanContent}">[${num}]</a></sup>`;
    });

    // --- 5. Footnotes ---
    const footnotes = [];
    html = html.replace(/\[\* +(.+?)\]/g, (match, fnContent) => {
        const num = footnotes.length + 1;
        const cleanContent = fnContent.trim();
        footnotes.push(cleanContent);
        return `<sup><a id="fn-ref-${num}" href="#fn-${num}" class="footnote-link" data-tooltip="FOOTNOTE: ${cleanContent}">[${num}]</a></sup>`;
    });

    html = html.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, '<a href="$1" class="external-link" target="_blank" rel="noopener noreferrer">$2</a>');
    
    // --- 6. Tables and Lists ---
    const lines = html.split('\n');
    let finalHtml = [];
    let listStack = [];
    let inTable = false;
    let tableHtml = "";
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('§§§SAFEHTML')) {
            finalHtml.push(line); 
            return;
        }
        
        if (trimmed.startsWith('{|')) {
            inTable = true;
            tableHtml = '<table class="wikitable clinical-table">';
        } else if (trimmed.startsWith('|}')) {
            inTable = false;
            tableHtml += '</table>';
            finalHtml.push(tableHtml);
            tableHtml = "";
        } else if (inTable) {
            if (trimmed.startsWith('|+')) tableHtml += `<caption>${trimmed.substring(2).trim()}</caption>`;
            else if (trimmed.startsWith('|-')) tableHtml += '<tr>';
            else if (trimmed.startsWith('!')) {
                trimmed.substring(1).split('!!').forEach(c => {
                    const parts = c.split('|');
                    if (parts.length > 1 && parts[0].includes('=')) {
                        tableHtml += `<th ${parts[0].trim()}>${wikiParse(parts.slice(1).join('|').trim())}</th>`;
                    } else {
                        tableHtml += `<th>${wikiParse(c.trim())}</th>`;
                    }
                });
            }
            else if (trimmed.startsWith('|')) {
                trimmed.substring(1).split('||').forEach(c => {
                    const parts = c.split('|');
                    if (parts.length > 1 && parts[0].includes('=')) {
                        tableHtml += `<td ${parts[0].trim()}>${wikiParse(parts.slice(1).join('|').trim())}</td>`;
                    } else {
                        tableHtml += `<td>${wikiParse(c.trim())}</td>`;
                    }
                });
            }
        } else {
            const listMatch = line.match(/^([\*\#]+)\s*(.*)$/);
            if (listMatch) {
                const prefix = listMatch[1];
                const depth = prefix.length;
                const type = prefix[depth-1] === '*' ? 'ul' : 'ol';
                while (listStack.length > depth) finalHtml.push(`</${listStack.pop()}>`);
                while (listStack.length < depth) { listStack.push(type); finalHtml.push(`<${type}>`); }
                finalHtml.push(`<li>${listMatch[2]}</li>`);
            } else {
                while (listStack.length > 0) finalHtml.push(`</${listStack.pop()}>`);
                if (trimmed.startsWith('----')) finalHtml.push('<hr>');
                else if (line.trim()) finalHtml.push(line + '<br>');
            }
        }
    });
    let parsedContent = finalHtml.join('');

    // --- 7. TOC ---
    if (headers.length >= 1) {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        let lastLevel = 0;
        let tocHtml = `<div class="wiki-toc"><div class="toc-title">CONTENTS <span class="toc-toggle" onclick="window.toggleTOC()">[hide]</span></div><ul id="toc-list">`;
        headers.forEach(h => {
            if (h.level < lastLevel) for (let i = h.level + 1; i < counts.length; i++) counts[i] = 0;
            counts[h.level]++;
            lastLevel = h.level;
            const numberStr = counts.slice(1, h.level + 1).filter(n => n > 0).join('.') + '.';
            tocHtml += `<li class="toc-level-${h.level}"><a href="#${h.id}"><span class="toc-number">${numberStr}</span> ${h.title}</a></li>`;
        });
        tocHtml += `</ul></div>`;
        parsedContent = tocHtml + parsedContent;
    }

    // --- 8. Footnotes ---
    if (footnotes.length > 0) {
        let fnHtml = `<div class="wiki-footnotes"><div class="footnotes-title">[ARCHIVAL_FOOTNOTES]</div><ol>`;
        footnotes.forEach((content, i) => {
            const num = i + 1;
            fnHtml += `<li id="fn-${num}">${wikiParse(content)} <a href="#fn-ref-${num}" class="footnote-backlink">↩</a></li>`;
        });
        fnHtml += `</ol></div>`;
        parsedContent += fnHtml;
    }

    // --- 9. Injection Phase ---
    parsedContent = parsedContent.replace(/§§§SAFEHTML§(\d+)§([a-z0-9]+)§§§/g, (match, num, salt) => {
        if (salt !== SECRET_SALT) return match;
        return safeHtmlBlocks[num];
    });

    parsedContent = parsedContent.replace(/§§§INFOBOX§(\d+)§([a-z0-9]+)§§§/g, (match, num, salt) => {
        if (salt !== SECRET_SALT) return match;
        const info = infoboxes[num];
        let bodyHtml = "";
        info.data.forEach(item => {
            const key = item.key.toLowerCase();
            if (key === 'image') bodyHtml += `<tr><td colspan="2" class="infobox-image-cell"><img src="${item.val.trim()}" class="wiki-image"></td></tr>`;
            else if (key === 'caption') bodyHtml += `<tr><td colspan="2" class="infobox-caption-cell">${item.val}</td></tr>`;
            else bodyHtml += `<tr><th>${item.key}</th><td>${wikiParse(item.val)}</td></tr>`;
        });
        return `<aside class="infobox"><div class="infobox-title">${info.title}</div><table>${bodyHtml}</table></aside>`;
    });

    parsedContent = parsedContent.replace(/§§§WIKILINK§(\d+)§([a-z0-9]+)§§§/g, (match, num, salt) => {
        if (salt !== SECRET_SALT) return match;
        const link = wikiLinks[num];
        if (link.type === 'file') {
            const params = {};
            if (link.options) {
                link.options.split('|').forEach(opt => {
                    if (opt.includes('=')) {
                        const [key, val] = opt.split('=');
                        params[key.trim().toLowerCase()] = val.trim();
                    } else params[opt.trim().toLowerCase()] = true;
                });
            }
            let alignClass = params.left ? "align-left" : (params.right ? "align-right" : (params.center ? "align-center" : ""));
            const widthStyle = params.width ? `width:${params.width};` : "";
            const caption = params.caption || "";
            return `<div class="media-container ${alignClass}" style="${widthStyle}"><img src="${link.url}" class="wiki-image" alt="${escapeHTML(caption)}">${caption ? `<div class="media-caption">${escapeHTML(caption)}</div>` : ''}</div>`;
        } else if (link.type === 'link') {
            const cleanTitle = link.title;
            const displayTitle = link.alias || cleanTitle;
            if (cleanTitle.toLowerCase().startsWith('category:')) return "";
            const slug = cleanTitle.replace(/ /g, '_'); 
            return `<a href="/w/${encodeURIComponent(slug)}" class="wiki-link" data-title="${escapeHTML(cleanTitle)}">${escapeHTML(displayTitle)}</a>`;
        }
        return match;
    });

    parsedContent = parsedContent.replace(/§§§CLINICAL§(\d+)§([a-z0-9]+)§§§/g, (match, num, salt) => {
        if (salt !== SECRET_SALT) return match;
        return `<div class="clinical-report-block"><div class="clinical-report-header">[OFFICIAL_CLINICAL_RECORD]</div><div class="clinical-report-content">${wikiParse(clinicalBlocks[num])}</div><div class="clinical-report-footer">VALIDATED_BY_ARCHIVE_SYSTEM</div></div>`;
    });

    parsedContent = parsedContent.replace(/§§§CODE§(\d+)§([a-z0-9]+)§§§/g, (match, num, salt) => {
        if (salt !== SECRET_SALT) return match;
        return `<pre class="wiki-code"><code>${escapeHTML(codeBlocks[num])}</code></pre>`;
    });

    return parsedContent;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { wikiParse, escapeHTML };
}
