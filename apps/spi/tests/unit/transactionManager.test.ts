import TransactionManager from "@spi/transactions";
import { PossibleMessages, TransactionParticipants, TransactionTypes } from "@spi/transactions/types";

jest.useFakeTimers();

describe("Testing transactionManager module", () => {
   test("Module initialize with no erros", () => {
      const manager = new TransactionManager();

      expect(manager).toBeInstanceOf(TransactionManager);
      jest.runOnlyPendingTimers();
   })

   test("Create transaction", () => {
      const manager = new TransactionManager()

      const transaction = manager.createTransaction(crypto.randomUUID(), TransactionTypes.CREATE_PAYMENT, () => { }, () => { })
      expect(transaction.transaction.current_step).toBe(-1)
      jest.runOnlyPendingTimers();
   })

   test("To expire in 40 seconds", () => {
      const manager = new TransactionManager()
      const mockCallback = jest.fn();

      const transaction = manager.createTransaction(crypto.randomUUID(), TransactionTypes.CREATE_PAYMENT, () => { }, mockCallback)
      expect(transaction.transaction.current_step).toBe(-1)
      
      expect(mockCallback).not.toHaveBeenCalled();
      jest.advanceTimersByTime(41000);
      expect(mockCallback).toHaveBeenCalled();
      jest.runOnlyPendingTimers();
   })

   test("To advance steps", () => {
      const manager = new TransactionManager()
      const id = crypto.randomUUID();

      var transaction: any = manager.createTransaction(id, TransactionTypes.CREATE_PAYMENT, () => { }, () => {})
      transaction = manager.continueTransaction(id, TransactionParticipants.PSP_1, TransactionParticipants.SPI, PossibleMessages.PACS_004)
      expect(transaction.transaction.current_step).toBe(0)
      jest.runOnlyPendingTimers();
   })

   test("To advance steps with error on data", () => {
      const manager = new TransactionManager()
      const id = crypto.randomUUID();

      var transaction: any = manager.createTransaction(id, TransactionTypes.CREATE_PAYMENT, () => { }, () => {})
      try {

         transaction = manager.continueTransaction(id, TransactionParticipants.PSP_1, TransactionParticipants.SPI, PossibleMessages.PACS_002)
      } catch(e){
         expect((e as Error).message).toBe("Received package doest match with expected package at this type of transaction")
      }
      jest.runOnlyPendingTimers();
   })

   test("To advance all steps", () => {
      const manager = new TransactionManager()
      const id = crypto.randomUUID();
      const mockCallback = jest.fn();
      
      expect(mockCallback).not.toHaveBeenCalled();
      manager.createTransaction(id, TransactionTypes.CREATE_PAYMENT, mockCallback, () => {})
      manager.continueTransaction(id, TransactionParticipants.PSP_1, TransactionParticipants.SPI,       PossibleMessages.PACS_004)
      manager.continueTransaction(id, TransactionParticipants.SPI,   TransactionParticipants.PSP_2,     PossibleMessages.PACS_004)
      manager.continueTransaction(id, TransactionParticipants.PSP_2, TransactionParticipants.SPI,       PossibleMessages.PACS_002)
      manager.continueTransaction(id, TransactionParticipants.SPI,   TransactionParticipants.EVERY_PSP, PossibleMessages.PACS_002)

      expect(mockCallback).toHaveBeenCalled()
      jest.runOnlyPendingTimers();
   })
});