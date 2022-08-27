"""Unit tests for the Prestamo Contract
     Modified from @jagracar

"""

import os
import smartpy as sp

# Import the Fa2Contract, minterContract and PrestamoContract modules
Fa2Contract = sp.io.import_stored_contract("fa2ghostnet")
MinterContract = sp.io.import_stored_contract("minterfa2")
PrestamoContract = sp.io.import_stored_contract("prestamo")


class RecipientContract(sp.Contract):
    """This contract simulates a user that can recive tez transfers.

    It should only be used to test that tez transfers are sent correctly.

    """

    def __init__(self):
        """Initializes the contract.

        """
        self.init()

    @sp.entry_point
    def default(self, unit):
        """Default entrypoint that allows receiving tez transfers in the same
        way as one would do with a normal tz wallet.

        """
        # Define the input parameter data type
        sp.set_type(unit, sp.TUnit)

        # Do nothing, just receive tez
        pass


def get_test_environment():
    # Initialize the test scenario
    scenario = sp.test_scenario()

    # Create the test accounts
    admin = sp.test_account("admin")        
    taker1 = sp.test_account("taker1")
    taker2 = sp.test_account("taker2")

    # Initialize the artists contracts that will receive the royalties
    artist1 = RecipientContract()
    artist2 = RecipientContract()

    scenario += artist1
    scenario += artist2

    # Initialize the FA2 contract
    fa2 = Fa2Contract.FA2(
        administrator=admin.address,
        metadata=sp.utils.metadata_of_url("ipfs://aaa"))
    scenario += fa2

    # Initialize the minter contract
    minter = MinterContract.Minter(
        administrator=admin.address,
        metadata=sp.utils.metadata_of_url("ipfs://bbb"))
    scenario += minter

    # Initialize the prestamo contract
    prestamo = PrestamoContract.Prestamo(
        admin=admin.address,
        metadata=sp.utils.metadata_of_url("ipfs://ccc"),
        fee=sp.nat(100))
    scenario += prestamo

    # Initialize the fee recipient contract
    fees_recipient = RecipientContract()
    scenario += fees_recipient

    # Set the minter contract as the admin of the FA2 contract
    fa2.transfer_administrator(minter.address).run(sender=admin.address)
    minter.accept_fa2_administrator(fa2.address).run(sender=admin.address)

    # Change the prestamo fee recipient
    prestamo.update_fees_recipient(fees_recipient.address).run(sender=admin.address)

    # Save all the variables in a test environment dictionary
    testEnvironment = {
        "scenario": scenario,
        "admin": admin,
        "artist1": artist1,
        "artist2": artist2,
        "taker1": taker1,
        "taker2": taker2,
        "fa2": fa2,
        "minter": minter,
        "prestamo": prestamo,
        "fees_recipient": fees_recipient
        }

    return testEnvironment


@sp.add_test(name="Test make and take")
def test_make_and_take():
    # Get the test environment
    testEnvironment = get_test_environment()
    scenario = testEnvironment["scenario"]
    artist1 = testEnvironment["artist1"]
    taker1 = testEnvironment["taker1"]
    taker2 = testEnvironment["taker2"]
    fa2 = testEnvironment["fa2"]
    minter = testEnvironment["minter"]
    prestamo= testEnvironment["prestamo"]
    fees_recipient = testEnvironment["fees_recipient"]

    # Mint a token
    editions = 10
    royalties = 100
    minter.mint(
        fa2=fa2.address,
        editions=editions,
        metadata={"": sp.utils.bytes_of_string("ipfs://fff")},
        royalties=royalties).run(sender=artist1.address)

    # Add the prestamo contract as an operator to be able to transfer it
    token_id = 0
    fee=100
    fa2.update_operators([sp.variant("add_operator", sp.record(
        owner=artist1.address,
        operator=prestamo.address,
        token_id=token_id))]).run(sender=artist1.address)

    # Check that there are no markets
    scenario.verify(~prestamo.data.markets.contains(0))
    scenario.verify(prestamo.data.counter == 0)
    scenario.verify(prestamo.get_markets_counter() == 0)

    
    # Make markets
    market_id = 1
    amount = sp.tez(100)
    term = sp.int(10)
    interest =100
    tokens=[sp.record(contract_address=fa2.address, token_id=sp.nat(token_id), token_amount=sp.nat(1))]

    prestamo.make_market(
        amount=amount,
        interest=interest,
        term=term,
        tokens=tokens).run(sender=artist1.address)

    # Check that the fa2 ledger information is correct
    scenario.verify(fa2.data.ledger[(artist1.address, token_id)] == editions - 1)
    scenario.verify(fa2.data.ledger[(prestamo.address, token_id)] == 1)

    # Check that the markets big map is correct
    scenario.verify(prestamo.data.markets.contains(0))
    scenario.verify(prestamo.data.markets[0].maker == artist1.address)
    scenario.verify(prestamo.data.markets[0].amount == amount)
    scenario.verify(prestamo.data.markets[0].term == term)
    scenario.verify(prestamo.data.markets[0].interest == interest)
    scenario.verify(prestamo.data.counter == 1)

    # Check that the on-chain views work
    scenario.verify(prestamo.get_market(0).maker == artist1.address)
    scenario.verify(prestamo.get_market(0).term == term)
    scenario.verify(prestamo.get_market(0).interest == interest)
    scenario.verify(prestamo.get_market(0).amount == amount)
    scenario.verify(prestamo.data.markets[0].active)
    scenario.verify(prestamo.get_markets_counter() == 1)

    # Check that taking fails if the taker is maker
    prestamo.take_market(0).run(valid=False, sender=artist1.address, amount=amount )

    # Check that take_market fails if the exact tez amount is not provided
    prestamo.take_market(0).run(valid=False, sender=taker1, amount=(amount - sp.mutez(1)))

    # take_market 
    prestamo.take_market(0).run(sender=taker1, amount=amount)
    # take_market again
    prestamo.take_market(0).run(valid= False, sender=taker2, amount=amount)

    # Check that all the tez have been sent and the markets big map has been updated
    scenario.verify(prestamo.balance == sp.mutez(0))
    tx_fees = sp.split_tokens(amount, fee, 1000)
    scenario.verify(fees_recipient.balance == tx_fees)
    scenario.verify(artist1.balance == amount - tx_fees)



    # Check that the token ledger information is correct
    scenario.verify(fa2.data.ledger[(artist1.address, token_id)] == editions - 1)
    scenario.verify(fa2.data.ledger[(prestamo.address, token_id)] == 1)


@sp.add_test(name="Test make and cancel")
def test_make_and_take():
    # Get the test environment
    testEnvironment = get_test_environment()
    scenario = testEnvironment["scenario"]
    artist1 = testEnvironment["artist1"]
    taker1 = testEnvironment["taker1"]
    taker2 = testEnvironment["taker2"]
    fa2 = testEnvironment["fa2"]
    minter = testEnvironment["minter"]
    prestamo= testEnvironment["prestamo"]
    fees_recipient = testEnvironment["fees_recipient"]

    # Mint a token
    editions = 10
    royalties = 100
    minter.mint(
        fa2=fa2.address,
        editions=editions,
        metadata={"": sp.utils.bytes_of_string("ipfs://fff")},
        royalties=royalties).run(sender=artist1.address)

    # Add the prestamo contract as an operator to be able to transfer it
    token_id = 0
    fee=100
    fa2.update_operators([sp.variant("add_operator", sp.record(
        owner=artist1.address,
        operator=prestamo.address,
        token_id=token_id))]).run(sender=artist1.address)

    # Check that there are no markets
    scenario.verify(~prestamo.data.markets.contains(0))
    scenario.verify(prestamo.data.counter == 0)
    scenario.verify(prestamo.get_markets_counter() == 0)

    
    # Make markets
    market_id = 1
    amount = sp.tez(100)
    term = sp.int(10)
    interest =100
    tokens=[sp.record(contract_address=fa2.address, token_id=sp.nat(token_id), token_amount=sp.nat(1))]

    prestamo.make_market(
        amount=amount,
        interest=interest,
        term=term,
        tokens=tokens).run(sender=artist1.address)

    # cancel_market wrong account
    prestamo.cancel_market(0).run(valid=False, sender=taker1.address)

    # cancel_market 
    prestamo.cancel_market(0).run(sender=artist1.address)
    
    # cancel_market again fail
    prestamo.cancel_market(0).run(valid=False, sender=artist1.address)

    # Check that the token ledger information is correct
    scenario.verify(fa2.data.ledger[(artist1.address, token_id)] == editions)
    scenario.verify(fa2.data.ledger[(prestamo.address, token_id)] == 0)

    # Check that the markets big map is correct
    scenario.verify(prestamo.data.markets.contains(0))
    scenario.verify(prestamo.data.markets[0].active == False)
    scenario.verify(prestamo.data.counter == 1)

    # Check that taking fails if the taker is maker
    prestamo.take_market(0).run(valid=False, sender=taker1.address, amount=amount )


@sp.add_test(name="Test make and take and recover")
def test_make_and_take_and_recover():
    # Get the test environment
    testEnvironment = get_test_environment()
    scenario = testEnvironment["scenario"]
    artist1 = testEnvironment["artist1"]
    taker1 = testEnvironment["taker1"]
    fa2 = testEnvironment["fa2"]
    minter = testEnvironment["minter"]
    prestamo= testEnvironment["prestamo"]
    fees_recipient = testEnvironment["fees_recipient"]

    # Mint a token
    editions = 10
    royalties = 100
    minter.mint(
        fa2=fa2.address,
        editions=editions,
        metadata={"": sp.utils.bytes_of_string("ipfs://fff")},
        royalties=royalties).run(sender=artist1.address)

    # Add the prestamo contract as an operator to be able to transfer it
    token_id = 0
    fee=100
    fa2.update_operators([sp.variant("add_operator", sp.record(
        owner=artist1.address,
        operator=prestamo.address,
        token_id=token_id))]).run(sender=artist1.address)

    # Check that there are no markets
    scenario.verify(~prestamo.data.markets.contains(0))
    scenario.verify(prestamo.data.counter == 0)
    scenario.verify(prestamo.get_markets_counter() == 0)

    # Make markets
    market_id = 1
    amount = sp.tez(100)
    term = sp.int(10)
    interest = 100
    tokens=[sp.record(contract_address=fa2.address, token_id=sp.nat(token_id), token_amount=sp.nat(1))]

    prestamo.make_market(
        amount=amount,
        interest=interest,
        term=term,
        tokens=tokens).run(sender=artist1.address)

    totalInterest = sp.split_tokens(amount, interest, 1000)
    #take_market 
    prestamo.take_market(0).run(sender=taker1.address, amount=amount)

    #recover not maker
    prestamo.recover_market(0).run(valid=False, sender=taker1.address, amount=amount+totalInterest - sp.mutez(1))

    #recover wrong amount
    prestamo.recover_market(0).run(valid=False, sender=artist1.address, amount=amount)
    
    #recover too late
    prestamo.recover_market(0).run(sender=artist1.address, valid=False, amount=amount+totalInterest, now=sp.now.add_minutes(term+1))

    #recover 
    prestamo.recover_market(0).run(sender=artist1.address, amount=amount+totalInterest)

    # Check that all the tez have been sent and the markets big map has been updated
    og_tx_fees = sp.split_tokens(amount, fee, 1000)
    tx_fees = sp.split_tokens(amount+totalInterest, fee, 1000)
    scenario.verify(fees_recipient.balance == (tx_fees+og_tx_fees))

@sp.add_test(name="Test recover")
def test_recover():
    # Get the test environment
    testEnvironment = get_test_environment()
    scenario = testEnvironment["scenario"]
    artist1 = testEnvironment["artist1"]
    taker1 = testEnvironment["taker1"]
    fa2 = testEnvironment["fa2"]
    minter = testEnvironment["minter"]
    prestamo= testEnvironment["prestamo"]
    fees_recipient = testEnvironment["fees_recipient"]

    # Mint a token
    editions = 10
    royalties = 100
    minter.mint(
        fa2=fa2.address,
        editions=editions,
        metadata={"": sp.utils.bytes_of_string("ipfs://fff")},
        royalties=royalties).run(sender=artist1.address)

    # Add the prestamo contract as an operator to be able to swap it
    token_id = 0
    fee=100
    fa2.update_operators([sp.variant("add_operator", sp.record(
        owner=artist1.address,
        operator=prestamo.address,
        token_id=token_id))]).run(sender=artist1.address)

    # Check that there are no markets
    scenario.verify(~prestamo.data.markets.contains(0))
    scenario.verify(prestamo.data.counter == 0)
    scenario.verify(prestamo.get_markets_counter() == 0)

    # Make markets
    market_id = 1
    amount = sp.tez(100)
    term = sp.int(10)
    interest = 100
    tokens=[sp.record(contract_address=fa2.address, token_id=sp.nat(token_id), token_amount=sp.nat(1))]

    prestamo.make_market(
        amount=amount,
        interest=interest,
        term=term,
        tokens=tokens).run(sender=artist1.address)

    totalInterest = sp.split_tokens(amount, interest, 1000)
    #take_market 
    prestamo.take_market(0).run(sender=taker1.address, amount=amount)

    #recover not maker
    prestamo.recover_market(0).run(valid=False, sender=taker1.address, amount=amount+totalInterest - sp.mutez(1))

    #recover wrong amount
    prestamo.recover_market(0).run(valid=False, sender=artist1.address, amount=amount)
    
    #recover too late
    prestamo.recover_market(0).run(sender=artist1.address, valid=False, amount=amount+totalInterest, now=sp.now.add_minutes(term+1))

    #recover 
    prestamo.recover_market(0).run(sender=artist1.address, amount=amount+totalInterest)
    
    #claim fail   
    prestamo.claim_market(0).run(valid=False, now=sp.now.add_minutes(term+1), sender=taker1.address)
    
    # Check that all the tez have been sent and the markets big map has been updated
    og_tx_fees = sp.split_tokens(amount, fee, 1000)
    tx_fees = sp.split_tokens(amount+totalInterest, fee, 1000)
    scenario.verify(fees_recipient.balance == (tx_fees+og_tx_fees))

@sp.add_test(name="Test claim")
def test_make_and_take_and_recover():
    # Get the test environment
    testEnvironment = get_test_environment()
    scenario = testEnvironment["scenario"]
    artist1 = testEnvironment["artist1"]
    taker1 = testEnvironment["taker1"]
    taker2 = testEnvironment["taker2"]
    fa2 = testEnvironment["fa2"]
    minter = testEnvironment["minter"]
    prestamo= testEnvironment["prestamo"]
    fees_recipient = testEnvironment["fees_recipient"]

    # Mint a token
    editions = 10
    royalties = 100
    minter.mint(
        fa2=fa2.address,
        editions=editions,
        metadata={"": sp.utils.bytes_of_string("ipfs://fff")},
        royalties=royalties).run(sender=artist1.address)

    # Add the prestamo contract as an operator to be able to swap it
    token_id = 0
    fee=100
    fa2.update_operators([sp.variant("add_operator", sp.record(
        owner=artist1.address,
        operator=prestamo.address,
        token_id=token_id))]).run(sender=artist1.address)

    # Check that there are no markets
    scenario.verify(~prestamo.data.markets.contains(0))
    scenario.verify(prestamo.data.counter == 0)
    scenario.verify(prestamo.get_markets_counter() == 0)

    # Make markets
    market_id = 1
    amount = sp.tez(100)
    term = sp.int(10)
    interest = 100
    tokens=[sp.record(contract_address=fa2.address, token_id=sp.nat(token_id), token_amount=sp.nat(1))]

    prestamo.make_market(
        amount=amount,
        interest=interest,
        term=term,
        tokens=tokens).run(sender=artist1.address)

    totalInterest = sp.split_tokens(amount, interest, 1000)
    #take_market 
    prestamo.take_market(0).run(sender=taker1.address, amount=amount)

    #claim too soon
    prestamo.claim_market(0).run(valid=False, sender=taker1.address)

    #claim not taker
    prestamo.claim_market(0).run(now=sp.now.add_minutes(term+1), valid=False, sender=taker2.address)

    #claim
    prestamo.claim_market(0).run(now=sp.now.add_minutes(term+1), sender=taker1.address)

    #Check that the fa2 ledger information is correct
    scenario.verify(fa2.data.ledger[(artist1.address, token_id)] == editions -1)
    scenario.verify(fa2.data.ledger[(prestamo.address, token_id)] == 0)
    scenario.verify(fa2.data.ledger[(taker1.address, token_id)] == 1)
   
    #Check market is inactive
    scenario.verify(prestamo.data.markets[0].active == False)
    
    #claim again fail
    prestamo.claim_market(0).run(valid=False, now=sp.now.add_minutes(term+1), sender=taker1.address)

    #recover fail
    prestamo.recover_market(0).run(valid=False, sender=artist1.address, amount=amount+totalInterest)