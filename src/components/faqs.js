export const Faqs = () => {
  return (
    <>
      <div className="container" style={{ textAlign: "justify" }}>
        -
        <p> Q: What is Prestamo?</p>
        <li style={{ margin: "18px" }}>
          Prestamo is an experimental decentralized NFT/Objkts lending platform
          on the Tezos blockchain. Borrow or lend ꜩ with NFT/Objkts as
          collateral.
        </li> -
        <p>Q: How does it work?</p>
        <li style={{ margin: "18px" }}>
          The borrower makes a market including the amount of ꜩ to borrow, the
          time or term to pay, the interest rate and selects NFT/Objkts that
          will be used as collateral. The tokens are transfered to the Prestamo
          market contract. The market can be cancelled any time before it is
          taken and the NFT/Objkts are transfered back to the original
          owner/maker.
          <p>
            A lender sees the market offer listed and takes it. The loam amount
            minus 1% market fee is transferd to the market maker and the term
            countdown begins. Before the time is up the maker or borrower can
            pay back the loan amount + indicated interest. If the maker/borrower
            doesn't pay back in time, the lender/taker can claim the NFT/Objkts
            and they will be transfered from the contract to the taker. If the
            maker/borrower pays back with interest before the term is up the
            NFT/Objkts are transfered back to the original owner and the loan
            amount + interest - 1% market fee is transfered to the loan
            giver/taker.
          </p>
        </li>
        -
        <p>Q: How to borrow Tezos on Prestamo?</p>
        <li style={{ margin: "18px" }}>
          A: To borrow tezos first sync wallet then choose make from the menu,
          select NFTs/Objkts, click next > and there enter the amount ꜩ to
          borrow, the proposed interest rate and the time/term to pay back. When
          you pay back the ꜩ with interest, the NFT/Objkts are returned from the
          contract to your wallet. If you don't pay in time, the taker of the
          offer can claim your NFT/Objkts as compensation.
        </li> - 
        <p>Q: How to lend Tezos and earn interest?</p>
        <li style={{ margin: "18px" }}>
          A: To lend Tezos and earn the interest rate you have to select one of
          the offers/markets listed, and click accept. If borrower/maker doesn't
          pay you back in the time indicated, you can claim the NFT/Objkts and
          they are transfered to your wallet. Please keep in mind that the
          person who burrowed might not pay you back, so pay close attention to
          the value of the NFT/Objkts left as collateral. For now the interest
          is paid in full minus 1% market fees regardless of duration.
        </li>-
        <p>Q: What happens if the borrower doesn't pay the lender back?</p>
        <li style={{ margin: "18px" }}>
          The lender and only the lender can then claim the NFT/Objkts as
          compensation.
        </li>-
        <p>Q: Who has access to the NFTs/Objkts?</p>
        <li>
          The maker can recover the NFTs/Objkts before the the loan is given by
          cancelling the market or by paying back the loan + interest before the
          term is up. The taker can only claim the tokens if the term is up and
          the loan has not been paid back. The contract admin DOES NOT have
          access to the tokens at any time.
        </li>-
        <p>Q: How to get NFT/Objkts to Participate?</p>
        <li>
          If your testnet wallet doesnt have any NFT Objkts you can accept a
          market with a short term - set to minutes for testing - and claim
          NFT/Objkts when the time is up. You can then make a market with those
          for testing. Testnet minting site coming soon. . .
        </li>-
        <p>Q: How to get jakartanet ꜩ?</p>
        <li>Please use faucet link at bottom of page.</li>
        <p />-
        <p>faqs: Drafted by @2box</p>-
        <p />
        <p />
      </div>
    </>
  );
};
