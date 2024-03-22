export enum TransactionTypes {
    CREATE_PAYMENT = "CREATE_PAYMENT"
}

export enum TransactionParticipants {
    SPI,
    PSP_1,
    PSP_2,
    EVERY_ONE,
    EVERY_PSP,
}

export interface Transaction {
    id: string;
    type: TransactionTypes;
    created_at: string;
    current_step: number;
    total_steps: number;
}

export enum PossibleMessages {
    ADMI_002,
    PIBR_001,
    PIBR_002,
    PACS_008,
    PACS_002,
    PACS_004
}

export interface TransactionSteps {
    [key: number]: {
        participants_owner: TransactionParticipants
        participant_destiny: TransactionParticipants,
        message: PossibleMessages
    }
}

export interface RunningTransaction {
    transaction: Transaction;
    steps: TransactionSteps;
    timeout: ReturnType<typeof setTimeout>;
    doneCallback: Function;
    expiredCallback: Function;
}
