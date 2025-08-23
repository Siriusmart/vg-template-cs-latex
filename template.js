const BasicTemplate = require("../basic/template");

const rehypeKatex = require("rehype-katex").default;
const remarkMath = require("remark-math").default;
const rehypeStarryNight = require("rehype-starry-night-with-more-options").default;

class CsLatexTemplate extends BasicTemplate {
    htmlProcessor(processor) {
        let registeredComponents = {};

        for (let name of Object.keys(this.components)) {
            registeredComponents[name] = false;
        }

        return processor
            .use(rehypeStarryNight, {
                languageOverrides: {
                    ...registeredComponents,
                    math: false,
                },
            })
            .use(rehypeKatex);
    }

    markdownProcessor(processor) {
        return processor.use(remarkMath);
    }

    constructor() {
        super();

        this.registerComponent(
            "boxed",
            ({ options, content, document, md2Html }) => {
                let boxElem = document.createElement("div");
                boxElem.classList.add("boxed");
                boxElem.innerHTML = md2Html(content);
                boxElem.style["margin-left"] =
                    `calc(50% + ${options.shift ?? 0}%)`;

                return boxElem;
            },
        );

        this.registerComponent(
            "settings",
            ({ options, document }) => {
                let headingSpace = document.getElementById("headings");

                if (options.category != undefined) {
                    let cogElement = document.createElement("div");
                    cogElement.id = "category";
                    cogElement.textContent = options.category;
                    document.getElementById("banner").appendChild(cogElement);
                }

                let headerElem = document.createElement("h1");
                headerElem.textContent =
                    options.heading ?? "Missing field in settings: heading";
                headingSpace.appendChild(headerElem);

                if (options.subheading != undefined) {
                    let subheadingElem = document.createElement("p");
                    subheadingElem.id = "subheading";
                    subheadingElem.textContent = options.subheading;
                    headingSpace.appendChild(subheadingElem);
                }
            },
            { hasSettings: true },
        );

        this.registerComponent(
            "abstract",
            ({ document, md2Html, content, elem, options }) => {
                let abstractSpace = document.getElementById("abstract");

                if (
                    Array.isArray(options.authors) &&
                    options.authors.length != 0
                ) {
                    let authorBox = document.createElement("div");
                    authorBox.id = "author-card";

                    for (let author of options.authors) {
                        if (typeof author == "string") {
                            let authorNameElem = document.createElement("span");
                            authorNameElem.classList.add("author-name");
                            authorNameElem.textContent = author;
                            authorBox.appendChild(authorNameElem);
                        } else {
                            for (let [
                                authorName,
                                authorTitle,
                            ] of Object.entries(author)) {
                                let authorNameElem =
                                    document.createElement("span");
                                authorNameElem.textContent = authorName;
                                authorNameElem.classList.add("author-name");
                                authorBox.appendChild(authorNameElem);
                                let authorTitleElem =
                                    document.createElement("span");
                                authorTitleElem.textContent = authorTitle;
                                authorTitleElem.classList.add("author-title");
                                authorBox.appendChild(authorTitleElem);
                            }
                        }
                    }

                    abstractSpace.appendChild(authorBox);
                }

                abstractSpace.innerHTML += md2Html(content);

                this.redo = true;
                elem.parentNode.remove();
            },
        );
    }

    postProcess(params) {
        super.postProcess(params);
        params.dom.window.document
            .querySelectorAll("textarea.value-source")
            .forEach((elem) => elem.setAttribute("padding", "2em"));
    }
}

module.exports = CsLatexTemplate;
