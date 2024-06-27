interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

	const getPriority = (blockchain: any): number => {
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
		  if (lhsPriority > -99) {
		     if (balance.amount <= 0) {
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
    });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}


////Issues : 
//1/ Issue with filter code :
//  lhsPriority is undefined, leading to an error

//2/ We can combine filtering + sorting and mapping in once for efficiency

//3/ Sorting by Priority :  
//  Sorting should be directly based on the priority without unnecessary nested conditions.
//  not need to create more variables from getPriority()

//4/ Unnecessary Mapping: 
//  The mapping to create formattedBalances could be combined with the sorting operation.

//5/ Incorrect Dependency in useMemo :
//  It is incorrect to take 'prices' as dependency cause it is not used while sorting and filtering

//6 Inline CSS Class Usage:
//  Classes are used without being defined (classes.row). This might lead to runtime errors if classes is not defined.

//7. Lack of Type Safety:
//  Should add type for parameter 'blockchain' to avoid type error in getPriority();

//Modify Version:
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();
  
  //Lack of Type Safety: Add type for blockchain parameter
  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
        return 20;
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    //2. Combined the mapping operation within the sorting logic to avoid an additional iteration over the balances array.
    return balances
      .filter((balance: WalletBalance) => getPriority(balance.blockchain) > -99 && balance.amount > 0) // 1/The filter condition now correctly filters out balances with valid priorities and positive amounts.
      .sort((lhs: WalletBalance, rhs: WalletBalance) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain)) //3 Simplified the sorting logic by directly comparing the priorities of the balances.
      .map((balance: WalletBalance) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      }));
  }, [balances]); //5. Removed prices from the useMemo dependencies as they are not used in the sorting/filtering logic.

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes?.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

