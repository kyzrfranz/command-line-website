import {Command} from "./Command.js";

export class Engineer {
    constructor(name, gigs) {
        this._name = name;
        this._gigs = gigs;

        this._commands = [
            new Command("projects", "show all projects", this.listProjects.bind(this)),
            new Command("project show", "show all projects", this.showProject.bind(this)),
            new Command("contact", `get in touch with ${this._name}`, this.submit.bind(this), "Lets get some details first:")
        ]
    }

    get commands() {
        return this._commands;
    }

    listProjects() {
        let list = `title ${" ".repeat(45)} role \n`
        list += `${"-".repeat(100)} \n`
        this._gigs.forEach(item => list += `${item.data.title} ${" ".repeat(50 - item.data.title.length)} ${item.data.role} \n`)
        list += "type 'project show [title]' to see details"
        return list
    }

    showProject(title) {
        if (!title) {
            return "nope"
        }
        const gig = this._gigs.find(item => item.data.title == title)
        if (!gig) {
            return `${title} not found`
        }
        return `${gig.data.title}: ${gig.data.role}`
    }

    submit(msg) {
        return fetch('/', {
            method: 'POST',
            body: JSON.stringify({message: msg}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                return 'Your message has been received';
            } else {
                return 'Woopsie to send';
            }
        }).catch(error => {
            return "something has gone wrong..."
        });
    }
}