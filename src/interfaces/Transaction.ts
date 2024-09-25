interface BaseTransaction {
subnetwork_id: string
transaction_id: string
hash: string
mass: null
block_hash: string[]
block_time: number
is_accepted: boolean
outputs: TransactionOutputs[]
}

type TransactionOutputs = {
	transaction_id: string
	index: number
	amount: string
	script_public_key: string
	script_public_key_address: string
	script_public_key_type: string
}
type TransactionInputs = {
	transaction_id: string
	index: number
	previous_outpoint_hash: string
	previous_outpoint_index: string
	signature_script: string
	sig_op_count: string
}

export type AcceptedTransaction = BaseTransaction & {
	is_accepted: true
	inputs: TransactionInputs[]
	accepting_block_hash: string
	accepting_block_blue_score: number
}

export type PendingTransaction = BaseTransaction & {
	is_accepted: false
	inputs: null
	accepting_block_hash: null
	accepting_block_blue_score: null
}

export type Transaction = PendingTransaction | AcceptedTransaction