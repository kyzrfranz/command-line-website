import {html, LitElement} from "lit-element";
import {css} from "lit";

export class DrawerButton extends LitElement {

    static properties = {
        opened: {
            type: Boolean
        },
        strokeWidth: {
            type: Number
        }
    }

    constructor() {
        super();
        this.opened = false;
        this.strokeWidth = 1.9;
    }

    static local = css `
      :host {
        display: inline-block;
      }
       svg {
         background-color: transparent;
         stroke: currentColor;
       }
    `;

    static styles = [ this.local ];

    toggle() {
        this.opened= ! this.opened;
        if (this.opened) {
            this.animateOpen();
        } else {
            this.animateClose();
        }
    }

    animateClose() {
        this.renderRoot.querySelector("#drawer-top-close").beginElement();
        this.renderRoot.querySelector("#drawer-bottom-close").beginElement();
    }

    animateOpen() {
        this.renderRoot.querySelector("#drawer-top-open").beginElement();
        this.renderRoot.querySelector("#drawer-bottom-open").beginElement();
    }

    render() {
        return html `
            <svg @click="${this.toggle}" width="1em" height="1em" viewBox="0 0 18 18">
                <polyline fill="none" stroke="currentColor" stroke-width="${this.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" points="2 12, 16 12">
                    <animate id="drawer-bottom-open" attributeName="points" keyTimes="0;0.5;1" dur="0.24s" begin="indefinite" fill="freeze" calcMode="spline" keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1" values=" 2 12, 16 12; 2 9, 16 9; 3.5 15, 15 3.5"></animate>
                    <animate id="drawer-bottom-close" attributeName="points" keyTimes="0;0.5;1" dur="0.24s" begin="indefinite" fill="freeze" calcMode="spline" keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1" values=" 3.5 15, 15 3.5; 2 9, 16 9; 2 12, 16 12"></animate>
                </polyline>
                <polyline fill="none" stroke="currentColor" stroke-width="${this.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" points="2 5, 16 5">
                    <animate id="drawer-top-open" attributeName="points" keyTimes="0;0.5;1" dur="0.24s" begin="indefinite" fill="freeze" calcMode="spline" keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1" values=" 2 5, 16 5; 2 9, 16 9; 3.5 3.5, 15 15"></animate>
                    <animate id="drawer-top-close" attributeName="points" keyTimes="0;0.5;1" dur="0.24s" begin="indefinite" fill="freeze" calcMode="spline" keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1" values=" 3.5 3.5, 15 15; 2 9, 16 9; 2 5, 16 5"></animate>
                </polyline>
            </svg>
        `
    }

}

customElements.define("drawer-button", DrawerButton)