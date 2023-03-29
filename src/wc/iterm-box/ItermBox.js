import {html, LitElement} from "lit-element";
import {css} from "lit";

export class ItermBox extends LitElement {

    static properties = {
        input: {
            type: String
        },
        output: {
            type: String
        },
        title: {
            type: String
        },
        printDelay: {
            type: Number
        }
    }

    constructor() {
        super();
        this.data = [];
        this.printDelay = 20;
    }

    static local = css`
      :host {
        display: inline-block;
      }

      .terminal-header {
        background-color: #333;
        color: #fff;
        display: flex;
        justify-content: start;
        padding: 5px;
      }

      .window-controls {
        display: flex;
      }

      .window-title {
        font-size: 14px;
      }

      #terminal-prompt {
        background-color: #000;
        color: #CCC;
        font-family: 'Andale Mono', monospace;
        font-size: 14px;
        margin: 0;
        overflow-y: scroll;
        padding: 10px;
        white-space: pre-wrap;
        word-break: break-word;
      }
      
      #terminal-prompt h1, #terminal-prompt h2 {
        margin: 0px;
        padding: 0px;
      }
      
      h1 {
        font-size: 1.5em;
        color: mediumseagreen;
      }
      h2 {
        font-size: 1.3em;
        color: darkorange;
      }
      
      #terminal-prompt span.description {
        margin-top: 1em;
        margin-bottom: 2em;
        display: inline-block;
        color: #777;
      }
      
      
      div.output {
        margin-top: 1em;
        margin-bottom: 3em;
      }

      ul {
        list-style: none;
        margin: 0px;
        padding: 0px;
      }
      
      ul li {
        display: inline-block;
      }
      
      ul.highlight > li {
        background-color: lightskyblue;
        color: #000;
        font-size: 1.0rem;
        padding: 0.1rem;
        border-radius: 1px;
      }

      @keyframes blink {
        0% {
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }

    `;

    static styles = [this.local];

    render() {
        return html`
            <div class="terminal-header">
                <div class="window-controls"></div>
                <div class="window-title">${this.title}</div>
            </div>
            <div id="terminal-prompt">$ <span class="cursor">█</span></div>
        `
    }

    async updated(_changedProperties) {
        super.updated(_changedProperties);
        const terminalOutput = this.renderRoot.querySelector('#terminal-prompt');
        if (_changedProperties.has('output')) {
            await this.typeInputPrompt(terminalOutput, this.input)
            await this.typeString(terminalOutput, this.output)
            await this.typeInputPrompt(terminalOutput, '$ █')
        }
    }


    async typeInputPrompt(element, text, delay = this.printDelay) {
        element.innerHTML = element.innerHTML.replaceAll("█", "")
        const cursor = '<span class="cursor">█</span>';
        for (let i = 0; i < text.length; i++) {
            element.innerHTML += text.charAt(i);
            element.innerHTML += cursor;
            await this.sleep(delay);
            element.innerHTML = element.innerHTML.slice(0, -cursor.length);
        }
    }

    async typeString(element, text) {
        element.innerHTML += `<div class='output'>${text}</div>`
    }


    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

}

customElements.define("iterm-box", ItermBox)