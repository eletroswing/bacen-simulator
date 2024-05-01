import * as TransactionTyping from "./types";

class TransactionManager {
    private transactions: {[key:string]: TransactionTyping.RunningTransaction}
    private possible_transactions: {[key: string]: TransactionTyping.TransactionSteps}

    constructor(){
        this.transactions = {}
        this.possible_transactions = {
           "CREATE_PAYMENT": {
             0: {
                message: TransactionTyping.PossibleMessages.PACS_004,
                participants_owner: TransactionTyping.TransactionParticipants.PSP_1,
                participant_destiny: TransactionTyping.TransactionParticipants.SPI,
             },
             1: {
                message: TransactionTyping.PossibleMessages.PACS_004,
                participants_owner: TransactionTyping.TransactionParticipants.SPI,
                participant_destiny: TransactionTyping.TransactionParticipants.PSP_2,
             },
             2: {
                message: TransactionTyping.PossibleMessages.PACS_002,
                participants_owner: TransactionTyping.TransactionParticipants.PSP_2,
                participant_destiny: TransactionTyping.TransactionParticipants.SPI,
             },
             3: {
                message: TransactionTyping.PossibleMessages.PACS_002,
                participants_owner: TransactionTyping.TransactionParticipants.SPI,
                participant_destiny: TransactionTyping.TransactionParticipants.EVERY_PSP,
             },
           }
        }
    }

    continueTransaction(id: string, emitter: TransactionTyping.TransactionParticipants, receiver: TransactionTyping.TransactionParticipants, message: TransactionTyping.PossibleMessages) {
        if(
            this.transactions[id].steps[this.transactions[id].transaction.current_step].message !== message ||
            this.transactions[id].steps[this.transactions[id].transaction.current_step].participant_destiny !== receiver ||
            this.transactions[id].steps[this.transactions[id].transaction.current_step].participants_owner !== emitter 
        ) throw new Error(`Received package doest match with expected package at this type of transaction`)

        this.transactions[id].transaction.current_step = this.transactions[id].transaction.current_step + 1;

        if(this.transactions[id].transaction.current_step === this.transactions[id].transaction.total_steps) {
            this.transactions[id].doneCallback(this.transactions[id])
            clearTimeout(this.transactions[id].timeout)
            delete this.transactions[id];
            return
        }

        return this.transactions[id]
    }

    createTransaction(id: string, type: TransactionTyping.TransactionTypes, doneCallback: () => void, expiredCallback: () => void){
        if(this.transactions[id]) throw new Error("Already exists an transaction with the given id.");

        this.transactions[id] = {
            transaction: {
                created_at: new Date().toISOString(),
                current_step: 0,
                id: id,
                total_steps: Object.keys(this.possible_transactions[type]).length ,
                type: type
            },
            steps: this.possible_transactions[type],
            timeout: setTimeout(this.#getTimeoutFunction(id, expiredCallback), 40000) , //40 seconds,
            doneCallback: doneCallback,
            expiredCallback: expiredCallback
        }

        return this.transactions[id]
    }

    #getTimeoutFunction(id:string, expiredCallback: (transaction: TransactionTyping.RunningTransaction) => void) {
        return () => {
            expiredCallback(this.transactions[id])
            delete this.transactions[id];
        }
    }

}

export default TransactionManager;