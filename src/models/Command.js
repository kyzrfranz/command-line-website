export class Command {

    constructor(name, help, runRef, prompt = null) {
        this._name = name
        this._help = help
        this._callRef = runRef
        this._prompt = prompt
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get prompt() {
        return this._prompt;
    }

    set prompt(value) {
        this._prompt = value;
    }

    get help() {
        return this._help;
    }

    set help(value) {
        this._help = value;
    }


    get callRef() {
        return this._callRef;
    }

    set callRef(value) {
        this._callRef = value;
    }
}