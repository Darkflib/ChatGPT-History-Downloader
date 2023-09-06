const buttonDownloadMarkdown = document.getElementById("download-markdown");

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function downloadMarkdown() {
  function h(html) { // convert html to markdown is a hacky way
    console.log(html);
    return html // fix newlines
      .replace(/<p>/g, "\n") // replace p tags with newlines
      .replace(/<\/p>/g, "\n")
      .replace(/<b>/g, "**") // replace bold tags with markdown bold
      .replace(/<\/b>/g, "**")
      .replace(/<strong>/g, "**") // replace strong tags with markdown bold
      .replace(/<\/strong>/g, "**")
      .replace(/<i>/g, "_") // replace italic tags with markdown italic
      .replace(/<\/i>/g, "_")
      .replace(/<br>/g, "\n") // replace br tags with newlines
      .replace(/<br\/>/g, "\n")
      // fix lists
      .replace(/<ul>/g, "\n") // remove ul tags
      .replace(/<\/ul>/g, "")
      .replace(/<ol>/g, "\n") // remove ol tags
      .replace(/<\/ol>/g, "")
      .replace(/<li>/g, "- ") // replace li tags with markdown list
      .replace(/<\/li>/g, "\n")
      // fix headings
      .replace(/<h1>/g, "# ") // replace h1 tags with markdown h1
      .replace(/<\/h1>/g, "\n")
      .replace(/<h2>/g, "## ") // replace h2 tags with markdown h2
      .replace(/<\/h2>/g, "\n")
      .replace(/<h3>/g, "\n### ") // replace h3 tags with markdown h3
      .replace(/<\/h3>/g, "\n")
      .replace(/<h4>/g, "\n#### ") // replace h4 tags with markdown h4
      .replace(/<\/h4>/g, "\n")
      // fix code blocks")
      .replace(/<code>([^<]*)<\/code>/g, "`$1`") // replace inline code tags with markdown code
      .replace(/<code[^>]*>/g, (match) => { // replace code tags with a language with markdown code
        const lm = match.match(/class="[^"]*language-([^"]+)"/);
        return lm ? "\n```" + lm[1] + "\n" : "\n```plain\n";
      })
      .replace(/<\/code[^>]*>/g, "```\n")
      .replace(/<span>[^<]*<\/span>/g, "") // remove span tags
      .replace(/<[^>]*>/g, "") // remove all other html tags
      .replace(/Copy code/g, "") // remove copy code button
      .replace(
        /This content may violate our content policy. If you believe this to be in error, please submit your feedback — your input will aid our research in this area./g,
        ""
      )
      // fix entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }

  (() => {
    const e = document.querySelectorAll(".text-base.flex");
    // set up the markdown file. Start with the title as the heading
    let t = `# ${
      document.querySelector("title")?.innerText || "Conversation with ChatGPT"
    }\n\n`;
    for (const s of e)
      s.querySelector(".whitespace-pre-wrap") &&
        ((t += t == "" ? "" : "--------\n"),
        (t += `**${
          s.querySelectorAll("img").length > 1 // if there is an image, use the alt text
            ? s.querySelectorAll("img").alt
            : "ChatGPT" // otherwise use ChatGPT
        }**: ${h(s.querySelector(".whitespace-pre-wrap").innerHTML)}\n\n`));

    const o = document.createElement("a");
    (o.download =
      (document.querySelector("title")?.innerText ||
        "Conversation with ChatGPT") + ".md"),
      (o.href = URL.createObjectURL(new Blob([t]))),
      (o.style.display = "none"),
      document.body.appendChild(o),
      o.click();
  })();
}

buttonDownloadMarkdown.addEventListener("click", async () => {
  const tab = await getCurrentTab();

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: downloadMarkdown,
  });
});

// Onload handler log stuff to console
window.onload = function () {
  console.log("Page Title: " + document.querySelector("title").innerText);

}
