#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod trading_pair {
    use erc20::Erc20;
    use ink_storage::Lazy;

    use ink_env::call::FromAccountId;

    #[ink(storage)]
    pub struct TradingPair {
        token_a: Erc20,
        token_b: Erc20,
    }

    impl TradingPair {
        #[ink(constructor)]
        pub fn new(token_a: AccountId, token_b: AccountId) -> Self {
            let token_a = Erc20::from_account_id(token_a);
            let token_b = FromAccountId::from_account_id(token_b);
            Self {
                token_a,
                token_b,
            }
        }

        #[ink(message)]
        pub fn get_info(&self) -> (Balance, Balance) {
            let from = self::env().caller();

            let token_a_balance = self.token_a.balance_of(from.clone());
            let token_b_balance = self.token_b.balance_of(from.clone());

            (token_a_balance, token_b_balance)
        }
    }
}
