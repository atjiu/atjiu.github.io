const loadMermaid = () => {
  mermaid.init(
    {
      startOnLoad: true,
      theme: 'default',
    },
    'pre code.language-mermaid',
  );
};

document.onload = function () {
  var markdownToc = document.querySelector(".markdown-toc");
  if (markdownToc) {
    markdownToc.style.display = "none";
  }
}