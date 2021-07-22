#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod trading_pair {
    use erc20::Erc20;
    use ink_storage::Lazy;

    #[ink(storage)]
    pub struct TradingPair {
        token_a: Lazy<Erc20>,
        token_b: Lazy<Erc20>,
    }

    impl TradingPair {
        #[ink(constructor)]
        pub fn new(token_a_code_hash: Hash, token_b_code_hash: Hash) -> Self {
            let total_balance = Self::env().balance();
            let salt = 1u8.to_le_bytes();

            // TODO: use from_account_id to instantiate an existing contract
            let token_a = Erc20::new("token a".into(), "TKNA".into(), 123)
                .endowment(total_balance / 3)
                // why is code hash needed if I provide the erc20::Erc20 struct in this scope
                .code_hash(token_a_code_hash)
                .salt_bytes(salt)
                .instantiate()
                .expect("failed at instantiating the token A Erc20 contract");

            let token_b = Erc20::new("token b".into(), "TKNB".into(), 456)
                .endowment(total_balance / 3)
                .code_hash(token_b_code_hash)
                .salt_bytes(salt)
                .instantiate()
                .expect("failed at instantiating the token B Erc20 contract");

            Self {
                token_a: Lazy::new(token_a),
                token_b: Lazy::new(token_b),
            }
        }

        #[ink(message)]
        pub fn get_info(&self) -> (Balance, Balance) {
            let from = Self::env().caller();

            let token_a_balance = self.token_a.balance_of(from.clone());
            let token_b_balance = self.token_b.balance_of(from.clone());

            (token_a_balance, token_b_balance)
        }
    }
}
