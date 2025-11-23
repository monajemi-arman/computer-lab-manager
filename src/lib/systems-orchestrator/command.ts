export class CommandResult {
    status: CommandStatus
    returnCode: number
    outputArray: string[]

    constructor({ status, returnCode, outputArray }: {
        status?: CommandStatus,
        returnCode?: number,
        outputArray?: string[]
    } = {}) {
        this.status = status || CommandStatus.pending;
        this.returnCode = returnCode || 0;
        this.outputArray = outputArray || [];
    }

    get output() {
        if (this.outputArray.length === 0) return;
        return this.outputArray?.join('\n');
    }

    get ended() {
        if ([CommandStatus.failed, CommandStatus.done].includes(this.status))
            return true;
        else
            return false;
    }

    get success() {
        if (this.status === CommandStatus.done)
            return true;
        return false;
    }
}

export enum CommandStatus {
    failed = -1,
    pending = 0,
    running = 1,
    done = 2
}