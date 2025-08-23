Array.from(document.getElementsByTagName("a")).forEach((elem) => {
    if (!elem.href.startsWith(".") && !elem.href.startsWith("/"))
        elem.target = "_blank";
});
