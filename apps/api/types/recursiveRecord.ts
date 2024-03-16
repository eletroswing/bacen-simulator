export type RecursiveRecord = {
	[key: string]:
		| string
		| number
		| object
		| RecursiveRecord[]
		| never
		| RecursiveRecord;
};