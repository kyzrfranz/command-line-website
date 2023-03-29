import {LitElement, html, css} from 'lit';
import {Engineer} from "../../models/Engineer.js";

class ItermCommandLine extends LitElement {
    static get properties() {
        return {
            commands: {
                type: Array,
                hasChanged(newVal, oldVal) {
                    if (!newVal.find( c => c.name === 'help')) {
                        let helpList = ""

                        for (const command of newVal) {
                            helpList += `- ${command.name}: ${command.help}\n`
                        }
                        newVal.push({
                            name: 'help',
                            callRef: async (args) => {
                                return "Here is a set uf commands you can run to DYOR on me:\n\n" +
                                    `${helpList}\n` +
                                    "Type a command and press Enter to execute it.";
                            },
                        })
                    }
                }
            },
            username: {type: String},
            greeting: {type: String},
            prompt: {type: String},
            _input: {type: String, state: true},
            _history: {type: Array, state: true},
            _mode: {type: String, state: true},
        };
    }

    constructor() {
        super();
        this.greeting = "";
        this.username = this.generateUserName()
        this.prompt = `${this.username}@iterm2:~$`;
        this._input = '';
        this.config = {
            commands: {},
        };
        this._mode = 'default';
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', () => this._focusInput());
        this._history = [
            {
                prompt: '',
                input: `${this.greeting}\n`,
            },
        ];
    }

    static get styles() {
        return css`
          :host {
            position: relative;
            display: inline-block;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: #1d1f21;
            color: #c5c8c6;
            font-family: 'Fira Code', 'Source Code Pro', monospace;
            font-size: 14px;
            line-height: 1.5;
            padding: 10px;
          }

          .line {
            white-space: pre-wrap;
            display: flex;
            align-items: center;
          }

          .prompt {
            color: #81a2be;
          }

          .input-container {
            flex-grow: 1;
            position: relative;
          }

          .input {
            outline: none;
            border: none;
            background: transparent;
            color: inherit;
            font-family: inherit;
            font-size: inherit;
            line-height: inherit;
            padding-left: 0.5em;
            caret-color: white; /* Change the cursor color to red */
          }

          .cursor {
            position: absolute;
            background-color: white;
            width: 3px;
            height: 1.2em;
            pointer-events: none;
          }

          .input-textarea {
            background-color: transparent;
            border: none;
            outline: none;
            color: white;
            resize: none;
            overflow: hidden;
            font-family: 'Courier New', Courier, monospace;
            font-size: 1em;
            width: 100%;
            line-height: 1.2em;
          }

          .cursor {
            width: 5px;
            height: 1em;
            background-color: #c5c8c6;
            position: absolute;
            top: 0;
            left: 0;
            animation: blink 1s steps(1) infinite;
          }

          @keyframes blink {
            50% {
              visibility: hidden;
            }
          }
        `;
    }

    _onInput(e) {
        this._input = e.target.innerText || e.target.value;

        if (this._mode !== 'default') {
            this._autoResizeTextarea(e.target);
        }
    }

    _focusInput() {
        const inputElement = this.shadowRoot.querySelector('.input') || this.shadowRoot.querySelector('.input-textarea');
        if (inputElement) {
            inputElement.focus();
        }
    }

    async _onEnter(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const input = this._input.trim();
            if (input) {
                if (this._mode === 'custom-prompt') {
                    this._history = [...this._history, {prompt: this.prompt, input: ''}, {prompt: '', input}];
                } else {
                    this._history = [...this._history, {prompt: this.prompt, input}];
                }

                const inputElement = this.shadowRoot.querySelector('.input') || this.shadowRoot.querySelector('.input-textarea');
                inputElement.innerText = '';
                this._input = '';

                if (this._mode === 'default') {
                    const command = this.commands.find(c => input.startsWith(c.name))
                    if (command) {
                        const args = input.replace(command.name, "").trimEnd().trimStart()
                        this.dispatchEvent(new CustomEvent("invoke", {detail: {cmd: command, args: args}}))
                        if (command.prompt !== undefined && command.prompt != null) {
                            await this.displayPrompt(command.prompt, command.callRef);
                        } else {
                            const output = await command.callRef(args);
                            this._history = [...this._history, {prompt: '', input: output}];
                        }
                    } else {
                        this._print(input + " not found")
                        this.prompt = this.username + '@iterm2:~$';
                    }
                } else {
                    this.dispatchEvent(new CustomEvent('input-submitted', {detail: input}));
                }
                await this.updateComplete;
            }
        }
    }

    _print(msg) {
        this._history = [...this._history, {prompt: '', input: msg}];
    }

    async displayPrompt(prompt, callback) {
        this.prompt = prompt;
        this._mode = 'custom-prompt';
        await this.updateComplete;

        this._focusInput();

        return new Promise((resolve) => {
            this.addEventListener('input-submitted', async (e) => {
                const input = e.detail;
                const output = await callback(input);
                this._print(output)
                this.prompt = this.username + '@iterm2:~$';
                this._mode = 'default';
                resolve(output);
            }, {once: true});
        });
    }


    render() {
        return html`
            <div class="terminal">
                ${this._history.map(({prompt, input}) => html`
                    <div class="line">
                        <span class="prompt">${prompt}</span>
                        <span class="input-text">${input}</span>
                    </div>
                `)}
                <div class="line">
                    <span class="prompt">${this.prompt}</span>
                    ${this._mode === 'default' ? this._renderInput() : ''}
                </div>
                ${this._mode !== 'default' ? this._renderTextarea() : ''}
            </div>
        `;
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        this._focusInput();
    }


    _renderInput() {
        return html`
            <span class="input" @keydown="${this._onEnter}" @input="${this._onInput}" contenteditable="true"></span>
        `;
    }


    _renderTextarea() {
        return html`
            <textarea class="input-textarea" @keydown="${this._onEnter}" @input="${this._onInput}"></textarea>
        `;
    }

    _autoResizeTextarea(textarea) {
        textarea.style.height = 'auto'; // Reset the height to 'auto' before calculating the new height
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    generateUserName() {
        const adjectives = [
            'able',
            'atomic',
            'basic',
            'brave',
            'bright',
            'buzzy',
            'cheerful',
            'clever',
            'cool',
            'crimson',
            'daring',
            'digital',
            'dizzy',
            'electric',
            'elegant',
            'fancy',
            'fiery',
            'flaming',
            'flashy',
            'flying',
            'frosty',
            'funny',
            'giant',
            'giddy',
            'gleaming',
            'golden',
            'graceful',
            'grateful',
            'great',
            'happy',
            'hardy',
            'hasty',
            'hot',
            'icy',
            'jolly',
            'joyful',
            'jumpy',
            'kind',
            'lazy',
            'light',
            'lovely',
            'lucky',
            'mad',
            'magic',
            'magnetic',
            'mighty',
            'misty',
            'mystic',
            'neon',
            'noble',
            'odd',
            'orange',
            'pale',
            'pink',
            'plucky',
            'proud',
            'purple',
            'quick',
            'quiet',
            'radiant',
            'rainy',
            'rapid',
            'red',
            'rich',
            'ripe',
            'rosy',
            'rough',
            'royal',
            'rusty',
            'shady',
            'shimmering',
            'shiny',
            'silent',
            'silly',
            'silver',
            'sky',
            'smart',
            'smiling',
            'smoky',
            'smooth',
            'soft',
            'solid',
            'sparkling',
            'speedy',
            'spicy',
            'spiffy',
            'spotty',
            'square',
            'steady',
            'stone',
            'stormy',
            'strong',
            'sunny',
            'sweet',
            'swift',
            'tall',
            'tasty',
            'tender',
            'thick',
            'thin',
            'tidy',
            'tiny',
            'tough',
            'tricky',
            'true',
            'ugly',
            'ultimate',
            'unreal',
            'upbeat',
            'upright',
            'urban',
            'vibrant',
            'violet',
            'vivid',
            'warm',
            'weak',
            'weird',
            'wild',
            'wise',
            'witty',
            'wonderful',
            'wooden',
            'yellow',
            'young',
            'zany',
            'zealous',
        ];

        const nouns = [
            'ant',
            'ape',
            'bat',
            'bee',
            'bug',
            'cat',
            'cod',
            'cow',
            'dog',
            'eel',
            'elk',
            'emu',
            'fly',
            'fox',
            'gnu',
            'hen',
            'hog',
            'jay',
            'kit',
            'lab',
            'man',
            'owl',
            'pig',
            'pug',
            'rat',
            'ray',
            'seal',
            'shy',
            'tad',
            'toe',
            'top',
            'yak',
            'yam',
            'yon',
            'ze'];

        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 1000);
        return `${adjective}-${noun}-${number}`;
    }


}

customElements.define('iterm-command-line', ItermCommandLine);
