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
          The borrower makes a prestamo including the amount of ꜩ to borrow, the
          time or term to pay, the interest rate and selects NFT/Objkts that
          will be used as collateral. The tokens are transfered to the Prestamo
          contract as escrow. The prestamo can be cancelled any time before it is
          taken and then the NFT/Objkts are transfered back to the original
          owner/maker.
          <p>
            A lender sees the prestamo request listed and takes it. The loan amount
            minus 1% prestamo fee is transfered to the prestamo maker and the term
            countdown begins. Before the time is up the borrower can
            pay back the loan amount + indicated interest. If the prestamos
            isn't paid back in time, the lender can claim the NFT/Objkts
            from the contract. If the
            prestamo is paid back with interest before the term is up the
            NFT/Objkts are transfered back to the prestamo maker and the loan
            amount + interest minus 1% prestamo fee is transfered to the lender.
          </p>
        </li>
        -
        <p>Q: How to borrow Tezos on Prestamo?</p>
        <li style={{ margin: "18px" }}>
          A: To borrow tezos first sync wallet then choose prestamo from the menu,
          select NFTs/Objkts, click next > and there enter the amount ꜩ to
          borrow, the proposed interest rate and the time/term to pay back. When
          you pay back the ꜩ with full interest, the NFT/Objkts are returned from the
          contract to your wallet. If you don't pay in time, the lender can claim your NFT/Objkts as compensation.
        </li> - 
        <p>Q: How to lend Tezos and earn interest?</p>
        <li style={{ margin: "18px" }}>
          A: To lend Tezos and earn the interest rate you have to select one of
          the prestamo markets listed, and click accept. If the borrower doesn't
          pay you back with full interest in the agreed time, you can claim the 
          NFT/Objkts and they will be transfered to your wallet. Please keep in mind that the
          prestamo might not be paid back, so be sure to research the 
          value of the NFT/Objkts left as collateral. 
           </li>-
        <p>Q: What happens if the borrower doesn't pay the lender back?</p>
        <li style={{ margin: "18px" }}>
          The lender and only the lender can then claim the NFT/Objkts as
          compensation.
        </li>-
        <p>Q: Who has access to the NFTs/Objkts?</p>
        <li>
          Whoever asks for the prestamo can recover the NFTs/Objkts before the loan is given by
          cancelling the prestamo request or, if the loan has been given then by paying 
          back the loan + interest before the term is up. The lender can only 
         claim the tokens if the term is up and the loan has not been paid back.
          The contract admin DOES NOT have access to the tokens at any time.
        </li>-
        <p>Q: How to get NFT/Objkts to Participate?</p>
        <li>
          If your testnet wallet doesn't have any NFT/Objkts then the easiest way now is
          to mint new NFT/Obkts on the mint page - link in menu. Another way is to accept
          a prestamo with a short term - they are set to minutes for testing - and claim the
          NFT/Objkts when the time is up. You can then ask for a prestamo with those
          for testing. 
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
